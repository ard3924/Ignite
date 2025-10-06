const express = require('express');
const router = express.Router();
const Testimonial = require('../models/testimonialModel');

// POST a new testimonial
router.post('/', async (req, res) => {
    try {
        const { name, role, quote, rating } = req.body;
        if (!name || !role || !quote || !rating) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newTestimonial = new Testimonial({ name, role, quote, rating });
        await newTestimonial.save();

        res.status(201).json({ message: 'Thank you for your feedback!', testimonial: newTestimonial });
    } catch (error) {
        console.error('Testimonial submission error:', error);
        res.status(500).json({ message: 'Failed to submit testimonial.', error: error.message });
    }
});

// GET all testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ visible: true }).sort({ createdAt: -1 }).limit(10);
        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Failed to fetch testimonials.' });
    }
});

module.exports = router;