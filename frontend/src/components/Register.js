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
        input: { width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
        button: { width: '100%', padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
        disabledMsg: { textAlign: 'center', padding: '20px', color: '#e53e3e', fontWeight: 'bold' },
        linkContainer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096' },
        link: { color: '#667eea', textDecoration: 'none', fontWeight: '600' }
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
                <h2 style={styles.title}>Create Account</h2>
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
                            placeholder="Create a password"
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
                            placeholder="Repeat your password"
                            required 
                        />
                    </div>
                    <button type="submit" style={styles.button}>Register</button>
                </form>
                <div style={styles.linkContainer}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
