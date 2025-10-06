import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Briefcase, User, Code, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from './Card';

const StarRating = ({ rating = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />)}
            {halfStar && <Star key="half" className="w-4 h-4 text-yellow-400 fill-current" />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-current" />)}
        </div>
    );
};

const ApplicantProfileModal = memo(({ applicant, isOpen, onClose }) => {
    if (!isOpen || !applicant) return null;

    const user = applicant.userId;

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
                        <div className="flex items-center gap-4">
                            <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                                <p className="text-md text-indigo-600 dark:text-indigo-400">{user.role}</p>
                                <div className="flex items-center mt-1">
                                    <StarRating rating={user.rating?.value} />
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({user.rating?.reviews || 0} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <motion.button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" whileHover={{ scale: 1.1, rotate: 90 }}>
                            <X size={24} />
                        </motion.button>
                    </div>

                    <div className="p-6 space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center"><User size={18} className="mr-2" /> About</h3>
                            <p className="text-gray-600 dark:text-gray-400">{user.bio || 'No bio provided.'}</p>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Code size={18} className="mr-2" /> Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills?.length > 0 ? user.skills.map(skill => (
                                    <span key={skill} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                                )) : <p className="text-gray-400 italic text-sm">No skills listed.</p>}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Briefcase size={18} className="mr-2" /> Past Projects</h3>
                            <div className="space-y-3">
                                {user.pastProjects?.length > 0 ? user.pastProjects.map((project, index) => (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{project.title}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{project.role}</p>
                                            </div>
                                            <ExternalLink className="text-gray-400 group-hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100" size={16} />
                                        </div>
                                    </a>
                                )) : <p className="text-gray-400 italic text-sm">No past projects listed.</p>}
                            </div>
                        </Card>

                        <div className="text-center pt-4">
                            <Link to={`/profile/${user._id}`} onClick={onClose} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                View Full Public Profile &rarr;
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
});

export default ApplicantProfileModal;