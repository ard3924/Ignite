const mongoose = require('mongoose');

// Options for the discriminator key
const baseOptions = {
    discriminatorKey: 'role', // our discriminator key, could be anything
    collection: 'users', // the name of our collection
};

// Base user schema with common fields
const baseUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groupName: { type: String, default: '' },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    otp: String,
    otpExpires: Date,
}, baseOptions);

const BaseUser = mongoose.model('BaseUser', baseUserSchema);

// Freelancer schema with specific fields
const freelancerSchema = new mongoose.Schema({
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    social: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    rating: {
        value: { type: Number, default: 0 },
        reviews: { type: Number, default: 0 },
    },
    pastProjects: [{
        title: { type: String },
        role: { type: String },
        link: { type: String }
    }]
})

const Freelancer = BaseUser.discriminator('Freelancer', freelancerSchema);
const Client = BaseUser.discriminator('Client', new mongoose.Schema({}));

module.exports = { BaseUser, Freelancer, Client };
