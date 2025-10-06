import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, Briefcase, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Code, Github, Linkedin, RocketIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

const SignupPage = () => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState(''); // Role is initially empty
    const [groupName, setGroupName] = useState('');
    const [skills, setSkills] = useState('');
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);
    const [captchaToken, setCaptchaToken] = useState(null);

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const formVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!captchaToken) {
            setError('Please complete the CAPTCHA');
            return;
        }

        setLoading(true);

        try {
            const response = await signup({
                name,
                email,
                password,
                role,
                groupName,
                skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
                social: { github, linkedin },
                captchaToken: captchaToken,
            });
            toast.success(response.data.message);
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
            setError(errorMessage);
            console.error('Signup error:', err.response || err);
        } finally {
            setLoading(false);
        }
    };

    const renderRoleSelection = () => (
        <motion.div
            className="flex justify-center items-center py-12"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
        >
            <motion.div
                id="role-selection-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className="w-full max-w-lg">

                    <motion.h2
                        className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >Join as a Freelancer or Client</motion.h2>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.button
                            id="freelancer-card"
                            onClick={() => setRole('Freelancer')}
                            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(99, 102, 241, 0.2)" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <Users className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mb-4 transition-transform duration-300 group-hover:scale-110" strokeWidth="2" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Freelancer</h3>
                                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">I want to join projects and collaborate with others.</p>
                            </div>
                        </motion.button>
                        <motion.button
                            id="client-card"
                            onClick={() => setRole('Client')}
                            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(168, 85, 247, 0.2)" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <Briefcase className="w-16 h-16 text-purple-500 dark:text-purple-400 mb-4 transition-transform duration-300 group-hover:scale-110" strokeWidth="2" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Client</h3>
                                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">I need to find freelancers for my project.</p>
                            </div>
                        </motion.button>
                    </motion.div>
                    <motion.p
                        className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Already have an account? <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Log In</Link>
                    </motion.p>
                </Card>
            </motion.div>
        </motion.div>
    );

    const renderSignupForm = () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="relative flex flex-col md:flex-row w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
                {/* Left Side */}
                <motion.div
                    className="relative p-8 md:p-12 md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col justify-between"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <div>
                        <div className="flex items-center space-x-2 mb-6">
                            <RocketIcon size={32} />
                            <span className="text-3xl font-bold">Ignite</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Start Your Journey.</h2>
                        <p className="text-indigo-100">
                            {role === 'Freelancer'
                                ? "Join a vibrant community of creators. Find exciting projects, collaborate with talented peers, and build your portfolio."
                                : "Find the perfect talent for your next big idea. Post projects, manage applicants, and build your dream team with ease."
                            }
                        </p>
                    </div>
                </motion.div>

                {/* Right Side (Form) */}
                <motion.div
                    className="p-8 md:p-12 md:w-1/2"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <div className="relative text-center mb-6">
                        <button
                            onClick={() => setRole('')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">as a {role}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    id="email-signup"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Email Address"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password-signup"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Password"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm-password-signup"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Confirm Password"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="groupName"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Group or Company Name (Optional)"
                                />
                            </div>

                            {role === 'Freelancer' && (
                                <>
                                    <div className="relative">
                                        <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            id="skills"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Skills (e.g., React, Node.js)"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="url"
                                                id="github"
                                                value={github}
                                                onChange={(e) => setGithub(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="GitHub Profile URL"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="url"
                                                id="linkedin"
                                                value={linkedin}
                                                onChange={(e) => setLinkedin(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="LinkedIn Profile URL"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <ReCAPTCHA
                                sitekey={import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                onChange={(token) => setCaptchaToken(token)}
                                onExpired={() => setCaptchaToken(null)}
                                ref={recaptchaRef}
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm text-center p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        Already have an account? <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Log In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );

    return role ? renderSignupForm() : renderRoleSelection();
}

export default SignupPage;
