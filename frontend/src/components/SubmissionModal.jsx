import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Link as LinkIcon, MessageSquare, Github } from 'lucide-react';

const SubmissionModal = ({ isOpen, onClose, onSubmit, projectTitle }) => {
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [githubUrl, setGithubUrl] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSubmit({ message, link, githubUrl });
            onClose();
        } catch (err) {
            setError(err.message || 'An unknown error occurred.');
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
        <AnimatePresence>
            {isOpen && (
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
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Work for: {projectTitle}</h2>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-sm text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
                                <div>
                                    <label htmlFor="submission-message" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><MessageSquare size={14} /> Message</label>
                                    <textarea id="submission-message" value={message} onChange={(e) => setMessage(e.target.value)} rows="4" placeholder="e.g., 'Here is the final delivery for the project. All features are complete and tested.'" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none" required />
                                </div>
                                <div>
                                    <label htmlFor="submission-github-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 items-center gap-2"><Github size={14} /> Link to Github Repo </label>
                                    <input id="submission-github-url" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="e.g., https://github.com/username/repo" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" required />
                                </div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Work</>}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SubmissionModal;