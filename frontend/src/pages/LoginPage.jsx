import React, { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import { useAuth } from '../hooks/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const location = useLocation();
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginError('');
        if (!captchaToken) {
            setLoginError('Please complete the CAPTCHA');
            setLoading(false);
            return;
        }
        try {
            const from = location.state?.from;
            const redirectTo = from ? `${from.pathname}${from.search}${from.hash}` : '/profile';
            await login({
                email: loginEmail,
                password: loginPassword,
                captchaToken: captchaToken,
            }, redirectTo);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setLoginError(errorMessage);
            console.error('Login error:', error.response || error);
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
                    <Link to="/home" className="absolute top-4 left-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Log In</h2>
                    <motion.form onSubmit={handleLogin} variants={formVariants} initial="hidden" animate="visible">
                        <motion.div className="mb-4" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="you@example.com"
                                required
                            />
                        </motion.div>
                        <motion.div className="mb-6 relative" variants={itemVariants}>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </motion.div>
                        <motion.div className="mb-4 flex justify-center" variants={itemVariants}>
                            <ReCAPTCHA
                                sitekey={import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                onChange={(token) => setCaptchaToken(token)}
                                onExpired={() => setCaptchaToken(null)}
                                ref={recaptchaRef}
                            />
                        </motion.div>
                        {loginError && <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>}
                        <motion.button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50" whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgb(99 102 241 / 0.5)" }}>
                            {loading ? 'Logging In...' : 'Log In'}
                        </motion.button>
                        <div className="mt-4 text-center">
                            <Link to="/forgot-password" className="text-sm text-indigo-500 hover:underline">Forgot password?</Link>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
                            Don't have an account? <Link to="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Sign Up</Link>
                        </p>
                    </motion.form>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage
