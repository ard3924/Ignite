import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, AlertTriangle, Briefcase, ArrowLeft, Search, ChevronLeft, ChevronRight, Users, Calendar } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { format } from 'date-fns';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const AllProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PROJECTS_PER_PAGE = 10;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axiosInstance.get('/admin/projects');
                setProjects(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load projects.');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.createdBy?.name && project.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            project.skillsRequired.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [projects, searchTerm]);

    const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
    const paginatedProjects = filteredProjects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE);

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]"><LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" /></div>;
    }

    if (error) {
        return (
            <div className="container mx-auto py-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600">An Error Occurred</h2>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <motion.div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="relative mb-8">
                <button onClick={() => navigate(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Back">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">All Projects ({projects.length})</h1>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8 max-w-lg mx-auto">
                <div className="relative">
                    <input type="text" placeholder="Search by title, client, or skill..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-4">
                {paginatedProjects.map(project => (
                    <motion.div key={project._id} variants={itemVariants}>
                        <Card className="p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">by {project.createdBy?.name || 'N/A'}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {project.skillsRequired.slice(0, 5).map(skill => (
                                            <span key={skill} className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col sm:items-end gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Users size={16} />
                                        <span>{project.applicants.length} Applicants</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Calendar size={16} />
                                        <span>Created: {project.createdAt ? format(new Date(project.createdAt), 'PP') : 'N/A'}</span>
                                    </div>
                                    {project.featured && (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                            Featured
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {totalPages > 1 && (
                <motion.div variants={itemVariants} className="flex justify-center items-center mt-8">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600">
                        <ChevronRight size={16} />
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AllProjectsPage;