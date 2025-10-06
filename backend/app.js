const express = require('express')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT
const morgan = require('morgan')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const methodOverride = require('method-override');
const connectDB = require('./db/connection')
const path = require('path')
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Serve uploads folder statically
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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

startServer();
