import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoaderCircle, AlertTriangle, Users, ArrowLeft, Mail, Github, Linkedin, Briefcase, Plus, Trash2, CheckSquare, Square, Filter, Inbox, MessageSquare, Link as LinkIcon, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import { useAuth } from '../hooks/AuthContext';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TaskManagement = ({ member, onTaskUpdate }) => {
    const [tasks, setTasks] = useState(member.tasks || []);
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            const response = await axiosInstance.post(`/projects/${member.projectId}/applications/${member._id}/tasks`, { description: newTask });
            const updatedApplicant = response.data;
            setTasks(updatedApplicant.tasks);
            onTaskUpdate(member._id, updatedApplicant.tasks);
            setNewTask('');
            setIsAdding(false);
            toast.success('Task added!');
        } catch (error) {
            console.error("Failed to add task", error);
            toast.error(error.response?.data?.message || "Failed to add task.");
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/projects/${member.projectId}/applications/${member._id}/tasks/${taskId}`, { completed: !currentStatus });
            const updatedApplicant = response.data;
            setTasks(updatedApplicant.tasks);
            onTaskUpdate(member._id, updatedApplicant.tasks);
        } catch (error) {
            console.error("Failed to update task", error);
            toast.error("Failed to update task.");
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axiosInstance.delete(`/projects/${member.projectId}/applications/${member._id}/tasks/${taskId}`);
            const updatedTasks = tasks.filter(t => t._id !== taskId);
            setTasks(updatedTasks);
            onTaskUpdate(member._id, updatedTasks);
            toast.success('Task deleted.');
        } catch (error) {
            console.error("Failed to delete task", error);
            toast.error("Failed to delete task.");
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full text-left">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Tasks</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {tasks.length > 0 ? tasks.map(task => (
                    <div key={task._id} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center cursor-pointer" onClick={() => handleToggleTask(task._id, task.completed)}>
                            {task.completed ? <CheckSquare size={16} className="mr-2 text-green-500" /> : <Square size={16} className="mr-2 text-gray-400" />}
                            <span className={task.completed ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}>{task.description}</span>
                        </div>
                        <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )) : <p className="text-xs text-gray-400 italic">No tasks assigned.</p>}
            </div>
            {isAdding ? (
                <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="New task description..."
                        className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900"
                        autoFocus
                    />
                    <button type="submit" className="px-2 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Add</button>
                </form>
            ) : (
                <button onClick={() => setIsAdding(true)} className="mt-3 flex items-center text-xs font-semibold text-indigo-600 hover:underline">
                    <Plus size={14} className="mr-1" /> Add Task
                </button>
            )}
        </div>
    );
};

const TeamMemberCard = ({ member, onTaskUpdate }) => (
    <motion.div variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
        <Card className="p-5 flex flex-col items-center text-center group h-full">
            <Link to={`/profile/${member.userId._id}`} className="flex-shrink-0">
                <img src={member.userId.image} alt={member.userId.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all" />
            </Link>
            <div className="flex-grow mt-4">
                <Link to={`/profile/${member.userId._id}`}><h3 className="font-bold text-lg hover:text-indigo-600">{member.userId.name}</h3></Link>
                <p className="text-sm text-gray-500">{member.userId.role}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {member.userId.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
                    ))}
                </div>
                <div className="mt-3">
                    {member.hasSubmitted && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Work Submitted</span>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Working on:</p>
                <Link to={`/projects/${member.projectId}/applicants`} className="text-sm font-semibold text-indigo-600 hover:underline line-clamp-1">{member.projectTitle}</Link>
            </div>
            <TaskManagement member={member} onTaskUpdate={onTaskUpdate} />
        </Card>
    </motion.div>
);

const TeamPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filterProjectId, setFilterProjectId] = useState('all');
    const [activeTab, setActiveTab] = useState('team'); // 'team' or 'submissions'
    const [currentPage, setCurrentPage] = useState(1);
    const PROJECTS_PER_PAGE = 3;
    const [feedbackInputs, setFeedbackInputs] = useState({});

    useEffect(() => {
        const fetchTeamMembers = async () => {
            // This check is now inside the effect to wait for the user object to be available
            if (user && user.role !== 'Client') {
                navigate('/home');
                return;
            }
            if (!user) return; // Don't fetch if user isn't loaded yet

            try {
                const response = await axiosInstance.get('/projects/my-projects/list');
                setProjects(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load team members.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [user, navigate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, filterProjectId]);

    const projectsWithTeam = useMemo(() => {
        return projects
            .map(project => ({
                ...project,
                teamMembers: project.applicants
                    .filter(app => app.status === 'accepted')
                    .map(app => ({
                        ...app,
                        hasSubmitted: project.submissions?.some(sub => sub.freelancerId._id === app.userId._id)
                    }))
            }))
            .filter(project => project.teamMembers.length > 0);
    }, [projects]);

    const displayedProjects = useMemo(() => {
        if (filterProjectId === 'all') {
            return projectsWithTeam;
        }
        return projectsWithTeam.filter(p => p._id === filterProjectId);
    }, [projectsWithTeam, filterProjectId]);

    const handleTaskUpdate = (applicantId, updatedTasks) => {
        setProjects(prevProjects => prevProjects.map(p => ({
            ...p,
            // Also update submissions in case we need to re-render them
            submissions: p.submissions.map(sub => {
                if (sub.freelancerId._id === updatedTasks.userId) {
                    return {
                        ...sub,
                    };
                }
                return sub;
            }),
            applicants: p.applicants.map(app => {
                if (app._id === applicantId) {
                    return { ...app, tasks: updatedTasks };
                }
                return app;
            })
        })));
    };

    const projectsWithSubmissions = useMemo(() => {
        return projects
            .map(project => ({ ...project, submissions: project.submissions?.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) || [] }))
            .filter(project => project.submissions.length > 0);
    }, [projects]);

    // Pagination logic
    const totalPages = useMemo(() => {
        const source = activeTab === 'team' ? displayedProjects : projectsWithSubmissions;
        return Math.ceil(source.length / PROJECTS_PER_PAGE);
    }, [activeTab, displayedProjects, projectsWithSubmissions]);

    const paginatedItems = useMemo(() => {
        const source = activeTab === 'team' ? displayedProjects : projectsWithSubmissions;
        const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
        return source.slice(startIndex, startIndex + PROJECTS_PER_PAGE);
    }, [activeTab, displayedProjects, projectsWithSubmissions, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handleApproveSubmission = async (projectId, submissionId) => {
        try {
            await axiosInstance.patch(`/projects/${projectId}/submissions/${submissionId}/status`, { status: 'approved' });
            setProjects(prevProjects => prevProjects.map(p => {
                if (p._id === projectId) {
                    return {
                        ...p,
                        submissions: p.submissions.map(sub => sub._id === submissionId ? { ...sub, status: 'approved' } : sub)
                    };
                }
                return p;
            }));
            toast.success('Submission approved!');
        } catch (error) {
            console.error('Error approving submission', error);
            toast.error(error.response?.data?.message || 'Failed to approve submission.');
        }
    };

    const handleRequestChanges = async (projectId, submissionId) => {
        const feedback = feedbackInputs[submissionId];
        if (!feedback || !feedback.trim()) {
            toast.error('Please provide feedback for the changes.');
            return;
        }
        try {
            await axiosInstance.patch(`/projects/${projectId}/submissions/${submissionId}/status`, { status: 'changes_requested', feedback });
            setProjects(prevProjects => prevProjects.map(p => {
                if (p._id === projectId) {
                    return {
                        ...p,
                        submissions: p.submissions.map(sub => sub._id === submissionId ? { ...sub, status: 'changes_requested', feedback } : sub)
                    };
                }
                return p;
            }));
            setFeedbackInputs(prev => ({ ...prev, [submissionId]: '' }));
            toast.success('Changes requested!');
        } catch (error) {
            console.error('Error requesting changes', error);
            toast.error(error.response?.data?.message || 'Failed to request changes.');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Approved</span>;
            case 'changes_requested':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Changes Requested</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Pending</span>;
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
            className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="relative mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Project Collaboration</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mt-1">All accepted freelancers for your projects.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-8">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'team' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Users size={16} className="inline-block mr-2" />
                    My Team
                </button>
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'submissions' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Inbox size={16} className="inline-block mr-2" />
                    Submissions
                </button>
            </motion.div>

            {projectsWithTeam.length > 0 && (
                <motion.div variants={itemVariants} className="mb-8 max-w-md mx-auto">
                    <label htmlFor="project-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Filter size={16} className="mr-2" />
                        Filter by Project
                    </label>
                    <select
                        id="project-filter"
                        value={filterProjectId}
                        onChange={(e) => setFilterProjectId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    >
                        <option value="all">All Projects</option>
                        {projectsWithTeam.map(project => (
                            <option key={project._id} value={project._id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                </motion.div>
            )}

            {activeTab === 'team' && (
                <>
                    {displayedProjects.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-block p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <Users size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">Your Team is Empty</h3>
                            <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Accept applicants to build your team.</p>
                            <Link to="/all-applicants">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
                                >
                                    View Applicants
                                </motion.button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {paginatedItems.map(project => (
                                <motion.div key={project._id} variants={itemVariants}>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-indigo-500 pb-3">
                                        {project.title}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {project.teamMembers.map(member => (
                                            <TeamMemberCard key={member._id} member={{ ...member, projectId: project._id, projectTitle: project.title }} onTaskUpdate={handleTaskUpdate} />
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'submissions' && (
                <>
                    {projectsWithSubmissions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-block p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <Inbox size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">No Submissions Yet</h3>
                            <p className="mt-2 text-md text-gray-500 dark:text-gray-400">When freelancers submit their work, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {paginatedItems.map(project => (
                                <motion.div key={project._id} variants={itemVariants}>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b-2 border-indigo-500 pb-3">
                                        {project.title}
                                    </h2>
                                    <div className="space-y-4">
                                        {project.submissions.map(submission => (
                                            <Card key={submission._id} className="p-5">
                                                <div className="flex items-start gap-4">
                                                    <img src={submission.freelancerId.image} alt={submission.freelancerId.name} className="w-12 h-12 rounded-full object-cover" />
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-bold text-gray-800 dark:text-white">{submission.freelancerId.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                {getStatusBadge(submission.status)}
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(submission.submittedAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 text-gray-600 dark:text-gray-300 flex items-start gap-2"><MessageSquare size={16} className="mt-1 flex-shrink-0" /> {submission.message}</p>
                                                        {submission.githubUrl && (
                                                            <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-2 text-sm">
                                                                <Github size={14} /> View on GitHub
                                                            </a>
                                                        )}
                                                        {submission.link && (
                                                            <a href={submission.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2 text-sm">
                                                                <LinkIcon size={14} /> View Work
                                                            </a>
                                                        )}
                                                        {submission.status === 'changes_requested' && submission.feedback && (
                                                            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                                                <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>Feedback:</strong> {submission.feedback}</p>
                                                            </div>
                                                        )}
                                                        {submission.status === 'pending' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <button
                                                                    onClick={() => handleApproveSubmission(project._id, submission._id)}
                                                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-1"
                                                                >
                                                                    <Check size={14} /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const current = feedbackInputs[submission._id] || '';
                                                                        setFeedbackInputs(prev => ({ ...prev, [submission._id]: current }));
                                                                    }}
                                                                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 flex items-center gap-1"
                                                                >
                                                                    <X size={14} /> Request Changes
                                                                </button>
                                                            </div>
                                                        )}
                                                        {feedbackInputs[submission._id] !== undefined && submission.status === 'pending' && (
                                                            <div className="mt-3">
                                                                <textarea
                                                                    value={feedbackInputs[submission._id]}
                                                                    onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [submission._id]: e.target.value }))}
                                                                    placeholder="Provide feedback for the changes..."
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 text-sm"
                                                                    rows={3}
                                                                />
                                                                <div className="mt-2 flex gap-2">
                                                                    <button
                                                                        onClick={() => handleRequestChanges(project._id, submission._id)}
                                                                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                                                                    >
                                                                        Submit Feedback
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setFeedbackInputs(prev => ({ ...prev, [submission._id]: undefined }))}
                                                                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
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
                        className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <ChevronRight size={16} />
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
export default TeamPage;