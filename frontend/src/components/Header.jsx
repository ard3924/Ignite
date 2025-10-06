import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, RocketIcon, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import NotificationCenter from './NotificationCenter';
import { useAuth } from '../hooks/AuthContext.jsx';

const navLinkClassName = "relative font-semibold text-gray-600 dark:text-gray-300 transition-all duration-300 after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-full after:bg-indigo-600 dark:after:bg-indigo-400 after:transition-transform after:duration-300 after:ease-in-out";
const activeNavLinkClassName = "text-indigo-600 dark:text-indigo-400 font-bold after:scale-x-100";
const inactiveNavLinkClassName = "hover:text-indigo-600 dark:hover:text-indigo-400 after:scale-x-0 hover:after:scale-x-100";

const getNavLinkClass = ({ isActive }) =>
    `${navLinkClassName} ${isActive ? activeNavLinkClassName : inactiveNavLinkClassName}`;

const IconButton = ({ children, onClick, className = '', 'aria-label': ariaLabel, 'aria-expanded': ariaExpanded }) => (
    <button onClick={onClick} className={`p-2 rounded-full transition-colors duration-300 ${className}`} aria-label={ariaLabel} aria-expanded={ariaExpanded}>
        {children}
    </button>
);

const MotionNavLink = ({ to, children, end = false }) => (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
        <NavLink to={to} className={getNavLinkClass} end={end}>{children}</NavLink>
    </motion.div>
);

const mobileMenuVariants = {
    hidden: {
        opacity: 0,
        y: -20,
        transition: { staggerChildren: 0.05, staggerDirection: -1, when: "afterChildren" }
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
};

const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

const LogoutContainer = ({ isMobile = false }) => {
    const { logout } = useAuth();

    if (isMobile) {
        return (
            <motion.div variants={mobileMenuItemVariants}>
                <button onClick={logout} className={`${navLinkClassName} ${inactiveNavLinkClassName} text-left py-2 w-full block`}>Logout</button>
            </motion.div>
        );
    }

    return (
        <motion.div whileHover={{ y: -3 }}><button onClick={logout} className={`${navLinkClassName} ${inactiveNavLinkClassName} flex items-center`} aria-label="Logout"><LogOut size={16} className="inline mr-1" />Logout</button></motion.div>
    );
};

const Header = ({ theme, onThemeToggle }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const themeToggleControls = useAnimationControls();
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleRocketClick = async (e) => {
        e.preventDefault(); // Prevent default NavLink behavior to control animation and navigation

        navigate('/home'); // Programmatically navigate
    };

    const handleThemeToggle = async () => {
        onThemeToggle();
        await themeToggleControls.start("spin");
        themeToggleControls.set("idle"); // Instantly reset rotation for the next click
    };
    const themeToggleVariants = {
        idle: { rotate: 0, transition: { duration: 0 } },
        spin: {
            rotate: 360,
            transition: { duration: 0.7, ease: "easeInOut" }
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md py-5 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto flex items-center">
                    <div className="flex-1">
                        <NavLink to="/home" onClick={handleRocketClick} className="flex items-center space-x-3 cursor-pointer" aria-label="Ignite Home">
                            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                <RocketIcon size={28} className="text-indigo-600 dark:text-indigo-400" />
                            </motion.div>
                            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                Ignite
                            </h1>
                        </NavLink>
                    </div>
                    <nav className="hidden md:flex space-x-8 items-center justify-center" aria-label="Desktop navigation">
                        <MotionNavLink to="/home">Home</MotionNavLink>
                        <MotionNavLink to="/about">About</MotionNavLink>
                        <MotionNavLink to="/projects">Projects</MotionNavLink>
                        {user?.role === 'Freelancer' && (
                            <>
                                <MotionNavLink to="/my-applications">Applications</MotionNavLink>
                                <MotionNavLink to="/my-tasks">Tasks</MotionNavLink>
                            </>
                        )}
                        {user?.role === 'Client' && (
                            <>
                                <MotionNavLink to="/all-applicants">Applicants</MotionNavLink>
                                <MotionNavLink to="/team">Team</MotionNavLink>
                            </>
                        )}
                        {user?.role === 'Admin' && (
                            <MotionNavLink to="/admin">Admin</MotionNavLink>
                        )}
                    </nav>
                    <div className="flex-1 justify-end hidden md:flex">
                        <div className="flex items-center space-x-4">
                            {isLoggedIn ? (
                                <>
                                    <MotionNavLink to="/profile" end={true}>Profile</MotionNavLink>
                                    <LogoutContainer />
                                </>
                            ) : (
                                <>
                                    <MotionNavLink to="/profile">Profile</MotionNavLink>
                                    <MotionNavLink to="/login">Login</MotionNavLink>
                                    <MotionNavLink to="/signup">Sign Up</MotionNavLink>
                                </>
                            )}
                            <NotificationCenter />
                            <motion.div whileHover={{ y: -3 }}>
                                <IconButton onClick={handleThemeToggle} aria-label="Toggle theme" className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <motion.div animate={themeToggleControls} variants={themeToggleVariants} initial="idle">
                                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                    </motion.div>
                                </IconButton>
                            </motion.div>
                        </div>
                    </div>
                    {/* MOBILE MENU ICONS (Theme Toggle, Notifications, Menu Icon) */}
                    <div className="md:hidden flex items-center">
                        <div className="flex items-center space-x-2">
                            <NotificationCenter />
                            <IconButton onClick={handleThemeToggle} aria-label="Toggle theme" className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><motion.div animate={themeToggleControls} variants={themeToggleVariants} initial="idle">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</motion.div></IconButton>
                            <IconButton onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle mobile menu" aria-expanded={isMenuOpen} className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</IconButton>
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div as="nav" aria-label="Mobile navigation" className="md:hidden mt-4 px-4 flex flex-col space-y-2" onClick={() => setIsMenuOpen(false)} initial="hidden" animate="visible" exit="hidden" variants={mobileMenuVariants}>
                            <motion.div variants={mobileMenuItemVariants}><NavLink to="/home" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Home</NavLink></motion.div>
                            <motion.div variants={mobileMenuItemVariants}><NavLink to="/projects" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Projects</NavLink></motion.div>
                            <motion.div variants={mobileMenuItemVariants}><NavLink to="/about" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>About</NavLink></motion.div>
                            {user?.role === 'Freelancer' && (
                                <>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/my-applications" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>My Applications</NavLink></motion.div>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/my-tasks" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>My Tasks</NavLink></motion.div>
                                </>
                            )}
                            {user?.role === 'Client' && (
                                <>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/all-applicants" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Applicants</NavLink></motion.div>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/team" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Team</NavLink></motion.div>
                                </>
                            )}
                            {user?.role === 'Admin' && (
                                <motion.div variants={mobileMenuItemVariants}><NavLink to="/admin" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Admin</NavLink></motion.div>
                            )}
                            {isLoggedIn ? (
                                <>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/profile" end className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>My Profile</NavLink></motion.div>
                                    <LogoutContainer isMobile={true} />
                                </>
                            ) : (
                                <>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/profile" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Profile</NavLink></motion.div>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/login" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Login</NavLink></motion.div>
                                    <motion.div variants={mobileMenuItemVariants}><NavLink to="/signup" className={({ isActive }) => `${getNavLinkClass({ isActive })} py-2 block`}>Sign Up</NavLink></motion.div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
};

export default Header;