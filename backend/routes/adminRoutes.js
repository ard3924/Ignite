const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { BaseUser } = require('../models/userModel');
const ProjectModel = require('../models/projectModel');
const Testimonial = require('../models/testimonialModel');

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

// Middleware to check for Admin role
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

// GET all users (Admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await BaseUser.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// GET user statistics (Admin only)
router.get('/stats/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalUsers = await BaseUser.countDocuments();
        const totalFreelancers = await BaseUser.countDocuments({ role: 'Freelancer' });
        const totalClients = await BaseUser.countDocuments({ role: 'Client' });
        const totalAdmins = await BaseUser.countDocuments({ role: 'Admin' });

        const recentUsers7Days = await BaseUser.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentUsers30Days = await BaseUser.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Get daily registration stats for the last 7 days
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const freelancers = await BaseUser.countDocuments({
                role: 'Freelancer',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });
            const clients = await BaseUser.countDocuments({
                role: 'Client',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            dailyStats.push({
                date: startOfDay.toISOString().split('T')[0],
                freelancers,
                clients,
                total: freelancers + clients
            });
        }

        res.json({
            total: totalUsers,
            freelancers: totalFreelancers,
            clients: totalClients,
            admins: totalAdmins,
            recent7Days: recentUsers7Days,
            recent30Days: recentUsers30Days,
            dailyStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
    }
});

// GET all projects (Admin only)
router.get('/projects', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const projects = await ProjectModel.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
});

// GET all applicants (Admin only)
router.get('/applicants', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const projects = await ProjectModel.find().populate('createdBy', 'name email').populate('applicants.userId', 'name email role image bio skills social');
        const allApplicants = [];
        projects.forEach(project => {
            project.applicants.forEach(applicant => {
                allApplicants.push({
                    ...applicant.toObject(),
                    projectId: { _id: project._id, title: project.title },
                    project: project
                });
            });
        });
        allApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        res.json(allApplicants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applicants', error: error.message });
    }
});

// GET all testimonials (Admin only)
router.get('/testimonials', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching testimonials', error: error.message });
    }
});

// PATCH update testimonial visibility (Admin only)
router.patch('/testimonials/:id/visibility', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { visible } = req.body;
    try {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found.' });
        }
        testimonial.visible = visible;
        await testimonial.save();
        res.json({ message: 'Testimonial visibility updated.', testimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error updating testimonial visibility', error: error.message });
    }
});

// PATCH update applicant status (Admin only)
router.patch('/applicants/:projectId/:applicantId/status', authMiddleware, adminMiddleware, async (req, res) => {
    const { projectId, applicantId } = req.params;
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }
    try {
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        const applicant = project.applicants.id(applicantId);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found.' });
        }
        applicant.status = status;
        await project.save();
        res.json({ message: 'Applicant status updated.', applicant });
    } catch (error) {
        res.status(500).json({ message: 'Error updating applicant status', error: error.message });
    }
});

// PATCH update project featured status (Admin only)
router.patch('/projects/:id/featured', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { featured } = req.body;

    try {
        const project = await ProjectModel.findByIdAndUpdate(id, { featured }, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project featured status', error: error.message });
    }
});

module.exports = router;
