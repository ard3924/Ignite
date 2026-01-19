import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import axiosInstance from '../axiosInterceptor';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post('/user/verify-otp', {
                email,
                otp,
                newPassword: password
            });
            toast.success(response.data.message);
            navigate('/login');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
            >
                <Card className="w-full max-w-xl relative">
                    <Link to="/login" className="absolute top-4 left-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 z-10">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 mt-12">Reset Password</h2>
                    <motion.form onSubmit={handleSubmit} variants={formVariants} initial="hidden" animate="visible">
                        <motion.div className="mb-4" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="your-email@example.com"
                                required
                            />
                        </motion.div>
                        <motion.div className="mb-4" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="otp">OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                required
                            />
                        </motion.div>
                        <motion.div className="mb-4 relative" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">New Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </motion.div>
                        <motion.div className="mb-6 relative" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </motion.div>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <motion.button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50" whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgb(99 102 241 / 0.5)" }}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </motion.button>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
                            Remember your password? <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Log In</Link>
                        </p>
                    </motion.form>
                </Card>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
