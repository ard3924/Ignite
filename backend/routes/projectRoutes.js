const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const projectModel = require('../models/projectModel');
const Notification = require('../models/notificationModel');

// Middleware to verify JWT - copied from userRoutes for now
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

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await projectModel.find()
            .populate('createdBy', 'name image groupName bio') // Populate client info
            .sort({ createdAt: -1 });
        res.json(projects); // Send projects with populated client data
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
    try {
        let project = await projectModel.findById(req.params.id).populate('createdBy', 'name image groupName bio');

        // Conditionally populate contact details
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const acceptedApplicant = project.applicants.find(
                    app => app.userId.toString() === decoded.userId && app.status === 'accepted'
                );

                // If the user is an accepted applicant, populate the sensitive details
                if (acceptedApplicant) {
                    project = await project.populate({
                        path: 'createdBy',
                        select: 'name image groupName bio email social.linkedin'
                    });
                }
            } catch (e) { /* Ignore token errors, just don't populate sensitive data */ }
        }

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project' });
    }
});

// Create a new project (Protected Route)
router.post('/', authMiddleware, async (req, res) => {
    // Ensure the user is a 'Client'
    if (req.user.role !== 'Client') {
        return res.status(403).json({ message: 'Only clients can create projects.' });
    }
    try {
        const newProject = new projectModel({
            ...req.body,
            createdBy: req.user.userId // Link project to the user who created it
        });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: 'Error creating project', error: error.message });
    }
});

// Update a project (Protected Route)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await projectModel.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security Check: Ensure the user updating the project is the one who created it.
        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this project.' });
        }

        const updatedProject = await projectModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({ message: 'Project updated successfully', project: updatedProject });

    } catch (error) {
        res.status(400).json({ message: 'Error updating project', error: error.message });
    }
});

// Delete a project (Protected Route)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await projectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security Check: Ensure the user deleting the project is the one who created it.
        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this project.' });
        }

        // Notify applicants before deleting
        if (project.applicants && project.applicants.length > 0) {
            const notifications = project.applicants.map(applicant => ({
                userId: applicant.userId,
                message: `The project "${project.title}" you applied for has been deleted by the client.`
            }));
            await Notification.insertMany(notifications);
        }

        const deletedProject = await projectModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project' });
    }
});

// Apply to a project (Protected Route for Freelancers)
router.post('/:id/apply', authMiddleware, async (req, res) => {
    // Ensure the user is a Freelancer
    if (req.user.role !== 'Freelancer') {
        return res.status(403).json({ message: 'Only freelancers can apply to projects.' });
    }

    const { coverLetter } = req.body;
    if (!coverLetter) {
        return res.status(400).json({ message: 'A cover letter is required.' });
    }

    try {
        const project = await projectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the user has already applied
        const hasApplied = project.applicants.some(applicant => applicant.userId.toString() === req.user.userId);
        if (hasApplied) {
            return res.status(409).json({ message: 'You have already applied to this project.' });
        }

        // Add new applicant
        project.applicants.push({
            userId: req.user.userId,
            coverLetter: coverLetter,
            status: 'pending' // Default status
        });

        await project.save();

        // Notify the client about the new application
        const notificationMessage = `You have a new applicant for your project "${project.title}".`;
        await Notification.create({
            userId: project.createdBy,
            message: notificationMessage,
            link: `/projects/${project._id}/applicants`
        });

        res.status(200).json({ message: 'Application submitted successfully!', project });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});

// Get all applications for the logged-in freelancer
router.get('/my-applications/list', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Freelancer') {
        return res.status(403).json({ message: 'Access denied. Only freelancers can view their applications.' });
    }

    try {
        // Find all projects where the current user has applied
        const projects = await projectModel.find({ 'applicants.userId': req.user.userId })
            .select('title description deadline applicants submissions') // Select fields we need
            .sort({ 'applicants.appliedAt': -1 });

        // Transform the data to be more application-centric
        const applications = projects.map(project => {
            const userApplication = project.applicants.find(app => app.userId.toString() === req.user.userId);
            // Check if there is a submission from this user for this project (get the latest one)
            const userSubmissions = project.submissions?.filter(sub => sub.freelancerId.toString() === req.user.userId);
            const userSubmission = userSubmissions?.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
            // Get the latest feedback from any submission
            const latestFeedback = userSubmissions
                ?.filter(sub => sub.clientFeedback)
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]?.clientFeedback;
            return {
                _id: userApplication._id, // Pass application ID
                projectId: project._id,
                projectTitle: project.title,
                projectDescription: project.description,
                status: userApplication.status,
                hasSubmitted: !!userSubmission, // Add this flag
                submission: userSubmission ? {
                    _id: userSubmission._id,
                    status: userSubmission.status,
                    clientFeedback: latestFeedback, // Include latest feedback
                    submittedAt: userSubmission.submittedAt
                } : null,
                tasks: userApplication.tasks,
                appliedAt: userApplication.appliedAt,
            };
        });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your applications', error: error.message });
    }
});

// Get all projects created by the logged-in client
router.get('/my-projects/list', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Client') {
        return res.status(403).json({ message: 'Access denied. Only clients can view their projects.' });
    }

    try {
        // Find projects where 'createdBy' matches the logged-in user's ID
        const projects = await projectModel.find({ createdBy: req.user.userId })
            .populate('createdBy', 'name image groupName bio')
            .populate({
                path: 'applicants.userId',
                model: 'BaseUser',
                select: 'name email skills image role bio social' // Populate applicant details
            })
            .populate({
                path: 'submissions.freelancerId',
                model: 'BaseUser',
                select: 'name image'
            })
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your projects', error: error.message });
    }
});

