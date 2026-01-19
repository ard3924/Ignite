import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, LoaderCircle, AlertTriangle, LogIn, ArrowLeft } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import { useAuth } from '../hooks/AuthContext.jsx';

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        // goals field removed
        skillsRequired: '',
        deadline: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...projectData,
                skillsRequired: projectData.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill),
            };

            await axiosInstance.post('/projects', payload);
            navigate('/projects'); // Redirect to projects page on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Security check: Only allow clients to view this page
    if (!user || user.role !== 'Client') {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Card className="max-w-md text-center p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Only clients can post new projects. Please log in with a client account to continue.
                    </p>
                    <Link to="/login">
                        <motion.button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform flex items-center mx-auto" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                            <LogIn size={20} className="mr-2" /> Go to Login
                        </motion.button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="max-w-3xl mx-auto">
                    <div className="relative text-center mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Post a New Project</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={projectData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., E-commerce Website Redesign"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Description</label>
                            <textarea
                                // goals field removed
                                id="description"
                                name="description"
                                rows="4"
                                value={projectData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Describe the project goals, scope, and key deliverables."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills</label>
                            <input
                                id="skillsRequired"
                                name="skillsRequired"
                                type="text"
                                value={projectData.skillsRequired}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., React, Node.js, UI/UX Design"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter skills separated by commas.</p>
                        </div>
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                            <input
                                id="deadline"
                                name="deadline"
                                type="date"
                                value={projectData.deadline}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400">
                            {loading ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                            {loading ? 'Posting Project...' : 'Post Project'}
                        </button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default CreateProjectPage;