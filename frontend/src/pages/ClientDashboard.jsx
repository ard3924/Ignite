import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, LoaderCircle, AlertTriangle, Edit, Star } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';

const ClientDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientProjects = async () => {
            try {
                const response = await axiosInstance.get('/projects/my-projects/list');
                setProjects(response.data);
            } catch (err) {
                setError('Failed to load your projects. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClientProjects();
    }, []);

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
        <div className="container mx-auto py-12 px-4">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            >
                My Projects
            </motion.h1>

            {projects.length === 0 ? (
                <div className="text-center">
                    <p className="text-lg text-gray-600 dark:text-gray-400">You haven't posted any projects yet.</p>
                    <Link to="/create-project"> {/* Assuming a route to create projects */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
                        >
                            Post a Project
                        </motion.button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col">
                                <div className="flex-grow">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <Link to={`/projects/${project._id}/applicants`} className="flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                        <Users size={18} className="mr-2" />
                                        <span>
                                            {project.applicants.length} {project.applicants.length === 1 ? 'Applicant' : 'Applicants'}
                                        </span>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/projects/${project._id}/edit`} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <Edit size={16} />
                                        </Link>
                                        {/* Example: Show "Leave Review" button if project is completed */}
                                        {project.status === 'completed' && !project.hasReview && (
                                            <Link to={`/projects/${project._id}/review`} className="flex items-center justify-center px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600">
                                                <Star size={14} className="mr-1.5" />
                                                Leave Review
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;