// Get a single project with populated applicant details (for project owner)
router.get('/:id/applications', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Client') {
        return res.status(403).json({ message: 'Access denied. Only clients can view applications.' });
    }

    try {
        const project = await projectModel.findById(req.params.id)
            .populate({
                path: 'applicants.userId',
                model: 'BaseUser', // Corrected model name
                select: 'name email skills image rating role bio pastProjects social' // Fields to fetch for each applicant
            });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security Check: Ensure the person requesting is the one who created the project
        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to view applications for this project.' });
        }

        res.json(project);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Get all projects for a specific user (public)
router.get('/user/:userId', async (req, res) => {
    try {
        const projects = await projectModel.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user projects', error: error.message });
    }
});

// Update an application's status (Accept/Reject)
router.patch('/:projectId/applications/:applicationId/status', authMiddleware, async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const { projectId, applicationId } = req.params;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update.' });
    }

    try {
        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Security check: only project owner can change status
        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to modify applications for this project.' });
        }

        const application = project.applicants.id(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Update status
        application.status = status;

        await project.save();

        // Notify the freelancer about the status change
        const notificationMessage = `Your application for the project "${project.title}" has been ${status}.`;
        await Notification.create({
            userId: application.userId,
            message: notificationMessage,
            link: '/my-applications'
        });

        res.json({ message: `Application has been ${status}.`, applicant: application });

    } catch (error) {
        res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
});

// --- Task Management Routes ---

// Add a task to an applicant
router.post('/:projectId/applications/:applicationId/tasks', authMiddleware, async (req, res) => {
    const { description } = req.body;
    const { projectId, applicationId } = req.params;

    if (!description) {
        return res.status(400).json({ message: 'Task description is required.' });
    }

    try {
        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to add tasks to this project.' });
        }

        const application = project.applicants.id(applicationId);
        if (!application) return res.status(404).json({ message: 'Application not found.' });

        if (application.status !== 'accepted') {
            return res.status(400).json({ message: 'Tasks can only be added for accepted applicants.' });
        }

        application.tasks.push({ description });
        await project.save();

        // Notify freelancer about the new task
        await Notification.create({
            userId: application.userId,
            message: `You have a new task for the project "${project.title}".`,
            link: `/my-applications` // Or a future dedicated task page
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error adding task', error: error.message });
    }
});

// Update a task (e.g., toggle completion)
router.patch('/:projectId/applications/:applicationId/tasks/:taskId', authMiddleware, async (req, res) => {
    const { completed } = req.body;
    const { projectId, applicationId, taskId } = req.params;

    try {
        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        const application = project.applicants.id(applicationId);
        if (!application) return res.status(404).json({ message: 'Application not found.' });

        // Allow either the project creator (Client) or the assigned freelancer to update the task
        if (project.createdBy.toString() !== req.user.userId && application.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to update tasks for this project.' });
        }

        const task = application.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found.' });

        task.completed = completed;
        await project.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

// Delete a task
router.delete('/:projectId/applications/:applicationId/tasks/:taskId', authMiddleware, async (req, res) => {
    const { projectId, applicationId, taskId } = req.params;

    try {
        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete tasks for this project.' });
        }

        await projectModel.updateOne({ _id: projectId, 'applicants._id': applicationId }, { $pull: { 'applicants.$.tasks': { _id: taskId } } });

        res.json({ message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

// Submit work for a project
router.post('/:projectId/submit', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Freelancer') {
        return res.status(403).json({ message: 'Only freelancers can submit work.' });
    }

    const { projectId } = req.params;
    const { message, link, githubUrl } = req.body;

    if (!message || !githubUrl) { // link is now optional
        return res.status(400).json({ message: 'A submission message and GitHub URL are required.' });
    }

    try {
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const isAccepted = project.applicants.some(app => app.userId.toString() === req.user.userId && app.status === 'accepted');
        if (!isAccepted) {
            return res.status(403).json({ message: 'You are not an accepted freelancer for this project.' });
        }

        project.submissions.push({
            freelancerId: req.user.userId,
            message,
            link,
            githubUrl,
        });

        await project.save();

        await Notification.create({
            userId: project.createdBy,
            message: `A freelancer has submitted work for your project "${project.title}".`,
            link: `/team` // Or a future dedicated submissions page for clients
        });

        res.status(200).json({ message: 'Work submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting work.', error: error.message });
    }
});

// Update a submission's status (Approve/Request Changes)
router.patch('/:projectId/submissions/:submissionId/status', authMiddleware, async (req, res) => {
    const { status, feedback } = req.body; // 'approved' or 'changes_requested'
    const { projectId, submissionId } = req.params;

    if (!['approved', 'changes_requested'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update.' });
    }
    if (status === 'changes_requested' && !feedback) {
        return res.status(400).json({ message: 'Feedback is required when requesting changes.' });
    }

    try {
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Security check: only project owner can change status
        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to review submissions for this project.' });
        }

        const submission = project.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        submission.status = status;
        if (status === 'changes_requested') {
            submission.clientFeedback = feedback; // This was already correct, just confirming
        }

        await project.save();

        // Notify the freelancer about the review
        const notificationMessage = `Your submission for "${project.title}" has been ${status.replace('_', ' ')}.`;
        await Notification.create({
            userId: submission.freelancerId,
            message: notificationMessage,
            link: '/my-tasks'
        });

        res.json({ message: `Submission status updated to ${status}.`, project });
    } catch (error) {
        res.status(500).json({ message: 'Error updating submission status.', error: error.message });
    }
});

module.exports = router;