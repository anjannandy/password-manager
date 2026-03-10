import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';

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
            background: '#0f1b3d',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        },
        card: { 
            width: '100%',
            maxWidth: '400px', 
            padding: '40px', 
            background: '#1f2b56',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #273461'
        },
        title: { textAlign: 'center', marginBottom: '10px', color: '#f8fafc', fontSize: '28px', fontWeight: '800' },
        subtitle: { textAlign: 'center', marginBottom: '30px', color: '#94a3b8', fontSize: '14px' },
        error: { background: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #991b1b' },
        label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#e2e8f0' },
        input: { width: '100%', padding: '14px', border: '1px solid #364574', borderRadius: '12px', marginBottom: '20px', fontSize: '16px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#0f1b3d', color: '#e2e8f0' },
        button: { width: '100%', padding: '14px', background: '#f97316', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)' },
        linkContainer: { marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' },
        link: { color: '#f97316', textDecoration: 'none', fontWeight: '700', marginLeft: '5px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div style={{display: 'inline-flex', padding: '12px', background: '#f97316', borderRadius: '16px', color: '#fff', marginBottom: '15px'}}>
                        <LockIcon size={32} />
                    </div>
                </div>
                <h2 style={styles.title}>SecurePass</h2>
                <p style={styles.subtitle}>Enter your master credentials</p>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={styles.input} 
                            placeholder="Username"
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
                            placeholder="Master Password"
                            required 
                        />
                    </div>
                    <button type="submit" style={styles.button}>Unlock Vault</button>
                </form>
                <div style={styles.linkContainer}>
                    Don't have an account? <Link to="/register" style={styles.link}>Create Vault</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
