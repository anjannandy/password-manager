import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import PasswordManager from './components/PasswordManager';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('App component mounted, checking user...');
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            console.log('Requesting /api/auth/me...');
            const response = await axios.get('/api/auth/me');
            console.log('User status check response:', response.status, response.data);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('User status check failed:', error.response?.status || error.message, error.response?.data);
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Router>
            <div className="container">
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={checkUser} />} />
                    <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                    <Route path="/" element={user ? <PasswordManager user={user} onLogout={checkUser} /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
