const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required.'],
        trim: true
    },
    quote: {
        type: String,
        required: [true, 'Testimonial quote is required.']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required.'],
        min: 1,
        max: 5
    },
    avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
    },
    visible: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;