const nodemailer = require('nodemailer');

// It's highly recommended to use environment variables for your email credentials
// and not hardcode them, especially for production.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // e.g., 'smtp.gmail.com'
    port: process.env.EMAIL_PORT || 587, // 587 for TLS, 465 for SSL
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email password or app-specific password
    },
});

const sendPasswordResetOTP = async (to, otp) => {
    const mailOptions = {
        from: `"Ignite" <${process.env.EMAIL_USER}>`, // sender address
        to: to, // list of receivers
        subject: 'Password Reset OTP', // Subject line
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nYour OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`, // plain text body
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
               <p>Your OTP code is: <strong>${otp}</strong></p>
               <p>This code will expire in 10 minutes.</p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`, // html body
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetOTP };
