
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: { type: [String], required: true },
    type: { type: String },
    deadline: { type: Date },
    image: { type: String },
    featured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser' },
    applicants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser', required: true },
        coverLetter: { type: String, required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        appliedAt: { type: Date, default: Date.now },
        tasks: [{
            description: { type: String, required: true },
            completed: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }]
    }],
    submissions: [{
        freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser', required: true },
        message: { type: String, required: true },
        link: { type: String },
        submittedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'approved', 'changes_requested'], default: 'pending' },
        clientFeedback: { type: String },
        githubUrl: { type: String }
    }],
});

module.exports = mongoose.model('projects', projectSchema);