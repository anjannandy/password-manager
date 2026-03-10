import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkDisabled = async () => {
            try {
                const res = await axios.get('/api/auth/registration-disabled');
                setDisabled(res.data);
            } catch (err) {}
        };
        checkDisabled();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        try {
            await axios.post('/api/auth/register', { username, password });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Registration failed');
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
        input: { width: '100%', padding: '14px', border: '1px solid #364574', borderRadius: '12px', marginBottom: '15px', fontSize: '16px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#0f1b3d', color: '#e2e8f0' },
        button: { width: '100%', padding: '14px', background: '#f97316', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)' },
        disabledMsg: { textAlign: 'center', padding: '20px', color: '#fca5a5', fontWeight: 'bold' },
        linkContainer: { marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' },
        link: { color: '#f97316', textDecoration: 'none', fontWeight: '700', marginLeft: '5px' }
    };

    if (disabled) return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Register</h2>
                <div style={styles.disabledMsg}>Registration is currently disabled by admin.</div>
                <div style={styles.linkContainer}>
                    <Link to="/login" style={styles.link}>Back to Login</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Vault</h2>
                <p style={styles.subtitle}>Secure your passwords today</p>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={styles.input} 
                            placeholder="Pick a username"
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
                            placeholder="Create master password"
                            required 
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Confirm Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            style={styles.input} 
                            placeholder="Confirm master password"
                            required 
                        />
                    </div>
                    <button type="submit" style={styles.button}>Create Account</button>
                </form>
                <div style={styles.linkContainer}>
                    Already have a vault? <Link to="/login" style={styles.link}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
