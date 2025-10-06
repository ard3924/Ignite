import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const MainLayout = () => {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));

    useEffect(() => { document.documentElement.className = theme === 'dark' ? 'dark' : ''; }, [theme]);

    return (<div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300">
        <Header theme={theme} onThemeToggle={toggleTheme} />
        <main className="container mx-auto px-4"><Outlet /></main>
        <Footer />
    </div>);
};

export default MainLayout;