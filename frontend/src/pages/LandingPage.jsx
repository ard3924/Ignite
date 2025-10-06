import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Briefcase, Search, CheckCircle, ArrowRight, Calendar, Code2, Lightbulb } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import axiosInstance from '../axiosInterceptor';

const FeatureCard = ({ imageSrc, title, description }) => (
    <Card className="flex flex-col text-center hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:scale-105">
        <img src={imageSrc} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </Card>
);

const TestimonialCard = ({ quote, name, role }) => (
    <Card className="hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="flex-grow">
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{quote}"</p>
        </div>
        <div className="font-bold text-gray-900 dark:text-white mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">{name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{role}</div>
    </Card>
);

const StepCard = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="p-4 bg-indigo-100 dark:bg-gray-700 rounded-full mb-4 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const FeaturedProjectCard = ({ project }) => (
    <Card className="flex flex-col text-left hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group h-full">
        <div className="flex-grow">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Briefcase size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-3">
                {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
                {project.skillsRequired.slice(0, 3).map((skill, index) => (
                    <span key={index} className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                        {skill}
                    </span>
                ))}
                {project.skillsRequired.length > 3 && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">+ {project.skillsRequired.length - 3} more</span>
                )}
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link to="/projects" className="w-full">
                <button className="w-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    View Project <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </button>
            </Link>
        </div>
    </Card>
);

const FreelancerCtaSection = () => (
    <motion.div
        className="px-4 sm:px-6 lg:px-8 my-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.4 }}
    >
        <div className="bg-gradient-to-l from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-3xl font-extrabold mb-3">Ready to showcase your skills?</h3>
                    <p className="text-pink-100 mb-6 max-w-lg">
                        Join our community of talented freelancers and find projects that ignite your passion.
                    </p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center"><CheckCircle size={20} className="mr-3 text-pink-200" /> Find exciting projects that match your expertise.</li>
                        <li className="flex items-center"><CheckCircle size={20} className="mr-3 text-pink-200" /> Collaborate with innovative clients and teams.</li>
                        <li className="flex items-center"><CheckCircle size={20} className="mr-3 text-pink-200" /> Build your portfolio and grow your career.</li>
                    </ul>
                    <Link to="/signup">
                        <motion.button
                            className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition-all duration-300 transform flex items-center"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Join as a Freelancer
                        </motion.button>
                    </Link>
                </div>
                <div className="hidden md:flex justify-center items-center">
                    <Code2 size={128} className="text-white/20" />
                </div>
            </div>
        </div>
    </motion.div>
);

