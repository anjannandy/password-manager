import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PasswordManager = ({ user, onLogout }) => {
    const [passwords, setPasswords] = useState([]);
    const [newEntry, setNewEntry] = useState({
        siteName: '', url: '', accountId: '', password: '', resetDate: '', phoneNumber: '', emailAddress: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [editEntry, setEditEntry] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkPassword, setBulkPassword] = useState('');
    const [showAdmin, setShowAdmin] = useState(false);
    const [registrationDisabled, setRegistrationDisabled] = useState(false);
    const [changePass, setChangePass] = useState({ oldPassword: '', newPassword: '' });

    const [visiblePasswords, setVisiblePasswords] = useState({});

    useEffect(() => {
        fetchPasswords();
        if (user.isAdmin) {
            checkRegistrationStatus();
        }
    }, [user.isAdmin]);

    const togglePasswordVisibility = (id) => {
        if (visiblePasswords[id]) {
            // If already visible, hide it
            setVisiblePasswords(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } else {
            // Show it and set a timer to hide it after 30 seconds
            setVisiblePasswords(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setVisiblePasswords(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
            }, 30000);
        }
    };

    const fetchPasswords = async () => {
        try {
            const res = await axios.get('/api/passwords');
            setPasswords(res.data);
        } catch (err) { console.error(err); }
    };

    const checkRegistrationStatus = async () => {
        try {
            const res = await axios.get('/api/auth/registration-disabled');
            setRegistrationDisabled(res.data);
        } catch (err) {}
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/passwords', newEntry);
            setNewEntry({ siteName: '', url: '', accountId: '', password: '', resetDate: '', phoneNumber: '', emailAddress: '' });
            fetchPasswords();
        } catch (err) { alert('Error adding password'); }
    };

    const handleUpdateInline = async (id) => {
        try {
            await axios.put(`/api/passwords/${id}`, editEntry);
            setEditingId(null);
            fetchPasswords();
        } catch (err) { alert('Error updating entry'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`/api/passwords/${id}`);
            fetchPasswords();
        } catch (err) { alert('Error deleting'); }
    };

    const handleBulkUpdate = async () => {
        if (selectedIds.length === 0 || !bulkPassword) return;
        try {
            await axios.post('/api/passwords/bulk-update', { ids: selectedIds, newPassword: bulkPassword });
            setBulkPassword('');
            setSelectedIds([]);
            fetchPasswords();
            alert('Bulk update successful');
        } catch (err) { alert('Bulk update failed'); }
    };

    const handleToggleRegistration = async () => {
        try {
            await axios.post(`/api/auth/registration-toggle?enabled=${registrationDisabled}`);
            setRegistrationDisabled(!registrationDisabled);
            alert('Registration status updated');
        } catch (err) { alert('Failed to update registration status'); }
    };

    const handleChangeMasterPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/passwords/change-master-password', changePass);
            setChangePass({ oldPassword: '', newPassword: '' });
            alert('Master password changed and all entries re-encrypted');
        } catch (err) { alert('Failed to change master password: ' + (err.response?.data || '')); }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Simple visual feedback could be added here
    };

    const startEditing = (p) => {
        setEditingId(p.id);
        setEditEntry(p);
    };

    // Inline Styles
    const styles = {
        container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#333' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #6366f1', paddingBottom: '10px' },
        title: { margin: 0, color: '#4f46e5', fontSize: '28px' },
        welcome: { fontSize: '14px', color: '#666' },
        logoutBtn: { marginLeft: '15px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        section: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '30px' },
        sectionTitle: { marginTop: 0, marginBottom: '20px', color: '#1f2937', fontSize: '20px', borderLeft: '4px solid #6366f1', paddingLeft: '12px' },
        form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
        input: { padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
        button: { padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' },
        table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginTop: '10px' },
        th: { background: '#f8fafc', padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textTransform: 'uppercase' },
        td: { padding: '12px 15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
        copyBtn: { background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', color: '#6366f1', marginLeft: '5px' },
        actionBtn: { padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', marginRight: '5px' },
        saveBtn: { background: '#10b981', color: 'white' },
        cancelBtn: { background: '#94a3b8', color: 'white' },
        deleteBtn: { background: '#fee2e2', color: '#ef4444' },
        editBtn: { background: '#e0e7ff', color: '#4338ca' },
        badge: { padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: '#e0e7ff', color: '#4338ca' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>🔒 SecurePass Manager</h1>
                <div style={styles.welcome}>
                    <span>Logged in as <strong>{user.username}</strong></span>
                    {user.isAdmin && <span style={{...styles.badge, marginLeft: '10px'}}>ADMIN</span>}
                    <button style={styles.logoutBtn} onClick={async () => { await axios.post('/api/auth/logout'); onLogout(); }}>Logout</button>
                </div>
            </header>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Add New Entry</h3>
                <form onSubmit={handleAdd} style={styles.form}>
                    <input style={styles.input} placeholder="Site Name" value={newEntry.siteName} onChange={e => setNewEntry({...newEntry, siteName: e.target.value})} required />
                    <input style={styles.input} placeholder="URL (https://...)" value={newEntry.url} onChange={e => setNewEntry({...newEntry, url: e.target.value})} required />
                    <input style={styles.input} placeholder="Account/User ID" value={newEntry.accountId} onChange={e => setNewEntry({...newEntry, accountId: e.target.value})} required />
                    <input style={styles.input} placeholder="Password" type="password" value={newEntry.password} onChange={e => setNewEntry({...newEntry, password: e.target.value})} required />
                    <input style={styles.input} placeholder="Reset Date" type="date" value={newEntry.resetDate} onChange={e => setNewEntry({...newEntry, resetDate: e.target.value})} />
                    <input style={styles.input} placeholder="Phone" value={newEntry.phoneNumber} onChange={e => setNewEntry({...newEntry, phoneNumber: e.target.value})} />
                    <input style={styles.input} placeholder="Email" value={newEntry.emailAddress} onChange={e => setNewEntry({...newEntry, emailAddress: e.target.value})} />
                    <button style={styles.button} type="submit">Add Secret</button>
                </form>
            </section>

            <section style={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{...styles.sectionTitle, marginBottom: 0}}>Vault Entries</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input style={{...styles.input, padding: '8px'}} placeholder="New bulk password" value={bulkPassword} onChange={e => setBulkPassword(e.target.value)} />
                        <button style={{...styles.button, padding: '8px 16px', background: selectedIds.length > 0 ? '#10b981' : '#ccc'}} 
                                onClick={handleBulkUpdate} disabled={selectedIds.length === 0}>
                            Update Selected ({selectedIds.length})
                        </button>
                    </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Select</th>
                                <th style={styles.th}>Site</th>
                                <th style={styles.th}>URL</th>
                                <th style={styles.th}>Account ID</th>
                                <th style={styles.th}>Password</th>
                                <th style={styles.th}>Reset Date</th>
                                <th style={styles.th}>Contact</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passwords.map(p => (
                                <tr key={p.id}>
                                    <td style={styles.td}><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? 
                                            <input style={styles.input} value={editEntry.siteName} onChange={e => setEditEntry({...editEntry, siteName: e.target.value})} /> : 
                                            <strong>{p.siteName}</strong>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? 
                                            <input style={styles.input} value={editEntry.url} onChange={e => setEditEntry({...editEntry, url: e.target.value})} /> : 
                                            <a href={p.url.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" style={{color: '#6366f1'}}>{p.url}</a>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? 
                                            <input style={styles.input} value={editEntry.accountId} onChange={e => setEditEntry({...editEntry, accountId: e.target.value})} /> : 
                                            <span>
                                                {p.accountId} 
                                                <button style={styles.copyBtn} onClick={() => copyToClipboard(p.accountId)}>📋</button>
                                            </span>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? 
                                            <input style={styles.input} type="text" value={editEntry.password} onChange={e => setEditEntry({...editEntry, password: e.target.value})} /> : 
                                            <span>
                                                {visiblePasswords[p.id] ? p.password : '••••••••'} 
                                                <button style={styles.copyBtn} title={visiblePasswords[p.id] ? "Hide Password" : "Show Password"} onClick={() => togglePasswordVisibility(p.id)}>
                                                    {visiblePasswords[p.id] ? '🔒' : '👁️'}
                                                </button>
                                                <button style={styles.copyBtn} title="Copy Password" onClick={() => copyToClipboard(p.password)}>📋</button>
                                            </span>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? 
                                            <input style={styles.input} type="date" value={editEntry.resetDate || ''} onChange={e => setEditEntry({...editEntry, resetDate: e.target.value})} /> : 
                                            p.resetDate
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? 
                                            <>
                                                <input style={{...styles.input, marginBottom: '5px'}} placeholder="Phone" value={editEntry.phoneNumber || ''} onChange={e => setEditEntry({...editEntry, phoneNumber: e.target.value})} />
                                                <input style={styles.input} placeholder="Email" value={editEntry.emailAddress || ''} onChange={e => setEditEntry({...editEntry, emailAddress: e.target.value})} />
                                            </> : 
                                            <div style={{fontSize: '12px'}}>
                                                {p.emailAddress && <div>📧 {p.emailAddress}</div>}
                                                {p.phoneNumber && <div>📱 {p.phoneNumber}</div>}
                                            </div>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {editingId === p.id ? (
                                            <div style={{display: 'flex'}}>
                                                <button style={{...styles.actionBtn, ...styles.saveBtn}} onClick={() => handleUpdateInline(p.id)}>Save</button>
                                                <button style={{...styles.actionBtn, ...styles.cancelBtn}} onClick={() => setEditingId(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div style={{display: 'flex'}}>
                                                <button style={{...styles.actionBtn, ...styles.editBtn}} onClick={() => startEditing(p)}>Edit</button>
                                                <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={() => handleDelete(p.id)}>Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section style={styles.section}>
                <button style={{...styles.button, background: '#4b5563'}} onClick={() => setShowAdmin(!showAdmin)}>
                    {showAdmin ? 'Hide Advanced Settings' : '⚙️ Account & Admin Settings'}
                </button>
                {showAdmin && (
                    <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div>
                                <h4 style={{marginTop: 0, color: '#1f2937'}}>Change Master Password</h4>
                                <p style={{fontSize: '12px', color: '#666', marginBottom: '15px'}}>Warning: This will re-encrypt all vault entries with your new password.</p>
                                <form onSubmit={handleChangeMasterPassword} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    <input style={styles.input} type="password" placeholder="Old Password" value={changePass.oldPassword} onChange={e => setChangePass({...changePass, oldPassword: e.target.value})} required />
                                    <input style={styles.input} type="password" placeholder="New Password" value={changePass.newPassword} onChange={e => setChangePass({...changePass, newPassword: e.target.value})} required />
                                    <button style={{...styles.button, background: '#4f46e5'}} type="submit">Update & Re-encrypt All</button>
                                </form>
                            </div>

                            {user.isAdmin && (
                                <div>
                                    <h4 style={{marginTop: 0, color: '#1f2937'}}>Admin Controls</h4>
                                    <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                            <input type="checkbox" style={{width: '18px', height: '18px', marginRight: '10px'}} 
                                                   checked={!registrationDisabled} onChange={handleToggleRegistration} />
                                            <span style={{fontSize: '14px', fontWeight: '500'}}>Enable Public Registration</span>
                                        </label>
                                        <p style={{fontSize: '12px', color: '#64748b', marginTop: '10px', marginLeft: '28px'}}>
                                            When disabled, new users cannot create accounts.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PasswordManager;
