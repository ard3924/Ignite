import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import axiosInstance from '../axiosInterceptor';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
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
        setMessage('');
        setError('');

        try {
            const response = await axiosInstance.post('/user/forgot-password', { email });
            setMessage(response.data.message);
            toast.success('OTP sent to your email!');
            // Redirect to reset password page with email in state or localStorage
            navigate('/reset-password', { state: { email } });
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 mt-12">Forgot Password</h2>
                    <motion.form onSubmit={handleSubmit} variants={formVariants} initial="hidden" animate="visible">
                        <motion.div className="mb-4" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="you@example.com"
                                required
                            />
                        </motion.div>
                        {message && <p className="text-green-500 text-sm text-center mb-4">{message}</p>}
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <motion.button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50" whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgb(99 102 241 / 0.5)" }}>
                            {loading ? 'Sending...' : 'Send OTP'}
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

export default ForgotPasswordPage;
