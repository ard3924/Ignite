const express = require('express')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const connectDB = require('./db/connection')
const path = require('path')
app.use(morgan('dev'))
app.use(cors())
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      // Allow images from Cloudinary (you already had this)
      "img-src": ["'self'", "data:", "res.cloudinary.com"],
      
      // Allow scripts from Google reCAPTCHA
      "script-src": ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
      
      // Allow iframes from Google reCAPTCHA (required for the widget)
      "frame-src": ["'self'", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/"],
    },
  })
);
app.use(express.json())

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
    })
};

app.use('/api/user', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/notifications', notificationRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/admin', adminRoutes);
//for production
app.use(express.static(path.join(__dirname, 'build')));

// This makes sure that any non-API route serves the React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
startServer();
