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
    
    // Pagination and Filter State
    const [filters, setFilters] = useState({
        siteName: '', url: '', accountId: '', password: '', resetDate: '', contact: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [customItemsPerPage, setCustomItemsPerPage] = useState('');

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

    const handleSelectAll = () => {
        const allFilteredIds = filteredPasswords.map(p => p.id);
        setSelectedIds(allFilteredIds);
    };

    const handleUnselectAll = () => {
        setSelectedIds([]);
    };

    // Filter Logic
    const filteredPasswords = passwords.filter(p => {
        return (
            p.siteName.toLowerCase().includes(filters.siteName.toLowerCase()) &&
            p.url.toLowerCase().includes(filters.url.toLowerCase()) &&
            p.accountId.toLowerCase().includes(filters.accountId.toLowerCase()) &&
            p.password.toLowerCase().includes(filters.password.toLowerCase()) &&
            (p.resetDate || '').toLowerCase().includes(filters.resetDate.toLowerCase()) &&
            (
                (p.emailAddress || '').toLowerCase().includes(filters.contact.toLowerCase()) ||
                (p.phoneNumber || '').toLowerCase().includes(filters.contact.toLowerCase())
            )
        );
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPasswords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPasswords.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleFilterChange = (e, field) => {
        setFilters({ ...filters, [field]: e.target.value });
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleItemsPerPageChange = (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            // Handled by custom input
        } else {
            setItemsPerPage(parseInt(val));
            setCustomItemsPerPage('');
            setCurrentPage(1);
        }
    };

    const handleCustomItemsPerPageChange = (e) => {
        const val = e.target.value;
        setCustomItemsPerPage(val);
        const num = parseInt(val);
        if (!isNaN(num) && num > 0) {
            setItemsPerPage(num);
            setCurrentPage(1);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Simple visual feedback could be added here
    };

    const startEditing = (p) => {
        setEditingId(p.id);
        setEditEntry(p);
    };

    // Inline Styles — Navy theme
    const styles = {
        container: { padding: '40px', width: '100%', maxWidth: '100%', margin: '0', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#e2e8f0', boxSizing: 'border-box', overflowX: 'hidden' },
        section: { background: '#1f2b56', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)', padding: '24px', marginBottom: '30px', border: '1px solid #273461', width: '100%', boxSizing: 'border-box' },
        sectionTitle: { marginTop: 0, marginBottom: '20px', color: '#f8fafc', fontSize: '20px', borderLeft: '4px solid #f97316', paddingLeft: '12px', fontWeight: 'bold' },
        form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
        input: { padding: '12px', border: '1px solid #364574', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', background: '#0f1b3d', color: '#e2e8f0' },
        button: { padding: '12px 24px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
        table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginTop: '10px' },
        th: { background: '#273461', padding: '12px 15px', textAlign: 'left', fontWeight: '700', color: '#f8fafc', borderBottom: '2px solid #f97316', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
        td: { padding: '12px 15px', borderBottom: '1px solid #273461', fontSize: '14px', color: '#cbd5e1' },
        copyBtn: { background: '#273461', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '14px', color: '#e2e8f0', marginLeft: '5px', transition: 'all 0.2s' },
        actionBtn: { padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginRight: '5px', transition: 'all 0.2s' },
        saveBtn: { background: '#f97316', color: 'white' },
        cancelBtn: { background: '#364574', color: '#94a3b8' },
        deleteBtn: { background: '#7f1d1d', color: '#fca5a5' },
        editBtn: { background: '#273461', color: '#e2e8f0', border: '1px solid #364574' },
        badge: { padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: '#f97316', color: '#fff' },
        filterInput: { width: '100%', padding: '8px 10px', marginTop: '8px', border: '1px solid #364574', borderRadius: '6px', fontSize: '11px', fontWeight: 'normal', boxSizing: 'border-box', background: '#0f1b3d', color: '#e2e8f0' },
        pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', gap: '5px' },
        pageBtn: { padding: '8px 14px', border: '1px solid #364574', background: '#1f2b56', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s', color: '#cbd5e1' },
        activePageBtn: { background: '#f97316', color: 'white', borderColor: '#f97316' }
    };

    return (
        <div style={styles.container}>
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
                        <button style={{...styles.actionBtn, ...styles.editBtn, margin: 0}} onClick={handleSelectAll}>Select All</button>
                        <button style={{...styles.actionBtn, ...styles.cancelBtn, margin: 0}} onClick={handleUnselectAll}>Unselect All</button>
                        <input style={{...styles.input, padding: '8px'}} placeholder="New bulk password" value={bulkPassword} onChange={e => setBulkPassword(e.target.value)} />
                        <button style={{...styles.button, padding: '8px 16px', background: selectedIds.length > 0 ? '#10b981' : '#364574'}}
                                onClick={handleBulkUpdate} disabled={selectedIds.length === 0}>
                            Update Selected ({selectedIds.length})
                        </button>
                    </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <span>Select</span>
                                        <input type="checkbox" style={{marginTop: '10px'}} 
                                               checked={currentItems.length > 0 && currentItems.every(p => selectedIds.includes(p.id))}
                                               onChange={(e) => {
                                                   if (e.target.checked) {
                                                       const newSelected = [...new Set([...selectedIds, ...currentItems.map(p => p.id)])];
                                                       setSelectedIds(newSelected);
                                                   } else {
                                                       const currentPageIds = currentItems.map(p => p.id);
                                                       setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
                                                   }
                                               }} />
                                    </div>
                                </th>
                                <th style={styles.th}>
                                    Site
                                    <input style={styles.filterInput} placeholder="Filter Site..." value={filters.siteName} onChange={e => handleFilterChange(e, 'siteName')} />
                                </th>
                                <th style={styles.th}>
                                    URL
                                    <input style={styles.filterInput} placeholder="Filter URL..." value={filters.url} onChange={e => handleFilterChange(e, 'url')} />
                                </th>
                                <th style={styles.th}>
                                    Account ID
                                    <input style={styles.filterInput} placeholder="Filter Account..." value={filters.accountId} onChange={e => handleFilterChange(e, 'accountId')} />
                                </th>
                                <th style={styles.th}>
                                    Password
                                    <input style={styles.filterInput} placeholder="Filter Pass..." value={filters.password} onChange={e => handleFilterChange(e, 'password')} />
                                </th>
                                <th style={styles.th}>
                                    Reset Date
                                    <input style={styles.filterInput} placeholder="Filter Date..." value={filters.resetDate} onChange={e => handleFilterChange(e, 'resetDate')} />
                                </th>
                                <th style={styles.th}>
                                    Contact
                                    <input style={styles.filterInput} placeholder="Filter Contact..." value={filters.contact} onChange={e => handleFilterChange(e, 'contact')} />
                                </th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? currentItems.map(p => (
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
                                            <a href={p.url.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" style={{color: '#f97316', textDecoration: 'underline'}}>{p.url}</a>
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
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                                        No entries found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredPasswords.length > 0 && (
                    <div style={{...styles.pagination, flexWrap: 'wrap'}}>
                        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Show</span>
                            <select
                                style={{...styles.input, padding: '4px 8px', width: 'auto'}} 
                                value={customItemsPerPage !== '' ? 'custom' : itemsPerPage} 
                                onChange={handleItemsPerPageChange}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="custom">Custom</option>
                            </select>
                            { (customItemsPerPage !== '' || (itemsPerPage !== 10 && itemsPerPage !== 25 && itemsPerPage !== 50 && itemsPerPage !== 100)) && (
                                <input 
                                    style={{...styles.input, padding: '4px 8px', width: '60px'}} 
                                    type="number" 
                                    min="1"
                                    placeholder="Qty"
                                    value={customItemsPerPage || itemsPerPage}
                                    onChange={handleCustomItemsPerPageChange}
                                />
                            )}
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>entries per page</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                style={styles.pageBtn} 
                                disabled={currentPage === 1} 
                                onClick={() => paginate(currentPage - 1)}
                            >
                                &laquo; Prev
                            </button>
                            {/* Logic to limit visible page buttons if many pages */}
                            {totalPages <= 7 ? (
                                [...Array(totalPages).keys()].map(number => (
                                    <button 
                                        key={number + 1} 
                                        style={{
                                            ...styles.pageBtn, 
                                            ...(currentPage === number + 1 ? styles.activePageBtn : {})
                                        }} 
                                        onClick={() => paginate(number + 1)}
                                    >
                                        {number + 1}
                                    </button>
                                ))
                            ) : (
                                <>
                                    <button style={{...styles.pageBtn, ...(currentPage === 1 ? styles.activePageBtn : {})}} onClick={() => paginate(1)}>1</button>
                                    {currentPage > 3 && <span style={{padding: '0 5px'}}>...</span>}
                                    {[...Array(totalPages).keys()].slice(Math.max(1, currentPage - 2), Math.min(totalPages - 1, currentPage + 1)).map(number => (
                                        <button 
                                            key={number + 1} 
                                            style={{
                                                ...styles.pageBtn, 
                                                ...(currentPage === number + 1 ? styles.activePageBtn : {})
                                            }} 
                                            onClick={() => paginate(number + 1)}
                                        >
                                            {number + 1}
                                        </button>
                                    ))}
                                    {currentPage < totalPages - 2 && <span style={{padding: '0 5px'}}>...</span>}
                                    <button style={{...styles.pageBtn, ...(currentPage === totalPages ? styles.activePageBtn : {})}} onClick={() => paginate(totalPages)}>{totalPages}</button>
                                </>
                            )}
                            <button 
                                style={styles.pageBtn} 
                                disabled={currentPage === totalPages} 
                                onClick={() => paginate(currentPage + 1)}
                            >
                                Next &raquo;
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section style={styles.section}>
                <button style={{...styles.button, background: '#364574'}} onClick={() => setShowAdmin(!showAdmin)}>
                    {showAdmin ? 'Hide Advanced Settings' : '⚙️ Account & Admin Settings'}
                </button>
                {showAdmin && (
                    <div style={{ marginTop: '24px', padding: '20px', background: '#0f1b3d', borderRadius: '8px', border: '1px solid #273461' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div>
                                <h4 style={{marginTop: 0, color: '#f8fafc'}}>Change Master Password</h4>
                                <p style={{fontSize: '12px', color: '#94a3b8', marginBottom: '15px'}}>Warning: This will re-encrypt all vault entries with your new password.</p>
                                    <form onSubmit={handleChangeMasterPassword} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                        <input style={styles.input} type="password" placeholder="Old Password" value={changePass.oldPassword} onChange={e => setChangePass({...changePass, oldPassword: e.target.value})} required />
                                        <input style={styles.input} type="password" placeholder="New Password" value={changePass.newPassword} onChange={e => setChangePass({...changePass, newPassword: e.target.value})} required />
                                        <button style={{...styles.button, background: '#f97316'}} type="submit">Update & Re-encrypt All</button>
                                    </form>
                            </div>

                            {user.isAdmin && (
                                <div>
                                    <h4 style={{marginTop: 0, color: '#f8fafc'}}>Admin Controls</h4>
                                    <div style={{ background: '#1f2b56', padding: '15px', borderRadius: '8px', border: '1px solid #273461' }}>
                                        <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                            <input type="checkbox" style={{width: '18px', height: '18px', marginRight: '10px'}} 
                                                   checked={!registrationDisabled} onChange={handleToggleRegistration} />
                                            <span style={{fontSize: '14px', fontWeight: '500', color: '#e2e8f0'}}>Enable Public Registration</span>
                                        </label>
                                        <p style={{fontSize: '12px', color: '#94a3b8', marginTop: '10px', marginLeft: '28px'}}>
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
