import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoaderCircle, AlertTriangle, Users, ArrowLeft, Mail, Eye, Search, Github, Linkedin, CheckCircle, XCircle, HelpCircle, Check, X } from 'lucide-react';
import axiosInstance from '../axiosInterceptor';
import Card from '../components/Card';
import ApplicantProfileModal from '../components/ApplicantProfileModal';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ApplicantsHeader = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => (
    <motion.div variants={itemVariants} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by name or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                {['all', 'pending', 'accepted', 'rejected'].map(status => (
                    <button key={status} onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out capitalize focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 ${filterStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                        {status}
                    </button>
                ))}
            </div>
        </div>
    </motion.div>
);

const AllApplicantsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchAllApplicants = async () => {
        try {
            setLoading(true);
            // Fetch all projects for the logged-in client, which includes applicant data.
            const response = await axiosInstance.get('/projects/my-projects/list');
            setProjects(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load applicants.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllApplicants();
    }, []);

    const handleUpdateStatus = async (projectId, applicationId, status) => {
        setUpdatingId(applicationId);
        try {
            await axiosInstance.patch(
                `/projects/${projectId}/applications/${applicationId}/status`,
                { status }
            );
            // Refetch projects to update UI
            await fetchAllApplicants();
        } catch (err) {
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

    const filteredProjects = projects.map(project => {
        const filteredApplicants = project.applicants.filter(applicant => {
            const statusMatch = filterStatus === 'all' || applicant.status === filterStatus;
            const searchMatch = searchTerm === '' ||
                applicant.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (Array.isArray(applicant.userId.skills) && applicant.userId.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
            return statusMatch && searchMatch;
        });
        return { ...project, applicants: filteredApplicants };
    }).filter(project => project.applicants.length > 0); // Only show projects that still have applicants after filtering

    const allProjectsHaveNoApplicants = projects.length === 0;
    const noResultsAfterFilter = !allProjectsHaveNoApplicants && filteredProjects.length === 0;

    const StatusBadge = ({ status }) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize flex items-center gap-1.5";
        switch (status) {
            case 'accepted':
                return <div className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}><CheckCircle size={14} /> Accepted</div>;
            case 'rejected':
                return <div className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}><XCircle size={14} /> Rejected</div>;
            case 'pending':
            default:
                return <div className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}><HelpCircle size={14} /> Pending</div>;
        }
    };

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
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">All Applicants</h1>
            </motion.div>

            {!allProjectsHaveNoApplicants && (
                <ApplicantsHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                />
            )}

            {allProjectsHaveNoApplicants ? (
                <div className="text-center py-16">
                    <div className="inline-block p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Users size={48} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">No Applicants Yet</h3>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">No one has applied to any of your projects.</p>
                </div>
            ) : noResultsAfterFilter ? (
                <div className="text-center py-16">
                    <div className="inline-block p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Search size={48} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">No Applicants Found</h3>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Try adjusting your search or filter settings.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {filteredProjects.map(project => (
                        <motion.div key={project._id} variants={itemVariants}>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b-2 border-indigo-500 pb-2">
                                <Link to={`/projects/${project._id}/applicants`} className="hover:underline">{project.title}</Link>
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {project.applicants.map(applicant => (
                                    <motion.div key={applicant._id} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                                        <Card className="p-5 flex items-start gap-5 group">
                                            <Link to={`/profile/${applicant.userId._id}`} className="flex-shrink-0">
                                                <img src={applicant.userId.image} alt={applicant.userId.name} className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-all" />
                                            </Link>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <Link to={`/profile/${applicant.userId._id}`}><h3 className="font-bold text-lg hover:text-indigo-600">{applicant.userId.name}</h3></Link>
                                                        <p className="text-sm text-gray-500">{applicant.userId.role}</p>
                                                        <a href={`mailto:${applicant.userId.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-1">
                                                            <Mail size={14} /> {applicant.userId.email}
                                                        </a>
                                                        <div className="flex items-center mt-1 space-x-3">
                                                            {applicant.userId.social?.github && <a href={applicant.userId.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600"><Github size={16} /></a>}
                                                            {applicant.userId.social?.linkedin && <a href={applicant.userId.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600"><Linkedin size={16} /></a>}
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={applicant.status} />
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{applicant.userId.bio}</p>
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {Array.isArray(applicant.userId.skills) ? applicant.userId.skills.slice(0, 4).map(skill => (
                                                        <span key={skill} className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
                                                    )) : null}
                                                </div>
                                                <div className="mt-4 flex justify-end items-center gap-4">
                                                    <button onClick={() => setSelectedApplicant(applicant)} className="flex items-center text-sm font-semibold text-indigo-600 hover:underline">
                                                        <Eye size={16} className="mr-1" /> View Details
                                                    </button>
                                                    {applicant.status === 'pending' && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleUpdateStatus(project._id, applicant._id, 'accepted')}
                                                                disabled={updatingId === applicant._id}
                                                                className="flex items-center justify-center px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 text-xs font-semibold"
                                                            >
                                                                {updatingId === applicant._id ? <LoaderCircle size={14} className="animate-spin mr-1.5" /> : <Check size={14} className="mr-1.5" />} Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(project._id, applicant._id, 'rejected')}
                                                                disabled={updatingId === applicant._id}
                                                                className="flex items-center justify-center px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 text-xs font-semibold"
                                                            >
                                                                {updatingId === applicant._id ? <LoaderCircle size={14} className="animate-spin mr-1.5" /> : <X size={14} className="mr-1.5" />} Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <ApplicantProfileModal
                applicant={selectedApplicant}
                isOpen={!!selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
            />
        </motion.div>
    );
};

export default AllApplicantsPage;