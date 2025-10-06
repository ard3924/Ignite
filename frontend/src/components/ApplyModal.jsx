import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

const ApplyModal = ({ project, isOpen, onClose, onSubmit }) => {
    const [motivation, setMotivation] = useState('');
    const [roleConfirmation, setRoleConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !project) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            setError(''); // Clear previous errors
            await onSubmit(project.projectId, roleConfirmation, motivation);
            onClose(); // Close modal on success
        } catch (error) {
            console.error("Application submission failed:", error);
            setError(error.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg"
                onClick={e => e.stopPropagation()}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply for: {project.title}</h2>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            You are applying as a freelancer. Confirm your intended role and provide a brief statement of motivation.
                        </p>

                        {error && (
                            <p className="text-sm text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>
                        )}

                        <div>
                            <label htmlFor="roleConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Your Specific Role
                            </label>
                            <input
                                id="roleConfirm"
                                type="text"
                                value={roleConfirmation}
                                onChange={(e) => setRoleConfirmation(e.target.value)}
                                placeholder="e.g., Senior React Developer"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Why are you the best fit for this team? (Max 200 chars)
                            </label>
                            <textarea
                                id="motivation"
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                                rows="3"
                                maxLength="200"
                                placeholder="I have 3 years of experience with the MERN stack and built a similar e-commerce feature..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ApplyModal;