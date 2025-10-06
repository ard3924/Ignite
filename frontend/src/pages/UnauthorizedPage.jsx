import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import Card from '../components/Card';

const UnauthorizedPage = () => {
    return (
        <div className="container mx-auto py-12 px-4 text-center">
            <Card className="max-w-md mx-auto">
                <ShieldOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You do not have the necessary permissions to view this page.
                </p>
                <Link to="/profile" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Go to Your Profile
                </Link>
            </Card>
        </div>
    );
};

export default UnauthorizedPage;