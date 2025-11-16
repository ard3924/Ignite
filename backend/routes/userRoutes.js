const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { BaseUser, Freelancer, Client } = require('../models/userModel');
const projectModel = require('../models/projectModel');
const { sendPasswordResetOTP } = require('../db/mailer');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//post data
router.post('/signup', async (req, res) => {
    try {
        // The 'skills' property is now expected to be an array.
        const { name, email, password, role, groupName, skills, social, captchaToken } = req.body;

        // Verify reCAPTCHA
        const recaptchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captchaToken

            }
        });

        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }

        const existingUser = await BaseUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        let newUser;
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            groupName,
        };

        if (role === 'Freelancer') {
            userData.skills = Array.isArray(skills) ? skills : [];
            userData.social = social || {};
            newUser = new Freelancer(userData);
        } else if (role === 'Client') {
            newUser = new Client(userData);
        } else {
            newUser = new BaseUser(userData); // Create a base user for other roles like 'Admin'
        }

        await newUser.save();

        res.status(201).json({ message: "Signup successful. Please log in." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during signup" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await BaseUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { userId: user._id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

// @route   POST /api/user/forgot-password
// @desc    Send OTP to reset password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await BaseUser.findOne({ email });

        if (!user) {
            // To prevent email enumeration, we send a success response even if the user doesn't exist.
            return res.status(200).json({ message: 'If a user with that email exists, an OTP has been sent.' });
        }

        // 1. Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Set OTP and expiration on the user model
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        await user.save({ validateBeforeSave: false });

        // 3. Send the email with OTP
        await sendPasswordResetOTP(user.email, otp);

        res.status(200).json({ message: 'If a user with that email exists, an OTP has been sent.' });
    } catch (error) {
        // In case of an error, clear the OTP fields to be safe
        if (user) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

// @route   POST /api/user/verify-otp
// @desc    Verify OTP and reset password
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await BaseUser.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'OTP is invalid or has expired.' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while resetting the password.' });
    }
});

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await BaseUser.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pics',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

const upload = multer({ storage: storage });

router.put('/profile', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const userData = JSON.parse(req.body.user);

        if (req.file) {
            // req.file.path contains the Cloudinary URL
            userData.image = req.file.path;
        }

        // Use the specific model based on role to ensure discriminator fields are updated
        const UserModel = req.user.role === 'Freelancer' ? Freelancer : Client;
        const updatedUser = await UserModel.findByIdAndUpdate(req.user.userId, userData, { new: true }).select('-password');

        // Generate a new token with the updated user info
        const payload = { userId: updatedUser._id, email: updatedUser.email, role: updatedUser.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Profile updated successfully', user: updatedUser, token: token });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get public user profile
router.get('/public-profile/:userId', async (req, res) => {
    try {
        let selection = '-password';
        const requestedUser = await BaseUser.findById(req.params.userId).select('role'); // Peek at the role first
        if (requestedUser && requestedUser.role !== 'Freelancer') {
            selection += ' -email'; // Exclude email for non-freelancers
        }
        const user = await BaseUser.findById(req.params.userId).select(selection);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Public profile fetch error:', error);
        res.status(500).json({ message: 'Error fetching public profile' });
    }
});

// Delete user account
router.delete('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await BaseUser.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is a client, delete all their projects
        if (user.role === 'Client') {
            await projectModel.deleteMany({ createdBy: userId });
        }

        await BaseUser.findByIdAndDelete(userId);

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting account' });
    }
});

module.exports = router;
