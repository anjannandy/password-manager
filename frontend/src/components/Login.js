import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Attempting login for:', username);
            const response = await axios.post('/api/auth/login', { username, password });
            console.log('Login request finished. Status:', response.status);
            
            console.log('Proceeding to onLogin (fetch user status)...');
            await onLogin();
            console.log('User status fetch completed successfully.');
        } catch (err) {
            console.error('Login Error:', err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            setError(`Login Error: ${errorMsg}`);
        }
    };

    const styles = {
        container: { 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        },
        card: { 
            width: '100%',
            maxWidth: '400px', 
            padding: '40px', 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
        },
        title: { textAlign: 'center', marginBottom: '30px', color: '#4a5568', fontSize: '24px', fontWeight: '700' },
        error: { background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #feb2b2' },
        label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' },
        input: { width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
        button: { width: '100%', padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
        linkContainer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096' },
        link: { color: '#667eea', textDecoration: 'none', fontWeight: '600' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={styles.input} 
                            placeholder="Enter your username"
                            required 
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            style={styles.input} 
                            placeholder="Enter your password"
                            required 
                        />
                    </div>
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                <div style={styles.linkContainer}>
                    Don't have an account? <Link to="/register" style={styles.link}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
