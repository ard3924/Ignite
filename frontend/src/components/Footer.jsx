import React from 'react';
import { Github, Linkedin, RocketIcon, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Logo and Tagline */}
          <div className="md:col-span-1">
            <div className="flex justify-center md:justify-start items-center space-x-2 mb-2">
              <RocketIcon size={28} className="text-gray-800 dark:text-white" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">Ignite</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fuel your passion. Build something great.</p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/home" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">Home</Link></li>
              <li><Link to="/projects" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">Projects</Link></li>
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">About</Link></li>
              <li><Link to="/profile" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">Profile</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about#get-in-touch" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">Contact Us</Link></li>
              <li className="flex justify-center md:justify-start space-x-4 mt-4">
                <a href="https://github.com/ard3924" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">
                  <Github size={24} />
                </a>
                <a href="https://linkedin.com/in/-aravind-r" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">
                  <Linkedin size={24} />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">Privacy Policy</li>
              <li className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-300">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; 2025 Ignite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
