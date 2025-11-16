import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, Users, Lightbulb, Award, Briefcase, CheckCircle, Mail, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import axiosInstance from '../axiosInterceptor';
import { useAuth } from '../hooks/AuthContext';

// Import local image
import aboutBgImg from '../assets/aboutpagebgimg.avif';

const TestimonialForm = () => {
    const { isLoggedIn, user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({ name: '', role: '', quote: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please provide a rating.');
            return;
        }
        setIsSubmitting(true);
        try {
            const submissionData = { ...formData, rating };

            if (isLoggedIn) {
                submissionData.email = user.email;
            } else if (!formData.email) {
                toast.error('Please provide your email address.');
                setIsSubmitting(false);
                return;
            }
            const response = await axiosInstance.post('/testimonials', submissionData);
            toast.success(response.data.message || 'Feedback submitted!');
            setFormData({ name: '', role: '', quote: '', email: '' });
            setRating(0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mt-12 relative">
            <Link to="/home" className="absolute top-4 left-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
                <ArrowLeft size={24} />
            </Link>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Share Your Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Let us know what you think about Ignite!
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                    <span className="text-gray-700 dark:text-gray-300 mr-4">Your Rating:</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none"
                            >
                                <Star
                                    size={24}
                                    className={`transition-colors duration-200 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    fill="currentColor"
                                    stroke="none"
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <div className={`grid grid-cols-1 ${!isLoggedIn ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" required />
                    <input type="text" name="role" value={formData.role} onChange={handleInputChange} placeholder="Your Role (e.g., Frontend Developer)" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" required />
                    {!isLoggedIn && (
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Your Email" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" required />
                        </div>
                    )}
                </div>
                <textarea name="quote" value={formData.quote} onChange={handleInputChange} placeholder="Share your story..." className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none" required></textarea>
                <div className="text-center">
                    <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit Testimonial'}</button>
                </div>
            </form>
        </Card>
    );
};

const ValueCard = ({ icon, title, description }) => (
    <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
        <div className="p-5 rounded-full bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 mb-5">
            {icon}
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Card>
);

const ContactSection = ({ variants }) => (
    <motion.div
        id="get-in-touch"
        className="py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={variants}
    >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Get In Touch
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We’d love to hear from you! Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
                </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                    <Mail size={32} className="mx-auto text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Drop us a line and we'll get back to you as soon as we can.</p>
                    <a href="mailto:contact@ignite.com" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        contact@ignite.com
                    </a>
                </Card>
                <Card className="p-8 text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                    <Users size={32} className="mx-auto text-purple-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Follow Us</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Connect with us on social media for the latest updates.</p>
                    <div className="flex justify-center gap-6">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={28} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Linkedin size={28} /></a>
                    </div>
                </Card>
            </div>
        </div>
    </motion.div>
);

const AboutPage = () => {
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <motion.section
            className="py-20 bg-gray-50 dark:bg-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="grid md:grid-cols-2 gap-12 items-center mb-24"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                >
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            About Ignite
                        </h2>
                        <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p>
                                Ignite was born out of a simple idea: that great projects are built by passionate people working together. In a world of isolated gigs and solo projects, we saw the need for a platform where IT freelancers could not just find work, but find their crew. A place where you can collaborate on projects that truly matter to you, share your skills, and build a network of peers who understand the grind.
                            </p>
                            <p>
                                Our mission is to fuel your passion. By connecting you with like-minded individuals, we empower you to turn a simple idea into a stunning reality. Whether you’re a coder, a designer, a data scientist, or a project manager, Ignite provides the space for your talent to shine.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <img src={aboutBgImg} alt="Team collaborating on a project" className="rounded-2xl shadow-2xl" />
                    </div>
                </motion.div>

                <motion.div
                    className="py-24 bg-white dark:bg-gray-800/20 rounded-3xl"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                >
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Our Core Values
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            The principles that guide our mission to connect talent with opportunity.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={<Users size={32} />}
                            title="Collaboration"
                            description="We believe the best ideas come from working together. We foster a community where everyone has a voice."
                        />
                        <ValueCard
                            icon={<Lightbulb size={32} />}
                            title="Innovation"
                            description="We are driven by curiosity and a desire to push boundaries. We constantly seek new and better ways to solve problems."
                        />
                        <ValueCard
                            icon={<Award size={32} />}
                            title="Excellence"
                            description="We are committed to quality in everything we do. We set high standards and strive to exceed them."
                        />
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="py-24 bg-gray-100 dark:bg-gray-800/50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Why Join Ignite?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            Discover the advantages of being part of our vibrant community.
                        </p>
                    </div>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.2, delayChildren: 0.2 }
                            }
                        }}
                    >
                        {/* Freelancer Benefits Card */}
                        <motion.div variants={sectionVariants}>
                            <Card className="p-8 transform hover:-translate-y-2 transition-transform duration-300 h-full">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-full mr-4">
                                        <Users size={24} className="text-indigo-600 dark:text-indigo-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Freelancers</h3>
                                </div>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>Find exciting group projects that match your expertise and passion.</span></li>
                                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>Collaborate with innovative clients and build your professional network.</span></li>
                                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>Showcase your contributions and build a powerful, project-based portfolio.</span></li>
                                </ul>
                            </Card>
                        </motion.div>
                        {/* Client Benefits Card */}
                        <motion.div variants={sectionVariants}>
                            <Card className="p-8 transform hover:-translate-y-2 transition-transform duration-300 h-full">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full mr-4">
                                        <Briefcase size={24} className="text-purple-600 dark:text-purple-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Clients</h3>
                                </div>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>Post projects with detailed requirements and attract top-tier talent.</span></li>
                                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>Browse profiles of skilled freelancers and find the perfect fit for your team.</span></li>
                                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>Manage applicants and collaborate seamlessly with our built-in tools.</span></li>
                                </ul>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            <ContactSection variants={sectionVariants} />

            <motion.div
                className="container mx-auto px-4 sm:px-6 lg:px-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <div className="py-12">
                    <TestimonialForm />
                </div>
            </motion.div>
        </motion.section>
    );
};

export default AboutPage;
