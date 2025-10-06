import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { LoaderCircle } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!isLoggedIn) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they
        // log in, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isAuthorized = allowedRoles.includes(user.role);

    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;