import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Mail, Linkedin } from 'lucide-react';

const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
                    onClick={e => e.stopPropagation()}
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
                        <motion.button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                            <X size={24} />
                        </motion.button>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><ArrowRight size={18} className="mr-2 text-indigo-500" />Project Description</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.description}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><ArrowRight size={18} className="mr-2 text-indigo-500" />Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.skillsRequired?.map((skill, index) => (
                                    <span key={index} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold px-3 py-1 rounded-full">
                                        {skill}
                                    </span>
                                )) || <li>No skills listed.</li>}
                            </div>
                        </motion.div>
                        {project.createdBy && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><ArrowRight size={18} className="mr-2 text-indigo-500" />About the Client</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={project.createdBy.image} alt={project.createdBy.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{project.createdBy.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.createdBy.groupName || 'Individual Client'}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{project.createdBy.bio || 'No client bio provided.'}</p>
                                <div className="flex flex-wrap gap-4 items-center text-sm">
                                    {project.createdBy.email && (
                                        <a href={`mailto:${project.createdBy.email}`} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                            <Mail size={16} /> {project.createdBy.email}
                                        </a>
                                    )}
                                    {project.createdBy.social?.linkedin && (
                                        <a href={project.createdBy.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                            <Linkedin size={16} /> LinkedIn
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        <motion.div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProjectModal;