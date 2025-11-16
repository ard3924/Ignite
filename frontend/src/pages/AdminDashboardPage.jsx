import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Shield, AlertTriangle, LoaderCircle, UserCheck, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import { useAuth } from '../hooks/AuthContext';
import Card from '../components/Card';
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

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, projects: 0, applicants: 0 });
    const [userStats, setUserStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [featuredProjectsPage, setFeaturedProjectsPage] = useState(1);
    const PROJECTS_PER_PAGE = 5;
    const [testimonialsPage, setTestimonialsPage] = useState(1);
    const TESTIMONIALS_PER_PAGE = 5;

    useEffect(() => {
        const fetchData = async () => {
            if (user === null) {
                // Wait for user state to be determined (loading from localStorage)
                return;
            }
            if (!user) {
                // Redirect to login if no user
                window.location.href = '/login';
                return;
            }
            if (user.role !== 'Admin') {
                setLoading(false);
                return;
            }

            try {
                const [usersRes, projectsRes, applicantsRes, testimonialsRes, userStatsRes] = await Promise.all([
                    axiosInstance.get('/admin/users'),
                    axiosInstance.get('/admin/projects'),
                    axiosInstance.get('/admin/applicants'),
                    axiosInstance.get('/admin/testimonials'),
                    axiosInstance.get('/admin/stats/users'),
                ]);

                setStats({ users: usersRes.data.length, projects: projectsRes.data.length, applicants: applicantsRes.data.length });
                setUserStats(userStatsRes.data);
                setRecentUsers(usersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
                setRecentProjects(projectsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
                setTestimonials(testimonialsRes.data);
                setProjects(projectsRes.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (user?.role !== 'Admin') {
        return (
            <div className="container mx-auto py-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">You do not have permission to view this page.</p>
                <Link to="/home" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
                    Go to Homepage
                </Link>
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

    const toggleVisibility = async (testimonialId, currentVisibility) => {
        try {
            await axiosInstance.patch(`/admin/testimonials/${testimonialId}/visibility`, { visible: !currentVisibility });
            setTestimonials(prev =>
                prev.map(t =>
                    t._id === testimonialId ? { ...t, visible: !currentVisibility } : t
                )
            );
        } catch (err) {
            console.error('Failed to update testimonial visibility', err);
        }
    };

    const toggleFeatured = async (projectId, currentFeatured) => {
        try {
            await axiosInstance.patch(`/admin/projects/${projectId}/featured`, { featured: !currentFeatured });
            setProjects(prev =>
                prev.map(p =>
                    p._id === projectId ? { ...p, featured: !currentFeatured } : p
                )
            );
        } catch (err) {
            console.error('Failed to update project featured status', err);
        }
    };

    const totalFeaturedProjectsPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
    const paginatedFeaturedProjects = projects.slice(
        (featuredProjectsPage - 1) * PROJECTS_PER_PAGE,
        featuredProjectsPage * PROJECTS_PER_PAGE
    );

    const totalTestimonialsPages = Math.ceil(testimonials.length / TESTIMONIALS_PER_PAGE);
    const paginatedTestimonials = testimonials.slice(
        (testimonialsPage - 1) * TESTIMONIALS_PER_PAGE,
        testimonialsPage * TESTIMONIALS_PER_PAGE
    );

    return (
        <motion.div
            className="container mx-auto py-12 px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-10 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                    <Shield size={36} className="text-indigo-500" />
                    Admin Dashboard
                </h1>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Platform overview and management.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <Card className="text-center">
                    <Users size={32} className="mx-auto text-blue-500 mb-2" />
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.users}</p>
                    <p className="text-md text-gray-500 dark:text-gray-400">Total Users</p>
                </Card>
                <Card className="text-center">
                    <Briefcase size={32} className="mx-auto text-purple-500 mb-2" />
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.projects}</p>
                    <p className="text-md text-gray-500 dark:text-gray-400">Total Projects</p>
                </Card>
                <Card className="text-center">
                    <UserCheck size={32} className="mx-auto text-green-500 mb-2" />
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{stats.applicants}</p>
                    <p className="text-md text-gray-500 dark:text-gray-400">Total Applicants</p>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 my-12">
                <Link to="/admin/all-users" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                    <Users size={20} />
                    View All Users
                </Link>
                <Link to="/admin/all-projects" className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                    <Briefcase size={20} />
                    View All Projects
                </Link>
            </motion.div>

            {userStats && (
                <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Registration Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card className="text-center">
                            <Users size={28} className="mx-auto text-indigo-500 mb-2" />
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.freelancers}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Freelancers</p>
                        </Card>
                        <Card className="text-center">
                            <UserCheck size={28} className="mx-auto text-purple-500 mb-2" />
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.clients}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Clients</p>
                        </Card>
                        <Card className="text-center">
                            <Briefcase size={28} className="mx-auto text-orange-500 mb-2" />
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.projects}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Projects Created</p>
                        </Card>
                        <Card className="text-center">
                            <CheckCircle size={28} className="mx-auto text-green-500 mb-2" />
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.reduce((acc, p) => acc + p.applicants.filter(a => a.status === 'accepted').length, 0)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Applicants Selected</p>
                        </Card>
                    </div>

                    <Card>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Projects with Most Applicants</h3>
                        <div className="space-y-3">
                            {projects
                                .sort((a, b) => b.applicants.length - a.applicants.length)
                                .slice(0, 5)
                                .map((project, index) => (
                                    <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{project.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">by {project.createdBy?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded">
                                                {project.applicants.length} Applicants
                                            </span>
                                            {project.featured && (
                                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-xs rounded">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Users</h3>
                    <ul className="space-y-3">
                        {recentUsers.map(u => (
                            <li key={u._id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'Client' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'}`}>
                                    {u.role}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Projects</h3>
                    <ul className="space-y-3">
                        {recentProjects.map(p => (
                            <li key={p._id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{p.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">by {p.createdBy?.name || 'N/A'}</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded">
                                    {p.applicants.length} Applicants
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Testimonials</h2>
                <div className="space-y-4">
                    {paginatedTestimonials.map(t => (
                        <div key={t._id} className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{t.name} - <span className="italic">{t.role}</span></p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{t.quote}</p>
                            </div>
                            <button
                                onClick={() => toggleVisibility(t._id, t.visible)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${t.visible ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                            >
                                {t.visible ? 'Visible' : 'Hidden'}
                            </button>
                        </div>
                    ))}
                </div>
                {totalTestimonialsPages > 1 && (
                    <div className="flex justify-center items-center mt-8">
                        <button
                            onClick={() => setTestimonialsPage(p => Math.max(1, p - 1))}
                            disabled={testimonialsPage === 1}
                            className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Page {testimonialsPage} of {totalTestimonialsPages}
                        </span>
                        <button
                            onClick={() => setTestimonialsPage(p => Math.min(totalTestimonialsPages, p + 1))}
                            disabled={testimonialsPage === totalTestimonialsPages}
                            className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Featured Projects</h2>
                <div className="space-y-4">
                    {paginatedFeaturedProjects.map(p => (
                        <div key={p._id} className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{p.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">by {p.createdBy?.name || 'N/A'}</p>
                            </div>
                            <button
                                onClick={() => toggleFeatured(p._id, p.featured)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${p.featured ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                            >
                                {p.featured ? 'Featured' : 'Not Featured'}
                            </button>
                        </div>
                    ))}
                </div>
                {totalFeaturedProjectsPages > 1 && (
                    <div className="flex justify-center items-center mt-8">
                        <button
                            onClick={() => setFeaturedProjectsPage(p => Math.max(1, p - 1))}
                            disabled={featuredProjectsPage === 1}
                            className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Page {featuredProjectsPage} of {totalFeaturedProjectsPages}
                        </span>
                        <button
                            onClick={() => setFeaturedProjectsPage(p => Math.min(totalFeaturedProjectsPages, p + 1))}
                            disabled={featuredProjectsPage === totalFeaturedProjectsPages}
                            className="px-3 py-2 mx-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboardPage;
