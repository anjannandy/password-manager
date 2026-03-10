import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    KeyIcon, 
    HistoryIcon, 
    SettingsIcon, 
    ShieldCheckIcon, 
    LogOutIcon,
    LockIcon,
    GripVerticalIcon
} from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import PasswordManager from './components/PasswordManager';

const MIN_SIDEBAR_WIDTH = 60;
const MAX_SIDEBAR_WIDTH = 400;
const DEFAULT_SIDEBAR_WIDTH = 260;

const Sidebar = ({ user, onLogout, sidebarWidth, onResizeStart }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const isCollapsed = sidebarWidth <= 80;

    const navItems = [
        { path: '/', label: 'Passwords', icon: <KeyIcon size={20} /> },
        { path: '/history', label: 'Login History', icon: <HistoryIcon size={20} /> },
        { path: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
        { path: '/privacy', label: 'Privacy', icon: <ShieldCheckIcon size={20} /> },
    ];

    return (
        <div 
            className="flex h-screen"
            style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
            <div className="flex flex-col h-full flex-1 bg-orange-500 text-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-orange-600 flex items-center gap-3 h-20 shrink-0">
                    <div className="bg-white p-2 rounded-lg shadow-inner shrink-0">
                        <LockIcon size={24} className="text-orange-600" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap">
                            <span className="text-xl font-bold tracking-tight text-white">SecurePass</span>
                            <span className="text-[10px] uppercase tracking-widest text-orange-100 font-semibold">Vault Manager v1.5</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-6 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                                isActive(item.path) 
                                ? 'bg-white text-orange-600 shadow-lg' 
                                : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <div className={`shrink-0 ${isActive(item.path) ? 'text-orange-600' : 'text-orange-200 group-hover:text-white'}`}>
                                {item.icon}
                            </div>
                            {!isCollapsed && <span className="font-medium whitespace-nowrap truncate">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-orange-600 bg-orange-600/50 shrink-0">
                    <div className={`flex items-center gap-3 p-2 mb-3 rounded-xl ${!isCollapsed ? 'bg-orange-600' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center font-bold shadow-lg shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-bold truncate text-white">{user.username}</p>
                                {user.isAdmin ? (
                                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">Admin</span>
                                ) : (
                                    <span className="text-[10px] text-orange-200">User</span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 p-3 text-orange-100 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
                        title="Logout"
                    >
                        <LogOutIcon size={20} className="group-hover:scale-110 transition-transform shrink-0" />
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Resize handle */}
            <div
                onMouseDown={onResizeStart}
                className="w-1.5 cursor-col-resize flex items-center justify-center bg-orange-600 hover:bg-orange-400 active:bg-orange-300 transition-colors group shrink-0"
                title="Drag to resize"
            >
                <GripVerticalIcon size={12} className="text-orange-300 group-hover:text-white" />
            </div>
        </div>
    );
};

const LoginHistoryView = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/auth/login-history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Login History</h1>
            <div className="bg-navy-800 rounded-xl shadow-sm border border-navy-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-navy-700 text-gray-300 text-sm uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">IP Address</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">Loading history...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">No login attempts recorded.</td></tr>
                        ) : history.map((h) => (
                            <tr key={h.id} className="hover:bg-navy-700 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm text-gray-200">{h.ipAddress}</td>
                                <td className="px-6 py-4 text-gray-300">{h.location}</td>
                                <td className="px-6 py-4 text-gray-300">
                                    {new Date(h.loginTime).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SimpleView = ({ title, content }) => (
    <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <div className="bg-navy-800 p-6 rounded-xl shadow-sm border border-navy-700">
            <p className="text-gray-300">{content}</p>
        </div>
    </div>
);

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const isResizing = useRef(false);

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

    const onLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleMouseMove = useCallback((e) => {
        if (!isResizing.current) return;
        const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, e.clientX));
        setSidebarWidth(newWidth);
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const onResizeStart = useCallback((e) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    if (loading) return <div className="flex items-center justify-center h-screen bg-navy-900 text-gray-300">Loading...</div>;

    return (
        <Router>
            <div className="flex h-screen w-screen bg-navy-900 text-white font-sans overflow-hidden">
                {user && (
                    <Sidebar 
                        user={user} 
                        onLogout={onLogout} 
                        sidebarWidth={sidebarWidth}
                        onResizeStart={onResizeStart}
                    />
                )}
                <div className="flex-1 min-w-0 h-screen overflow-auto bg-navy-900">
                    <Routes>
                        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={checkUser} />} />
                        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                        
                        <Route path="/" element={user ? <PasswordManager user={user} onLogout={checkUser} /> : <Navigate to="/login" />} />
                        <Route path="/history" element={user ? <LoginHistoryView /> : <Navigate to="/login" />} />
                        <Route path="/settings" element={user ? <SimpleView title="Settings" content="Configure your account preferences here." /> : <Navigate to="/login" />} />
                        <Route path="/privacy" element={user ? <SimpleView title="Privacy" content="Review and manage your privacy settings." /> : <Navigate to="/login" />} />
                        
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
