import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, AlertTriangle, ListTodo, CheckSquare, Square, Filter, Send, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import SubmissionModal from '../components/SubmissionModal';
import ProjectModal from '../components/ProjectModal';
import { Github } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const MyTasksPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projectToSubmit, setProjectToSubmit] = useState(null); // This will hold the project for the modal
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
    const [currentPage, setCurrentPage] = useState(1);
    const PROJECTS_PER_PAGE = 5;
    const [submissionData, setSubmissionData] = useState({ message: '', link: '', githubUrl: '' });

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axiosInstance.get('/projects/my-applications/list');
                setApplications(response.data);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load tasks.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    useEffect(() => {
        if (projectToSubmit) {
            const latestSubmission = projectToSubmit.submission;
            setSubmissionData({
                message: '',
                link: latestSubmission?.link || '',
                githubUrl: latestSubmission?.githubUrl || ''
            });
        }
    }, []);

    const projectsWithTasks = useMemo(() => {
        return applications
            .filter(app => app.status === 'accepted' && app.tasks && app.tasks.length > 0)
            .map(app => {
                const filteredTasks = app.tasks.filter(task => {
                    if (filter === 'all') return true;
                    if (filter === 'pending') return !task.completed;
                    if (filter === 'completed') return task.completed;
                    return true;
                });

                if (filter !== 'all' && filteredTasks.length === 0) {
                    return null;
                }

                const completedTasks = app.tasks.filter(t => t.completed).length;
                const totalTasks = app.tasks.length;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                return {
                    ...app,
                    applicationId: app._id, // Explicitly map _id to applicationId
                    tasks: filteredTasks,
                    progress,
                    taskStats: `${completedTasks}/${totalTasks}`,
                };
            }).filter(Boolean);
    }, [applications, filter]);

    // Pagination logic for projects
    const totalPages = Math.ceil(projectsWithTasks.length / PROJECTS_PER_PAGE);
    const paginatedProjects = projectsWithTasks.slice(
        (currentPage - 1) * PROJECTS_PER_PAGE,
        currentPage * PROJECTS_PER_PAGE
    );

    const handleToggleTask = async (projectId, applicationId, taskId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(
                `/projects/${projectId}/applications/${applicationId}/tasks/${taskId}`,
                { completed: !currentStatus }
            );
            const updatedApplicant = response.data;

            // Update local state to reflect the change instantly
            setApplications(prevApps =>
                prevApps.map(app =>
                    app._id === applicationId ? { ...app, tasks: updatedApplicant.tasks } : app
                )
            );
            toast.success('Task status updated!');
        } catch (error) {
            console.error("Failed to update task", error);
            toast.error(error.response?.data?.message || "Failed to update task.");
        }
    };

    const handleWorkSubmission = async (submissionData) => {
        if (!projectToSubmit) return;

        try {
            const response = await axiosInstance.post(`/projects/${projectToSubmit.projectId}/submit`, submissionData, { headers: { 'Content-Type': 'application/json' } });
            toast.success(response.data.message || 'Work submitted successfully!');
            // Update the application state to reflect the submission
            setApplications(prevApps => prevApps.map(app => {
                if (app.projectId === projectToSubmit.projectId) {
                    return {
                        ...app,
                        hasSubmitted: true,
                        submission: {
                            ...(app.submission || {}), // Keep existing or create new object
                            status: 'pending',
                            clientFeedback: app.submission?.clientFeedback || null,
                        },
                    };
                }
                return app;
            }));
        } catch (error) {
            console.error("Failed to submit work", error);
            toast.error(error.response?.data?.message || "Failed to submit work.");
            throw error; // Re-throw to let the modal handle its loading state
        }
    };

    const handleTitleClick = async (projectId) => {
        setIsModalLoading(true);
        setSelectedProject({ _id: projectId }); // Temporary object to trigger modal loading state
        try {
            const response = await axiosInstance.get(`/projects/${projectId}`);
            setSelectedProject(response.data);
        } catch (err) {
            console.error("Failed to fetch project details", err);
            toast.error("Could not load project details.");
            setSelectedProject(null); // Close modal on error
        } finally {
            setIsModalLoading(false);
        }
    };

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
        <>
            <motion.div
                className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                        <ListTodo size={36} className="text-indigo-500" />
                        My Tasks
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Your assigned tasks for all accepted projects.</p>
                </motion.div>

                {applications.some(app => app.status === 'accepted' && app.tasks?.length > 0) && (
                    <motion.div variants={itemVariants} className="flex justify-center items-center gap-2 mb-10">
                        <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
                        {['all', 'pending', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out capitalize focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 ${filter === status
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {status === 'pending' ? 'To-Do' : status}
                            </button>
                        ))}
                    </motion.div>
                )}

                {projectsWithTasks.length === 0 ? (
                    <motion.div variants={itemVariants} className="text-center py-16">
                        <div className="inline-block p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <CheckSquare size={48} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">All Tasks Completed!</h3>
                        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
                            {filter === 'all' ? 'You have no assigned tasks. Great job!' : `You have no ${filter} tasks.`}
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-8">
                            {paginatedProjects.map(project => (
                                <motion.div key={project.projectId} variants={itemVariants}>
                                    <Card className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <button onClick={() => handleTitleClick(project.projectId)} className="text-left">
                                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    {project.projectTitle}
                                                </h2>
                                            </button>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{project.taskStats}Tasks</span>
                                        </div>

                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                                            <motion.div
                                                className="bg-indigo-600 h-2.5 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${project.progress}%` }}
                                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                            ></motion.div>
                                        </div>

                                        {project.tasks.length === 0 && filter !== 'all' && (
                                            <p className="text-center text-gray-500 dark:text-gray-400 italic py-4">No tasks match the current filter.</p>
                                        )}

                                        <div className="space-y-3">
                                            {project.tasks.map(task => (
                                                <motion.div
                                                    key={task._id}
                                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
                                                    onClick={() => handleToggleTask(project.projectId, project.applicationId, task._id, task.completed)}
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="flex items-center">
                                                        {task.completed ? (
                                                            <CheckSquare size={20} className="mr-3 text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <Square size={20} className="mr-3 text-gray-400 flex-shrink-0" />
                                                        )}
                                                        <span className={`text-md ${task.completed ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {task.description}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                                        {task.completed ? 'Done' : 'To-Do'}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            {project.hasSubmitted ? (
                                                <div className="space-y-3">
                                                    {project.submission?.status === 'changes_requested' && project.submission.clientFeedback && (
                                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Changes Requested</h4>
                                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{project.submission.clientFeedback}</p>
                                                            <div className="mt-3 flex justify-end">
                                                                <motion.button
                                                                    onClick={() => setProjectToSubmit(project)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    <Send size={14} /> Resubmit Work
                                                                </motion.button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {project.submission?.status === 'approved' && (
                                                        <div className="flex items-center gap-2 px-5 py-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-lg font-semibold">
                                                            <CheckSquare size={16} />
                                                            Submission Approved
                                                        </div>
                                                    )}
                                                    {(!project.submission?.status || project.submission?.status === 'pending') && (
                                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                                                                    <span className="font-semibold text-yellow-800 dark:text-yellow-200">Pending Client Review</span>
                                                                </div>
                                                                <motion.button
                                                                    onClick={() => setProjectToSubmit(project)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400"
                                                                    whileHover={{ scale: 1.05 }}
                                                                >
                                                                    <Send size={14} /> Resubmit Work
                                                                </motion.button>
                                                            </div>
                                                            {project.submission?.clientFeedback && project.submission?.status !== 'changes_requested' && (
                                                                <div className="mt-3">
                                                                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Previous Feedback</h4>
                                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{project.submission.clientFeedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <div className="relative group">
                                                        <motion.button
                                                            onClick={() => setProjectToSubmit(project)}
                                                            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                            whileHover={{ scale: 1.05 }}
                                                            disabled={project.progress < 100}
                                                        >
                                                            <Send size={16} /> Submit Work
                                                        </motion.button>
                                                        {project.progress < 100 && (
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Complete all tasks to submit
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <motion.div variants={itemVariants} className="flex justify-center items-center mt-12">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
            <SubmissionModal
                isOpen={!!projectToSubmit}
                onClose={() => setProjectToSubmit(null)}
                onSubmit={handleWorkSubmission}
                projectTitle={projectToSubmit?.projectTitle}
            />
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
        </>
    );
};

export default MyTasksPage;