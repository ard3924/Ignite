import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosInterceptor';
import { useAuth } from '../hooks/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { isLoggedIn } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchNotifications = async () => {
            try {
                const response = await axiosInstance.get('/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    if (!isLoggedIn) return null;

    const NotificationItem = ({ notification, onClick }) => {
        const content = (
            <div
                onClick={onClick}
                className={`w-full p-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${!notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
            >
                <p className="text-gray-800 dark:text-gray-200">{notification.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
        );

        if (notification.link) {
            return <Link to={notification.link}>{content}</Link>;
        }
        return content;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                                    <CheckCheck size={14} /> Mark all as read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <NotificationItem key={notification._id} notification={notification} onClick={() => setIsOpen(false)} />
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;