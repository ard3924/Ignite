import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoaderCircle, AlertTriangle, Mail, Check, X, Users, ArrowLeft, Github, Linkedin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import ApplicantProfileModal from '../components/ApplicantProfileModal';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ApplicantsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [updatingId, setUpdatingId] = useState(null); // To track which application is being updated
    const [selectedApplicant, setSelectedApplicant] = useState(null); // For the profile modal
    const [currentPage, setCurrentPage] = useState(1);
    const APPLICANTS_PER_PAGE = 5;

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await axiosInstance.get(`/projects/${projectId}/applications`);
                setProject(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load applicants.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [projectId]);

    const handleUpdateStatus = async (applicationId, status) => {
        setUpdatingId(applicationId);
        try {
            const response = await axiosInstance.patch(
                `/projects/${projectId}/applications/${applicationId}/status`,
                { status }
            );
            // Update the local state to reflect the change without a full page reload
            setProject(prevProject => ({
                ...prevProject,
                applicants: prevProject.applicants.map(app =>
                    app._id === applicationId ? response.data.applicant : app
                )
            }));
        } catch (err) {
            // You could set a specific error message for this action
            console.error("Failed to update status", err);
        } finally {
            setUpdatingId(null);
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

    const applicants = project?.applicants || [];
    const totalPages = Math.ceil(applicants.length / APPLICANTS_PER_PAGE);
    const paginatedApplicants = applicants.slice(
        (currentPage - 1) * APPLICANTS_PER_PAGE,
        currentPage * APPLICANTS_PER_PAGE
    );

    return (
        <motion.div
            className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="relative mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                    aria-label="Back to projects"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Applicants for</h1>
                <p className="text-2xl text-indigo-600 dark:text-indigo-400 text-center">{project?.title}</p>
            </motion.div>

            {project?.applicants.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-block p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Users size={48} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">No Applicants Yet</h3>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Your project has been posted! It may take some time for freelancers to discover it and submit their applications. Check back soon!
                    </p>
                </div>
            ) : (
                <motion.div className="space-y-6" variants={containerVariants}>
                    {paginatedApplicants.map((applicant) => (
                        <motion.div
                            key={applicant._id}
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                        >
                            <Card className="p-6 flex flex-col md:flex-row items-start gap-6 group">
                                <Link to={`/profile/${applicant.userId._id}`} className="flex-shrink-0">
                                    <img
                                        src={applicant.userId.image}
                                        alt={applicant.userId.name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all"
                                    />
                                </Link>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link to={`/profile/${applicant.userId._id}`}>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition-colors">{applicant.userId.name}</h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{applicant.userId.role}</p>
                                            <div className="flex items-center mt-1 space-x-3">
                                                {applicant.userId.social?.github && (
                                                    <a href={applicant.userId.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                        <Github size={16} />
                                                    </a>
                                                )}
                                                {applicant.userId.social?.linkedin && (
                                                    <a href={applicant.userId.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                        <Linkedin size={16} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center mt-2">
                                                <a href={`mailto:${applicant.userId.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    <Mail size={14} /> {applicant.userId.email}
                                                </a>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            applicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {applicant.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{applicant.userId.bio}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {applicant.userId.skills.slice(0, 5).map(skill => (
                                            <span key={skill} className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Letter</h4>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{applicant.coverLetter}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        {applicant.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(applicant._id, 'accepted')}
                                                    disabled={updatingId === applicant._id}
                                                    className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
                                                >
                                                    {updatingId === applicant._id ? <LoaderCircle size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />} Accept
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(applicant._id, 'rejected')}
                                                    disabled={updatingId === applicant._id}
                                                    className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                                                >
                                                    {updatingId === applicant._id ? <LoaderCircle size={16} className="animate-spin mr-2" /> : <X size={16} className="mr-2" />} Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setSelectedApplicant(applicant)}
                                            className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            <Eye size={16} className="mr-2" /> View Profile
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

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

            <ApplicantProfileModal
                applicant={selectedApplicant}
                isOpen={!!selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
            />
        </motion.div>
    );
};

export default ApplicantsPage;