const ClientCtaSection = () => (
    <motion.div
        className="px-4 sm:px-6 lg:px-8 my-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="hidden md:flex justify-center items-center">
                    <Lightbulb size={128} className="text-white/20" />
                </div>
                <div className="text-left md:text-right">
                    <h3 className="text-3xl font-extrabold mb-3">Have a project in mind?</h3>
                    <p className="text-indigo-100 mb-6 max-w-lg ml-auto">
                        Join our platform as a client to connect with skilled freelancers ready to bring your ideas to life.
                    </p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center justify-end">Post projects and define requirements with ease.<CheckCircle size={20} className="ml-3 text-green-300" /></li>
                        <li className="flex items-center justify-end">Browse profiles of talented freelancers.<CheckCircle size={20} className="ml-3 text-green-300" /></li>
                        <li className="flex items-center justify-end">Manage applicants and build your dream team.<CheckCircle size={20} className="ml-3 text-green-300" /></li>
                    </ul>
                    <Link to="/signup">
                        <motion.button
                            className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition-all duration-300 transform flex items-center ml-auto"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign Up as a Client
                        </motion.button>
                    </Link>
                </div>
            </div>
        </div>
    </motion.div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const [testimonials, setTestimonials] = useState([]);
    const [projects, setProjects] = useState([]);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await axiosInstance.get('/testimonials');
                setTestimonials(response.data);
            } catch (error) {
                console.error("Could not fetch testimonials", error);
                // You could set default testimonials here as a fallback
            }
        };

        fetchTestimonials();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axiosInstance.get('/projects');
                // Filter only featured projects for the feature section
                const featuredProjects = response.data.filter(p => p.featured);
                setProjects(featuredProjects.slice(0, 3));
            } catch (error) {
                console.error("Could not fetch featured projects", error);
            }
        };
        fetchProjects();
    }, []);
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="bg-white dark:bg-gray-900 pt-10">
            <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-center text-white px-4">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" alt="Team collaborating" className="absolute inset-0 w-full h-full object-cover" />
                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg bg-gradient-to-r from-white to-purple-300 text-transparent bg-clip-text">
                        Where Great Ideas Meet Great Talent
                    </h2>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 drop-shadow-md">
                        Join a community of passionate freelancers and innovative clients. Your next big opportunity is just a click away.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            onClick={() => navigate('/signup')}
                            className="text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[400%_auto] animate-text-gradient hover:shadow-indigo-500/50"
                            whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px rgb(99 102 241 / 0.8)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            Join Ignite
                        </motion.button>
                        <Link to="/projects">
                            <motion.button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-white/30 transition-all duration-300 transform" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                Explore Projects
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
                    Built for Collaboration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                        title="Find Your Crew"
                        description="Discover group projects that align with your skills and interests. Connect with like-minded freelancers and build your professional network."
                    />
                    <FeatureCard
                        imageSrc="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                        title="Build Something Great"
                        description="Collaborate on a project from start to finish. Our tools help you manage tasks, share code, and communicate effectively with your team."
                    />
                    <FeatureCard
                        imageSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                        title="Showcase Your Work"
                        description="Build a portfolio of completed projects to showcase your talent. Get recognized and attract new opportunities based on your contributions."
                    />
                </div>
            </motion.div>

            <motion.div
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                    <StepCard
                        icon={<Users size={32} />}
                        title="1. Create Your Profile"
                        description="Sign up as a freelancer or a client and build a profile that stands out."
                    />
                    <StepCard
                        icon={<Briefcase size={32} />}
                        title="2. Post or Find Projects"
                        description="Clients post project needs, and freelancers browse opportunities that match their skills."
                    />
                    <StepCard
                        icon={<Search size={32} />}
                        title="3. Assemble Your Team"
                        description="Clients review applicants, and freelancers apply to join exciting group projects."
                    />
                    <StepCard
                        icon={<CheckCircle size={32} />}
                        title="4. Build & Deliver"
                        description="Collaborate with your new team to bring your project to life."
                    />
                </div>
            </motion.div>

            {projects.length > 0 && (
                <motion.div
                    className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Featured Projects
                        </h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Get a glimpse of the exciting opportunities on Ignite.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => (
                            <FeaturedProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                </motion.div>
            )}

            <motion.div
                className="bg-gray-50 dark:bg-gray-800/50 py-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
                        Hiring Made Easy
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            imageSrc="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                            title="Post Your Project"
                            description="Describe your project, specify the required skills, and set your budget. Our platform makes it easy to create a detailed project listing."
                        />
                        <FeatureCard
                            imageSrc="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                            title="Discover Talent"
                            description="Browse through profiles of skilled freelancers. Review their past projects, skills, and ratings to find the perfect fit for your team."
                        />
                        <FeatureCard
                            imageSrc="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                            title="Collaborate & Manage"
                            description="Use our built-in tools to manage your project, communicate with your team, and track progress from start to finish."
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="bg-gray-100 dark:bg-gray-800 py-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
                        What Our Users Say
                    </h2>
                    {testimonials.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {testimonials.slice(0, 2).map(testimonial => (
                                <TestimonialCard key={testimonial._id} {...testimonial} />
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500">No testimonials yet. Be the first to share your story!</p>}
                </div>
            </motion.div>

            <motion.div
                className="container mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <FreelancerCtaSection />
                <ClientCtaSection />
            </motion.div>
        </div>
    );
};

export default LandingPage;
