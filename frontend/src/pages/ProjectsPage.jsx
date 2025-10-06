import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { X, Search, ArrowRight, PlusCircle, LoaderCircle, Edit, Users, Briefcase, Calendar, Code, Lightbulb, Trash2, Mail, Linkedin, CheckCircle, Code2, ChevronLeft, ChevronRight, MoreHorizontal, ArrowDownUp, SlidersHorizontal, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ApplyModal from '../components/ApplyModal';
import ConfirmationModal from '../components/ConfirmationModal';
import axiosInstance from '../axiosInterceptor'; // Import axiosInstance
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/AuthContext.jsx';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);


const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5 }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const ProjectCard = memo(({ project, onKnowMore, onApply, userRole, onDelete, hasApplied, isLoggedIn }) => (
    <motion.div
        variants={cardVariants}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
        className="h-full"
    >
        <Card className="h-full flex flex-col group">
            <div className="flex-grow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-gray-700 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.type || 'General Project'}</p>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {project.skillsRequired.slice(0, 4).map((skill, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full"
                        >
                            {skill}
                        </span>
                    ))}
                    {project.skillsRequired.length > 4 && (
                        <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
                            +{project.skillsRequired.length - 4} more
                        </span>
                    )}
                </div>
            </div>

            {isLoggedIn && project.createdBy && (
                <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Posted By</p>
                    <Link to={`/profile/${project.createdBy._id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -m-2 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <img src={project.createdBy.image} alt={project.createdBy.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.createdBy.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{project.createdBy.groupName || 'Individual Client'}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {userRole === 'Client' ? (
                        <>
                            <Link to={`/projects/${project._id}/edit`} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Edit size={16} />
                            </Link>
                            <button onClick={() => onDelete(project)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Trash2 size={16} />
                            </button>
                            <Link to={`/projects/${project._id}/applicants`} className="flex-grow">
                                <button className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700">
                                    <Users size={16} className="mr-1.5" />
                                    Applicants ({project.applicants.length})
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <motion.button onClick={() => onKnowMore(project)} className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                Details
                            </motion.button>
                            {hasApplied ? (
                                <motion.button
                                    disabled
                                    className="flex-grow bg-indigo-400 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
                                >
                                    Applied
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={() => onApply(project)}
                                    className="flex-grow bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors duration-300"
                                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgb(99 102 241 / 0.5)" }}
                                    whileTap={{ scale: 0.95 }}>
                                    Apply
                                </motion.button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Card>
    </motion.div>
));

const ProjectModal = ({ project, onClose }) => {
    // This modal is for displaying project details only
    if (!project) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
                onClick={e => e.stopPropagation()}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
                    <motion.button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                        <X size={24} />
                    </motion.button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><ArrowRight size={18} className="mr-2 text-indigo-500" />Project Description</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.description}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><ArrowRight size={18} className="mr-2 text-indigo-500" />Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.skillsRequired.map((skill, index) => (
                                <span key={index} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold px-3 py-1 rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {project.createdBy && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><ArrowRight size={18} className="mr-2 text-indigo-500" />About the Client</h3>
                            <Link to={`/profile/${project.createdBy._id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 -m-3 rounded-lg transition-colors mb-3 group">
                                <div className="flex items-center gap-3">
                                    <img src={project.createdBy.image} alt={project.createdBy.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.createdBy.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.createdBy.groupName || 'Individual Client'}</p>
                                    </div>
                                </div>
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{project.createdBy.bio || 'No client bio provided.'}</p>
                            <div className="flex flex-wrap gap-4 items-center text-sm">
                                {project.createdBy.email && (
                                    <a href={`mailto:${project.createdBy.email}`} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                        <Mail size={16} /> {project.createdBy.email}
                                    </a>
                                )}
                                {project.createdBy.social?.linkedin && (
                                    <a href={project.createdBy.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                        <Linkedin size={16} /> LinkedIn
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <motion.div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                        {/* We hide the Apply button here since this modal is for details */}
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AnimatedHeaderGraphic = () => {
    const iconVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: (i) => ({
            opacity: [0, 1, 1, 0],
            scale: 1,
            transition: {
                delay: i * 0.5,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
            },
        }),
    };

    return (
        <div className="flex justify-center items-center h-full w-full p-4">
            <div className="relative w-64 h-48 flex justify-center items-center">
                <motion.div
                    className="p-6 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Users size={48} className="text-indigo-500" />
                </motion.div>
                <motion.div custom={0} variants={iconVariants} initial="hidden" animate="visible" className="absolute top-4 left-8 text-yellow-400"><Lightbulb size={24} /></motion.div>
                <motion.div custom={1} variants={iconVariants} initial="hidden" animate="visible" className="absolute top-12 right-2 text-purple-400"><Code size={24} /></motion.div>
                <motion.div custom={2} variants={iconVariants} initial="hidden" animate="visible" className="absolute bottom-4 left-12 text-pink-400"><Lightbulb size={24} /></motion.div>
                <motion.div custom={3} variants={iconVariants} initial="hidden" animate="visible" className="absolute bottom-10 right-8 text-green-400"><Code size={24} /></motion.div>
            </div>
        </div>
    );
};

const ClientCtaSection = () => {
    const navigate = useNavigate();
    return (
        <motion.div
            className="px-4 sm:px-6 lg:px-8 my-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-left order-2 md:order-1">
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Got an Idea? Let's Build It.
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg text-lg">
                            Access a global network of skilled freelancers ready to tackle your project. Post your requirements for free and start receiving proposals from top talent today.
                        </p>
                        <motion.button
                            onClick={() => navigate('/signup')}
                            className="flex items-center text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%_auto] hover:bg-right"
                            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(99, 102, 241, 0.4)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            Signup as Client
                            <ArrowRight className="ml-2" />
                        </motion.button>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center items-center">
                        <div className="relative w-64 h-64">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900 rounded-full blur-2xl opacity-60"></div>
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Lightbulb size={100} className="text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const ellipsis = '...';

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > 3) {
                pageNumbers.push(ellipsis);
            }

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            }
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push(ellipsis);
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const pages = getPageNumbers();

    return (
        <motion.div variants={itemVariants} className="flex justify-center items-center gap-2 mt-12">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={20} />
            </button>
            {pages.map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        <MoreHorizontal size={20} />
                    </span>
                ) : (
                    <button key={page} onClick={() => onPageChange(page)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === page ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                        {page}
                    </button>
                )
            )}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={20} />
            </button>
        </motion.div>
    );
};

const SkillSelector = ({ uniqueSkills, selectedSkills, onSkillToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [skillSearch, setSkillSearch] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredSkills = uniqueSkills.filter(skill =>
        skill.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(skill)
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center"><SlidersHorizontal size={14} className="mr-1.5" />Filter by skill:</p>
                {selectedSkills.length > 0 && (
                    <motion.button
                        onClick={() => onSkillToggle(null)} // Clear all
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <XCircle size={14} /> Clear All
                    </motion.button>
                )}
            </div>
            <div className="relative">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 pl-12 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Select skills...</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder="Search skills..."
                                value={skillSearch}
                                onChange={(e) => setSkillSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                        <ul>
                            {filteredSkills.length > 0 ? filteredSkills.map(skill => (
                                <li key={skill} onClick={() => { onSkillToggle(skill); setSkillSearch(''); }} className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 cursor-pointer text-gray-800 dark:text-gray-200">
                                    {skill}
                                </li>
                            )) : (
                                <li className="px-4 py-2 text-gray-500">No skills found.</li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
            {selectedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                        <motion.div key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold px-3 py-1 rounded-full">
                            <span>{skill}</span>
                            <button onClick={() => onSkillToggle(skill)} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100">
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectsPage = () => {
    const [selectedProject, setSelectedProject] = useState(null); // For the Details Modal
    const [projectToApply, setProjectToApply] = useState(null); // For the Apply Modal
    const { user, isLoggedIn } = useAuth();
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [sortOption, setSortOption] = useState('newest'); // 'newest' or 'deadline'
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 6; // You can adjust this value
    const navigate = useNavigate();
    const location = useLocation();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                // If user is a client, fetch their projects. Otherwise, fetch all projects.
                let response;
                if (user?.role === 'Client') {
                    // Authenticated client fetching their own projects
                    response = await axiosInstance.get('/projects/my-projects/list');
                } else {
                    // Public view for freelancers or logged-out users.
                    // Use axiosInstance which has the correct base URL. The endpoint is '/projects/'.
                    response = await axiosInstance.get('/projects/');
                    if (user?.role === 'Freelancer') {
                        const applicationsResponse = await axiosInstance.get('/projects/my-applications/list');
                        const ids = new Set(applicationsResponse.data.map(app => app.projectId));
                        setAppliedProjectIds(ids);
                    }
                }
                setProjects(response.data);
            } catch (err) {
                setError('Failed to load projects. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user]); // Re-fetch when user logs in/out

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSkills, sortOption, searchTerm]);

    const uniqueSkills = useMemo(() => {
        const allSkills = projects.flatMap(p => p.skillsRequired);
        return [...new Set(allSkills)].sort();
    }, [projects]);

    const handleSkillToggle = (skill) => {
        if (skill === null) { // Clear all
            setSelectedSkills([]);
        } else {
            setSelectedSkills(prev =>
                prev.includes(skill)
                    ? prev.filter(s => s !== skill)
                    : [...prev, skill]
            );
        }
    };

    const filteredProjects = projects.filter(project => {
        const term = searchTerm.toLowerCase();
        const textSearchMatch = term === '' ||
            project.title.toLowerCase().includes(term) ||
            project.description.toLowerCase().includes(term);

        const skillFilterMatch = selectedSkills.length === 0 ||
            selectedSkills.every(s => project.skillsRequired.includes(s));

        return textSearchMatch && skillFilterMatch;
    });

    const sortedProjects = useMemo(() => {
        return [...filteredProjects].sort((a, b) => {
            if (sortOption === 'deadline') {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            // Default to 'newest'. The backend already sorts by newest, so we just maintain the order.
            // If we needed to sort by `createdAt` on the client, we'd do it here.
            return 0;
        });
    }, [filteredProjects, sortOption]);


    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedProjects, currentPage]);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);


    const handleApplyClick = (project) => {
        if (isLoggedIn) {
            setProjectToApply(project);
        } else {
            toast.error('You must log in to apply for a project.');
            navigate('/login', { state: { from: location } });
        }
    };

    const handleDetailsClick = (project) => {
        if (isLoggedIn) {
            setSelectedProject(project);
        } else {
            toast.error('You must log in to view project details.');
            navigate('/login', { state: { from: location } });
        }
    };

    const handleApplySubmission = async (id, roleConfirmation, motivation) => {
        // Combine the two fields into a single cover letter for the backend.
        const coverLetter = `Role: ${roleConfirmation}\n\n${motivation}`;

        try {
            // Make the API call to the backend
            const response = await axiosInstance.post(`/projects/${id}/apply`, { coverLetter });
            console.log('Application successful:', response.data);
            // Add the project ID to the set of applied projects to update the UI
            setAppliedProjectIds(prevIds => {
                return new Set(prevIds).add(id);
            });
            toast.success(response.data.message || 'Application submitted successfully!');
        } catch (error) {
            console.error('Application submission failed:', error.response?.data || error);
            // Re-throw the error so the modal can catch it and display a message
            throw new Error(error.response?.data?.message || 'Failed to submit application.');
        }
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/projects/${projectToDelete._id}`);
            toast.success('Project deleted successfully!');
            // Remove the project from the local state to update the UI
            setProjects(prevProjects => prevProjects.filter(p => p._id !== projectToDelete._id));
            setProjectToDelete(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete project.';
            toast.error(errorMessage);
            console.error('Delete project error:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <motion.section
            className="py-12 container mx-auto"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="grid md:grid-cols-2 gap-8 items-center mb-12 px-4 sm:px-6 lg:px-8">
                <motion.div variants={itemVariants}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {user?.role === 'Client' ? 'Your Posted Projects' : 'Find Your Next Collaboration'}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        {user?.role === 'Client' ? 'Manage your projects and review talented applicants.' : 'Browse opportunities and join a team of innovators.'}
                    </p>
                    <div className="space-y-6 max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <motion.input
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SkillSelector
                                uniqueSkills={uniqueSkills}
                                selectedSkills={selectedSkills}
                                onSkillToggle={handleSkillToggle}
                            />
                            <div className="flex flex-col justify-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center"><ArrowDownUp size={14} className="mr-1.5" />Sort by:</p>
                                <div className="flex items-center gap-2">
                                    <motion.button onClick={() => setSortOption('newest')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors w-full ${sortOption === 'newest' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>Newest</motion.button>
                                    <motion.button onClick={() => setSortOption('deadline')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors w-full ${sortOption === 'deadline' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>Deadline</motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="hidden md:block">
                    <AnimatedHeaderGraphic />
                </motion.div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 mt-12">
                {user?.role === 'Client' && (
                    <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-4">
                        <Link to="/create-project">
                            <motion.button
                                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold text-base shadow-lg hover:bg-indigo-700 transition-all duration-300 transform flex items-center"
                                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                            >
                                <PlusCircle size={20} className="mr-2" /> Create a New Project
                            </motion.button>
                        </Link>
                        <Link to="/all-applicants">
                            <motion.button
                                className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-white px-6 py-3 rounded-full font-bold text-base shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all duration-300 transform flex items-center"
                                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                            >
                                <Users size={20} className="mr-2" /> View All Applicants
                            </motion.button>
                        </Link>
                    </motion.div>
                )}
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredProjects.length > 0 ? (
                    paginatedProjects.map((project) => ( // Use paginatedProjects here
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onKnowMore={handleDetailsClick}
                            onApply={handleApplyClick}
                            onDelete={() => setProjectToDelete(project)}
                            userRole={user?.role}
                            hasApplied={appliedProjectIds.has(project._id)}
                            isLoggedIn={isLoggedIn}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16">
                        <motion.div
                            className="inline-block p-6 bg-indigo-100 dark:bg-gray-800 rounded-full mb-6"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Search size={48} className="text-indigo-400 dark:text-indigo-500" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No Projects Found</h3>
                        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Try adjusting your search or check back later for new opportunities.</p>
                    </div>
                )}
            </motion.div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* CTA for potential clients (visible to freelancers and logged-out users) */}
            {!isLoggedIn && (
                <ClientCtaSection />
            )}

            {/* Project Details Modal */}
            <AnimatePresence>
                {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
            </AnimatePresence>

            {/* Project Application Modal */}
            <AnimatePresence>
                {projectToApply && (
                    <ApplyModal
                        isOpen={!!projectToApply}
                        project={{ ...projectToApply, projectId: projectToApply._id }} // Pass projectId for the modal
                        onClose={() => setProjectToApply(null)}
                        onSubmit={handleApplySubmission}
                    />
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                message={`Are you sure you want to delete the project "${projectToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </motion.section>
    );
};

export default ProjectsPage;
