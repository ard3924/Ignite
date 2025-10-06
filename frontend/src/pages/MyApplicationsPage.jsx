import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, AlertTriangle, Inbox, Clock, CheckCircle, XCircle, HelpCircle, ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import TaskViewer from '../components/TaskViewer';
import ProjectModal from '../components/ProjectModal';
import { Link } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'accepted':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'rejected':
            return <XCircle className="w-5 h-5 text-red-500" />;
        case 'pending':
        default:
            return <HelpCircle className="w-5 h-5 text-yellow-500" />;
    }
};

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize flex items-center gap-1.5";
    switch (status) {
        case 'accepted':
            return <div className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}><CheckCircle size={14} /> Accepted</div>;
        case 'rejected':
            return <div className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}><XCircle size={14} /> Rejected</div>;
        case 'pending':
        default:
            return <div className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}><HelpCircle size={14} /> Pending</div>;
    }
};

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axiosInstance.get('/projects/my-applications/list');
                setApplications(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your applications.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const sortedAndFilteredApplications = applications
        .filter(app => filterStatus === 'all' || app.status === filterStatus)
        .sort((a, b) => {
            const dateA = new Date(a.appliedAt);
            const dateB = new Date(b.appliedAt);
            if (sortOrder === 'newest') {
                return dateB - dateA;
            }
            return dateA - dateB;
        });

    // Pagination logic
    const totalPages = Math.ceil(sortedAndFilteredApplications.length / itemsPerPage);
    const paginatedApplications = sortedAndFilteredApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleTitleClick = async (projectId) => {
        setIsModalLoading(true);
        setSelectedProject({ _id: projectId }); // Set a temporary project to show loading in modal
        try {
            const response = await axiosInstance.get(`/projects/${projectId}`);
            setSelectedProject(response.data);
        } catch (err) {
            console.error("Failed to fetch project details", err);
            // Optionally, show an error toast
            setSelectedProject(null); // Close modal on error
        } finally {
            setIsModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
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
        <motion.div
            className="container mx-auto py-12 px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Applications</h1>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Track the status of projects you've applied for.</p>
            </motion.div>

            {applications.length > 0 && (
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-10">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter by:</span>
                        {['all', 'pending', 'accepted', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out capitalize focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 ${filterStatus === status
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5"><ArrowDownUp size={14} /> Sort by:</span>
                        {['newest', 'oldest'].map(order => (
                            <button
                                key={order}
                                onClick={() => setSortOrder(order)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out capitalize focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 ${sortOrder === order
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {order}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {paginatedApplications.length === 0 ? (
                <motion.div variants={itemVariants} className="text-center py-16">
                    <Inbox size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">
                        {applications.length === 0 ? 'No Applications Found' : 'No Applications Match Filter'}
                    </h3>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
                        {applications.length === 0
                            ? <>You haven't applied to any projects yet. <Link to="/projects" className="text-indigo-600 dark:text-indigo-400 hover:underline">Browse projects</Link> to get started!</>
                            : 'Try selecting a different status to see your applications.'}
                    </p>
                </motion.div>
            ) : (
                <motion.div className="space-y-6" variants={containerVariants}>
                    {paginatedApplications.map((app) => (
                        <motion.div
                            key={app.projectId}
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                        >
                            <Card className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-grow">
                                        <button onClick={() => handleTitleClick(app.projectId)} className="text-left">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                {app.projectTitle}
                                            </h3>
                                        </button>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{app.projectDescription}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <StatusBadge status={app.status} />
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                    {app.status === 'accepted' && (
                                        <TaskViewer tasks={app.tasks} />
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {totalPages > 1 && (
                <motion.div variants={itemVariants} className="flex justify-center items-center mt-12">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <ChevronRight size={16} />
                    </button>
                </motion.div>
            )}

            {selectedProject && (
                isModalLoading ? (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
                        <LoaderCircle className="w-12 h-12 animate-spin text-white" />
                    </div>
                ) : (
                    <ProjectModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )
            )}
        </motion.div>
    );
};

export default MyApplicationsPage;