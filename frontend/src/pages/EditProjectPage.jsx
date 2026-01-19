import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, LoaderCircle, AlertTriangle, LogIn, ArrowLeft } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import { useAuth } from '../hooks/AuthContext.jsx';

const EditProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        // goals field removed
        skillsRequired: '',
        deadline: '',
    });
    const [isLoading, setIsLoading] = useState(true); // For initial data fetch
    const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axiosInstance.get(`/projects/${projectId}`);
                const { title, description, skillsRequired, deadline, goals } = response.data;
                setProjectData({
                    title,
                    description,
                    // goals field removed
                    skillsRequired: skillsRequired.join(', '), // Convert array to comma-separated string for input
                    deadline: deadline ? new Date(deadline).toISOString().split('T')[0] : '', // Format date for input
                });
            } catch (err) {
                setError('Failed to load project data. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.role === 'Client') {
            fetchProject();
        } else {
            setIsLoading(false);
        }
    }, [projectId, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                ...projectData,
                skillsRequired: projectData.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill),
            };

            await axiosInstance.put(`/projects/${projectId}`, payload);
            navigate('/projects'); // Redirect to projects page on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update project. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user || user.role !== 'Client') {
        return (
            <div className="container mx-auto py-12 px-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="max-w-3xl mx-auto text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Only clients can edit projects.</p>
                        <Link to="/login"><motion.button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700" whileHover={{ scale: 1.05 }}><LogIn size={20} className="inline mr-2" /> Go to Login</motion.button></Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="max-w-3xl mx-auto">
                    <div className="relative text-center mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Back"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
                            <input id="title" name="title" type="text" value={projectData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Description</label>
                            <textarea id="description" name="description" rows="4" value={projectData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                            {/* goals field removed */}
                        </div>
                        <div>
                            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills</label>
                            <input id="skillsRequired" name="skillsRequired" type="text" value={projectData.skillsRequired} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                            <p className="text-xs text-gray-500 mt-1">Enter skills separated by commas.</p>
                        </div>
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                            <input id="deadline" name="deadline" type="date" value={projectData.deadline} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default EditProjectPage;