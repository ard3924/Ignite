import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import axiosInstance from '../axiosInterceptor';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Add a check for token expiration
                const decodedUser = jwtDecode(token);
                if (decodedUser.exp * 1000 < Date.now()) throw new Error("Token expired");
                setUser(decodedUser);
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false); // Set loading to false after checking token
    }, []);

    const signup = async (data) => {
        return await axiosInstance.post('/user/signup', data);
    };

    const login = async (data, redirectTo = '/profile') => {
        const response = await axiosInstance.post('/user/login', data);

        const { token } = response.data;
        if (!token) {
            throw new Error("Login failed: No token received.");
        }

        localStorage.setItem('token', token);
        try {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Failed to decode token on login:", error);
            throw new Error("Invalid token received.");
        }
    };

    const updateUserToken = (token) => {
        if (token) {
            localStorage.setItem('token', token);
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (error) {
                console.error("Failed to decode updated token:", error);
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const value = { user, loading, login, logout, signup, updateUserToken, isLoggedIn: !!user };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);