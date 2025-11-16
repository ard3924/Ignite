import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Github, Linkedin, Star, Briefcase, Mail, User, Code, Edit, Save, XCircle, Trash2, PlusCircle, LoaderCircle, LogIn, ExternalLink, TrendingUp, Camera, Building, Users, Lock, Check, LinkedinIcon, GithubIcon, AlertTriangle, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import axiosInstance from '../axiosInterceptor';
import { useAuth } from '../hooks/AuthContext.jsx';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';
import axios from 'axios';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    // eslint-disable-next-line no-unused-vars
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={circumference - (percentage / 100) * circumference}
                className="text-indigo-600"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
            />
        </svg>
    );
};

const AnimatedStat = ({ to, isFloat = false }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            animate(0, to, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate(value) {
                    if (ref.current) {
                        ref.current.textContent = isFloat ? value.toFixed(1) : Math.round(value).toLocaleString();
                    }
                },
            });
        }
    }, [isInView, to, isFloat]);

    return <span ref={ref}>0</span>;
};

const StatsDashboard = ({ user }) => {
    const stats = useMemo(() => ({
        projectsCompleted: user.pastProjects?.length || 0,
        averageRating: user.rating?.value || 0,
        reviewsCount: user.rating?.reviews || 0,
        skillsCount: user.skills?.length || 0,
    }), [user]);

    const statItems = [
        { id: 'projects', icon: <Briefcase size={24} className="mx-auto text-indigo-500 mb-1" />, value: stats.projectsCompleted, label: 'Projects', tooltip: 'Total projects completed.' },
        { id: 'rating', icon: <Star size={24} className="mx-auto text-yellow-500 mb-1" />, value: stats.averageRating, label: 'Rating', isFloat: true },
        { id: 'reviews', icon: <Users size={24} className="mx-auto text-green-500 mb-1" />, value: stats.reviewsCount, label: 'Reviews' },
        { id: 'skills', icon: <Code size={24} className="mx-auto text-blue-500 mb-1" />, value: stats.skillsCount, label: 'Skills' },
    ];

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900/50 dark:via-gray-900 dark:to-purple-900/30 opacity-50 -z-10"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center"><TrendingUp size={20} className="mr-2 text-purple-500" /> Stats Dashboard</h3>
            <div className="grid grid-cols-2 gap-4">
                {statItems.map(item => (
                    <motion.div
                        key={item.id}
                        className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg transition-all duration-300"
                        whileHover={{
                            y: -5,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        {item.icon}
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            <AnimatedStat to={item.value} isFloat={item.isFloat} />
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
};

const ProfileCompletion = ({ user }) => {
    const { percentage, strength, suggestions } = useMemo(() => {
        const completion = {
            bio: user.bio?.length > 20,
            skills: user.skills?.length > 0,
            social: user.social?.github || user.social?.linkedin,
            projects: user.pastProjects?.length > 0,
            rating: user.rating?.reviews > 0,
        };
        const score = Object.values(completion).filter(Boolean).length;
        const percentage = Math.round((score / 5) * 100);

        let strength = "Getting Started";
        if (percentage > 20) strength = "Good";
        if (percentage > 60) strength = "Great";
        if (percentage === 100) strength = "All-Star!";

        const suggestions = [];
        if (!completion.bio) suggestions.push({ text: "Add a detailed bio (over 20 characters).", icon: <User size={16} className="mr-2 text-gray-500" /> });
        if (!completion.skills) suggestions.push({ text: "List your professional skills.", icon: <Code size={16} className="mr-2 text-gray-500" /> });
        if (!completion.social) suggestions.push({ text: "Connect your social profiles (GitHub/LinkedIn).", icon: <GithubIcon size={16} className="mr-2 text-gray-500" /> });
        if (!completion.projects) suggestions.push({ text: "Showcase your past projects.", icon: <Briefcase size={16} className="mr-2 text-gray-500" /> });
        if (!completion.rating) suggestions.push({ text: "Complete projects to receive ratings.", icon: <Star size={16} className="mr-2 text-gray-500" /> });

        return { percentage, strength, suggestions };
    }, [user.bio, user.skills, user.social, user.pastProjects, user.rating]);

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900/50 dark:via-gray-900 dark:to-indigo-900/30 opacity-50 -z-10"></div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center"><TrendingUp size={20} className="mr-2 text-indigo-500" /> Profile Strength</h3>
                <div className="relative">
                    <CircularProgress percentage={percentage} size={60} strokeWidth={6} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                    </div>
                </div>
            </div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">{strength}</p>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {percentage === 100 ? (
                    <div className="text-center text-green-600 dark:text-green-400">
                        <Check size={20} className="mx-auto mb-1" />
                        <p className="text-sm font-semibold">Your profile is looking great!</p>
                    </div>
                ) : (
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-center">{suggestion.icon} {suggestion.text}</li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};

const AccountSecurity = ({ setShowDeleteConfirm }) => (
    <motion.div variants={itemVariants} className="mt-8">
        <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center"><Lock size={20} className="mr-2" /> Account Security</h2>
            <ul className="space-y-4">
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Reset Password</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Send a password reset link to your email.</p>
                    </div>
                    <Link to="/forgot-password" className="mt-2 sm:mt-0">
                        <motion.button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-yellow-700 transition-colors w-full sm:w-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            Reset
                        </motion.button>
                    </Link>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Delete Account</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all data.</p>
                    </div>
                    <motion.button onClick={() => setShowDeleteConfirm(true)} className="mt-2 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-red-700 transition-colors w-full sm:w-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        Delete
                    </motion.button>
                </li>
            </ul>
        </Card>
    </motion.div>
);

const ClientView = ({ user, projects, isOwnProfile, isEditing, handleInputChange, setShowDeleteConfirm }) => (
    <motion.div
        className="mt-12 space-y-8"
        variants={containerVariants}
    >
        <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
            <Card>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Building size={20} className="mr-2" /> About {user.groupName || 'the Client'}</h2>
                {isEditing ? (
                    <textarea name="bio" value={user.bio} onChange={handleInputChange} className="w-full h-24 p-2 text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio || <span className="text-gray-400 italic">No company bio provided.</span>}</p>
                )}
            </Card>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }} className="relative">
            <Card>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Briefcase size={20} className="mr-2" /> Posted Projects</h2>
                <div className="space-y-4">
                    {projects.length > 0 ? projects.map(project => (
                        <Link to={`/projects/${project._id}/applicants`} key={project._id} className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{project.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                                    <Users size={16} className="mr-1" />
                                    {project.applicants.length}
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 italic text-sm mb-4">No projects posted yet.</p>
                            <Link to="/create-project">
                                <motion.button className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg hover:bg-indigo-700 transition-all duration-300 transform flex items-center mx-auto" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                                    <PlusCircle size={18} className="mr-2" />
                                    Post Your First Project
                                </motion.button>
                            </Link>
                        </div>
                    )}
                </div>
                {projects.length > 0 && (
                    <div className="mt-6 text-center">
                        <Link to="/projects">
                            <motion.button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                View All Projects
                            </motion.button>
                        </Link>
                    </div>
                )}
            </Card>
        </motion.div>
    </motion.div>
);

const FreelancerView = ({ user, isOwnProfile, isEditing, handleInputChange, handleSocialChange, handleProjectChange, handleDeleteProject, handleAddProject, skillsInput, setSkillsInput, originalUser, setShowDeleteConfirm }) => (
    <motion.div
        className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
    >
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                <Card>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center"><User size={20} className="mr-2" /> About</h2>
                    {isEditing ? (
                        <textarea name="bio" value={user.bio} onChange={handleInputChange} className="w-full h-24 p-2 text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio || <span className="text-gray-400 italic">No biography provided.</span>}</p>
                    )}
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                <Card className="bg-white dark:bg-gray-800/50">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Code size={20} className="mr-2" /> Skills</h2>
                    {isEditing ? (
                        <div >
                            <input type="text" name="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full p-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="React, Node.js, ..." />
                            <p className="text-xs text-gray-500 mt-2">Enter skills separated by commas.</p>
                        </div>
                    ) : (
                        user.skills.length > 0 ? <div className="flex flex-wrap gap-2">
                            {user.skills.map(skill => (
                                <motion.span
                                    key={skill}
                                    className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div> : <p className="text-gray-400 italic">No skills listed.</p>
                    )}
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                <Card className="bg-white dark:bg-gray-800/50">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Briefcase size={20} className="mr-2" /> Past Projects</h2>
                    <div className="space-y-4 -mx-4 max-h-72 overflow-y-auto pr-2">
                        {user.pastProjects.length > 0 ? user.pastProjects.map((project, index) => (
                            <div key={index} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                {isEditing ? (
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-grow space-y-3">
                                            <input type="text" name="title" value={project.title} onChange={(e) => handleProjectChange(index, e)} placeholder="Project Title" className="w-full font-semibold text-gray-800 dark:text-gray-200 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none pb-1" />
                                            <input type="text" name="role" value={project.role} onChange={(e) => handleProjectChange(index, e)} placeholder="Your Role" className="w-full text-sm text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none pb-1" />
                                            <input type="url" name="link" value={project.link} onChange={(e) => handleProjectChange(index, e)} placeholder="https://project-link.com" className="w-full text-sm text-blue-500 dark:text-blue-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none pb-1" />
                                        </div>
                                        <button type="button" onClick={() => handleDeleteProject(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors mt-1"><Trash2 size={18} /></button>
                                    </div>
                                ) : (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                            <Briefcase size={16} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{project.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{project.role}</p>
                                        </div>
                                        <ExternalLink className="text-gray-400 group-hover:text-indigo-500 transition-all" size={16} />
                                    </a>
                                )}
                            </div>
                        )) : !isEditing && <p className="text-gray-400 italic text-sm px-4">No past projects listed.</p>}
                        {isEditing && (
                            <div className="px-4 pt-3">
                                <button type="button" onClick={handleAddProject} className="w-full flex items-center justify-center py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                                    <PlusCircle size={20} className="mr-2" /> Add Project
                                </button>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>

        <div className="lg:col-span-1 space-y-8 order-1 lg:order-2">
            {isOwnProfile && (
                <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <ProfileCompletion user={isEditing ? originalUser : user} />
                </motion.div>
            )}
            {isOwnProfile && (
                <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <StatsDashboard user={user} />
                </motion.div>
            )}
            {!isOwnProfile && (
                <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <StatsDashboard user={user} />
                </motion.div>
            )}
        </div>
    </motion.div>
);

const LoggedOutProfileView = () => (
    <div className="container mx-auto py-12 px-4">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="max-w-4xl mx-auto text-center p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900/95 dark:via-gray-900 dark:to-indigo-900/30 opacity-50 -z-10"></div>
                <Lock size={48} className="mx-auto text-indigo-400 mb-6" />
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Build Your Profile with Ignite
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                    Whether you're looking to hire top talent or find your next project, Ignite is the place to connect and create.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
                    {/* For Freelancers */}
                    <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><Users size={22} className="mr-2 text-indigo-500" />For Freelancers</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start"><Code size={16} className="mr-2 mt-1 text-indigo-500 flex-shrink-0" /><p className="text-sm text-gray-500 dark:text-gray-400">Showcase your skills and build a stunning portfolio.</p></li>
                            <li className="flex items-start"><Briefcase size={16} className="mr-2 mt-1 text-indigo-500 flex-shrink-0" /><p className="text-sm text-gray-500 dark:text-gray-400">Find and apply for exciting new projects.</p></li>
                            <li className="flex items-start"><TrendingUp size={16} className="mr-2 mt-1 text-indigo-500 flex-shrink-0" /><p className="text-sm text-gray-500 dark:text-gray-400">Track your profile strength to attract clients.</p></li>
                        </ul>
                    </div>
                    {/* For Clients */}
                    <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><Building size={22} className="mr-2 text-purple-500" />For Clients</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start"><PlusCircle size={16} className="mr-2 mt-1 text-purple-500 flex-shrink-0" /><p className="text-sm text-gray-500 dark:text-gray-400">Post projects and easily define your requirements.</p></li>
                            <li className="flex items-start"><Users size={16} className="mr-2 mt-1 text-purple-500 flex-shrink-0" /><p className="text-sm text-gray-500 dark:text-gray-400">Discover and browse profiles of skilled freelancers.</p></li>
                            <li className="flex items-start"><Check size={16} className="mr-2 mt-1 text-purple-500 flex-shrink-0" /><p className="text-sm text-gray-500 dark:text-gray-400">Manage applicants and hire the perfect talent.</p></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/login">
                        <motion.button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform flex items-center justify-center" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                            <LogIn size={20} className="mr-2" /> Log In
                        </motion.button>
                    </Link>
                    <Link to="/signup">
                        <motion.button className="w-full sm:w-auto bg-white dark:bg-gray-700 text-indigo-600 dark:text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all duration-300 transform flex items-center justify-center" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                            <User size={20} className="mr-2" /> Sign Up Now
                        </motion.button>
                    </Link>
                </div>
            </Card>
        </motion.div>
    </div>
);

const DeleteConfirmModal = ({ onConfirm, onCancel, loading }) => (
    <AnimatePresence>
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </p>
                <div className="flex justify-center gap-4">
                    <motion.button onClick={onCancel} disabled={loading} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        Cancel
                    </motion.button>
                    <motion.button onClick={onConfirm} disabled={loading} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        {loading ? (
                            <><LoaderCircle size={18} className="animate-spin mr-2" /> Deleting...</>
                        ) : (
                            'Yes, delete account'
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const CropImageModal = ({ imgSrc, onCrop, onCancel }) => {
    const [crop, setCrop] = useState();
    const imgRef = useRef(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1, // aspect ratio 1:1
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    }

    const handleCrop = () => {
        if (!crop || !imgRef.current) {
            return;
        }

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob((blob) => {
            if (blob) {
                onCrop(blob);
            }
        }, 'image/jpeg', 0.95);
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <h2 className="text-2xl font-bold text-center mb-4">Crop Your Image</h2>
                <div className="flex justify-center mb-4">
                    <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} circularCrop>
                        <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop preview" style={{ maxHeight: '70vh' }} />
                    </ReactCrop>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleCrop} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Crop & Save</button>
                </div>
            </motion.div>
        </motion.div>
    );
};


const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [originalUser, setOriginalUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clientProjects, setClientProjects] = useState([]);
    const [skillsInput, setSkillsInput] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [showCropModal, setShowCropModal] = useState(false);
    const { userId: paramUserId } = useParams();
    const { user: loggedInUser, logout, updateUserToken } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cancelTokenSource = useRef(null);

    const fetchUserProfile = async () => {
        try {
            const url = paramUserId ? `/user/public-profile/${paramUserId}` : '/user/profile';
            const response = await axiosInstance.get(url, {
                cancelToken: cancelTokenSource.current.token
            });

            setUser(response.data);
            setOriginalUser(response.data);
            setSkillsInput(response.data.skills?.join(', ') || '');

            // If the user is a client, fetch their projects
            if (response.data.role === 'Client') {
                // If viewing a public profile, get that user's projects. Otherwise, get the logged-in user's projects.
                const projectsUrl = paramUserId ? `/projects/user/${paramUserId}` : '/projects/my-projects/list';
                const projectsResponse = await axiosInstance.get(projectsUrl, {
                    cancelToken: cancelTokenSource.current.token
                });
                setClientProjects(projectsResponse.data);
            }
        } catch (err) {
            if (axios.isCancel(err)) {
                console.log('Request canceled:', err.message);
            } else {
                if (err.response && err.response.status === 401) {
                    // This case is now handled by the check at the top of the component.
                    // We can set a more generic error for other 401s (e.g., viewing a private profile).
                    setError('You are not authorized to view this profile.');
                } else {
                    setError('Failed to load profile. Please try again later.');
                }
                console.error('Profile fetch error:', err);
            }
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (!loggedInUser && !paramUserId) {
                setLoading(false);
                return;
            }
            cancelTokenSource.current = axios.CancelToken.source();
            // Enforce a minimum loading time of 1 second to match the animation
            const minLoadingTimePromise = new Promise(resolve => setTimeout(resolve, 1000));
            await Promise.all([fetchUserProfile(), minLoadingTimePromise]);
            setLoading(false);
        };

        loadProfile();
    }, [paramUserId, loggedInUser]); // Add loggedInUser to dependency array

    useEffect(() => {
        return () => {
            if (cancelTokenSource.current) {
                cancelTokenSource.current.cancel('Component unmounted');
            }
        };
    }, []);

    // If user is not logged in and not viewing a public profile, show the logged-out view.
    if (!loggedInUser && !paramUserId) {
        return <LoggedOutProfileView />;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, social: { ...prev.social, [name]: value } }));
    };

    const handleProjectChange = (index, e) => {
        const { name, value } = e.target;
        const updatedProjects = [...user.pastProjects];
        updatedProjects[index] = { ...updatedProjects[index], [name]: value };
        setUser(prev => ({ ...prev, pastProjects: updatedProjects }));
    };

    const handleAddProject = () => {
        setUser(prev => ({
            ...prev,
            pastProjects: [...prev.pastProjects, { title: '', role: '', link: '' }]
        }));
    };

    const handleDeleteProject = (index) => {
        setUser(prev => ({ ...prev, pastProjects: prev.pastProjects.filter((_, i) => i !== index) }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgSrc(reader.result);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImageBlob) => {
        if (croppedImageBlob) {
            setNewImage(croppedImageBlob);
            setImagePreview(URL.createObjectURL(croppedImageBlob));
            setShowCropModal(false);
            setImgSrc('');
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData();

        // Create a temporary user object for submission
        const userToSave = { ...user };
        // Update skills from the temporary input state before saving
        userToSave.skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
        // Append user data as JSON string, backend will parse it
        formData.append('user', JSON.stringify(userToSave));

        if (newImage) {
            formData.append('image', newImage);
        }

        try {
            const response = await axiosInstance.put('/user/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                cancelToken: cancelTokenSource.current.token
            });
            const updatedUser = response.data.user;
            setUser(updatedUser);
            setOriginalUser(updatedUser);
            setSkillsInput(updatedUser.skills?.join(', ') || '');
            setIsEditing(false);
            updateUserToken(response.data.token); // Update the token in localStorage
            setNewImage(null);
            setImagePreview(null);
            toast.success('Profile updated successfully!');
            // Re-fetch the profile to ensure the UI reflects the latest data
            await fetchUserProfile();
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error('Profile save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setUser(originalUser); // Revert changes
        setSkillsInput(originalUser.skills?.join(', ') || '');
        setIsEditing(false);
        setNewImage(null);
        setImagePreview(null);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await axiosInstance.delete('/user/profile', {
                cancelToken: cancelTokenSource.current.token
            });
            toast.success('Your account has been deleted.');
            // We need to manually navigate here because logout() might not
            // cause a re-render fast enough before the component tries to
            // access the now-deleted user's data.
            logout(false); // logout without navigating
            navigate('/'); // navigate to home
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete account.');
            console.error('Delete account error:', err);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // A simple component to render a star rating
    const StarRating = ({ rating }) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />)}
                {halfStar && <Star key="half" className="w-5 h-5 text-yellow-400 fill-current" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 dark:text-gray-600 fill-current" />)}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] text-gray-500 dark:text-gray-400">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <LoaderCircle className="w-16 h-16 text-indigo-600" />
                </motion.div>
                <p className="mt-4 text-lg font-semibold">
                    Loading Profile...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-12 px-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="max-w-3xl mx-auto text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Your Profile</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
                        {error.includes('log in') && (
                            <Link to="/login">
                                <motion.button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform flex items-center mx-auto" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                                    <LogIn size={20} className="mr-2" /> Go to Login
                                </motion.button>
                            </Link>
                        )}
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center py-12">Could not find user profile.</div>;
    }

    const isOwnProfile = loggedInUser && loggedInUser.userId === user._id;

    return (
        <motion.div
            className="container mx-auto py-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                {/* This form tag is only for semantics and to prevent a console warning. The real submission is handled by the save button. */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave(e);
                }}>
                    <Card className="relative p-8">
                        <div>
                            <motion.div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8" variants={containerVariants}>
                                <motion.div variants={itemVariants} className="flex-shrink-0 mb-6 md:mb-0 group">
                                    <div className="relative">
                                        {imagePreview || user.image ? (
                                            <img className="w-32 h-32 rounded-full object-cover shadow-lg" src={imagePreview || user.image} alt={user.name} />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center shadow-lg">
                                                <User size={64} className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                        {isEditing && (
                                            <>
                                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                                <button type="button" onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                                    <Camera size={32} />
                                                    <span className="sr-only">Change picture</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {isEditing && !imagePreview && !user.image && (
                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                            Click to add a profile picture.
                                        </p>
                                    )}
                                </motion.div>
                                <div className="flex-grow text-center md:text-left">
                                    <motion.div variants={itemVariants}>
                                        {isEditing ? (
                                            <input type="text" name="name" value={user.name} onChange={handleInputChange} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none w-full md:w-auto mb-1" />
                                        ) : (
                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                                        )}
                                    </motion.div>
                                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{user.role}</motion.p>
                                    <motion.div variants={itemVariants} className="mt-1 text-sm md:text-base">
                                        {isEditing ? (
                                            <input type="text" name="groupName" value={user.groupName || ''} onChange={handleInputChange} placeholder="Company or Group Name (Optional)" className="text-md text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none w-full md:w-auto" />
                                        ) : (
                                            user.groupName && <p className="text-md text-gray-500 dark:text-gray-400">{user.groupName}</p>
                                        )}
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="flex items-center justify-center md:justify-start mt-3">
                                        <StarRating rating={user.rating?.value || 0} />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({user.rating?.reviews || 0} reviews)</span>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="flex items-center justify-center md:justify-start mt-4 gap-6 text-sm">
                                        {isEditing ? (
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="relative flex-1"><GithubIcon size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" /><input type="url" name="github" value={user.social?.github || ''} onChange={handleSocialChange} placeholder="GitHub URL" className="w-full pl-6 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none" /></div>
                                                <div className="relative flex-1"><LinkedinIcon size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" /><input type="url" name="linkedin" value={user.social?.linkedin || ''} onChange={handleSocialChange} placeholder="LinkedIn URL" className="w-full pl-6 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none" /></div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-6">
                                                {user.email && <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                                                    <Mail size={20} />
                                                </a>}
                                                {user.social?.github && <a href={user.social.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"><Github size={20} /></a>}
                                                {user.social?.linkedin && <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"><Linkedin size={20} /></a>}
                                            </div>
                                        )}
                                        {isOwnProfile && (
                                            <div className="flex items-center space-x-2">
                                                {isEditing ? (
                                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center space-x-2">
                                                        <motion.button type="submit" onClick={handleSave} disabled={isSaving} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-full font-semibold text-sm hover:bg-green-700 transition-colors duration-300 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            {isSaving ? (
                                                                <><LoaderCircle size={16} className="animate-spin mr-2" /> Saving...</>
                                                            ) : (
                                                                <><Save size={16} className="mr-2" /> Save</>
                                                            )}
                                                        </motion.button>
                                                        <motion.button type="button" onClick={handleCancel} disabled={isSaving} className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-full font-semibold text-sm hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <XCircle size={16} className="mr-2" /> Cancel
                                                        </motion.button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.button
                                                        onClick={() => setIsEditing(true)}
                                                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 transition-colors duration-300"
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <Edit size={16} className="mr-2" /> Edit
                                                    </motion.button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Conditionally render profile body based on role */}
                            {user.role === 'Client' ? (
                                <ClientView user={user} projects={clientProjects} isOwnProfile={isOwnProfile} isEditing={isEditing} handleInputChange={handleInputChange} setShowDeleteConfirm={setShowDeleteConfirm} />
                            ) : (
                                <FreelancerView
                                    user={user}
                                    isOwnProfile={isOwnProfile}
                                    isEditing={isEditing}
                                    handleInputChange={handleInputChange}
                                    skillsInput={skillsInput}
                                    setSkillsInput={setSkillsInput}
                                    handleSocialChange={handleSocialChange}
                                    handleProjectChange={handleProjectChange}
                                    handleDeleteProject={handleDeleteProject}
                                    handleAddProject={handleAddProject}
                                    originalUser={originalUser}
                                    setShowDeleteConfirm={setShowDeleteConfirm}
                                />
                            )}
                        </div>
                    </Card>
                </form>
            </motion.div>



            {showDeleteConfirm && (
                <DeleteConfirmModal
                    loading={isDeleting}
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            <AnimatePresence>
                {showCropModal && (
                    <CropImageModal
                        imgSrc={imgSrc}
                        onCrop={handleCropComplete}
                        onCancel={() => { setShowCropModal(false); setImgSrc(''); }}
                    />
                )}
            </AnimatePresence>
            {paramUserId && (
                <motion.div variants={itemVariants} className="mt-12 flex justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} />
                        Back to Applicants
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ProfilePage;