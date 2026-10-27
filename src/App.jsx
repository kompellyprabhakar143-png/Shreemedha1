import React, { useState, useEffect } from 'react';

export default function StudyHallPayments() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('shreemedha_studyhall_students');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Jyothsna', mobile: '9703978281', amount: 1000, joinDate: '2026-08-10', dueDate: '2026-10-25', status: 'Pending' },
      { id: 2, name: 'Sampath', mobile: '9966345438', amount: 1000, joinDate: '2026-08-14', dueDate: '2026-10-13', status: 'Pending' },
      { id: 3, name: 'Pavan', mobile: '9063706527', amount: 1000, joinDate: '2026-08-12', dueDate: '2026-10-11', status: 'Pending' },
      { id: 4, name: 'Kompelli Prasad', mobile: '9908440035', amount: 1500, joinDate: '2026-10-01', dueDate: '2026-11-05', status: 'Pending' },
      { id: 5, name: 'Lavanya', mobile: '8179341203', amount: 1500, joinDate: '2026-09-25', dueDate: '2026-11-01', status: 'Paid' }
    ];
  });

  const [form, setForm] = useState({ name: '', mobile: '', amount: '1000', joinDate: '', dueDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    localStorage.setItem('shreemedha_studyhall_students', JSON.stringify(students));
  }, [students]);

  // Statistics Calculations
  const totalStudents = students.length;
  const totalFees = students.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const feesCollected = students
    .filter(s => s.status === 'Paid')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const pendingFees = students
    .filter(s => s.status === 'Pending')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.amount) {
      alert('దయచేసి విద్యార్థి పేరు, మొబైల్ నంబర్ మరియు ఫీజు నమోదు చేయండి.');
      return;
    }

    const newStudent = {
      id: Date.now(),
      name: form.name,
      mobile: form.mobile,
      amount: Number(form.amount),
      joinDate: form.joinDate || new Date().toISOString().split('T')[0],
      dueDate: form.dueDate || new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    setStudents([newStudent, ...students]);
    setForm({ name: '', mobile: '', amount: '1000', joinDate: '', dueDate: '' });
  };

  const toggleStatus = (id) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, status: s.status === 'Paid' ? 'Pending' : 'Paid' } : s
    ));
  };

  const deleteStudent = (id) => {
    if (window.confirm('ఈ రికార్డును తొలగించాలనుకుంటున్నారా?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const sendWhatsAppAlert = (student) => {
    const cleanMobile = student.mobile.replace(/[^0-9]/g, '');
    const phone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const message = `Dear student and aspirant ${student.name}, this is a gentle reminder from Shree Medha StudyHall. Your join date was ${student.joinDate} and your studyhall fee of ₹${student.amount.toLocaleString('en-IN')} is due on ${student.dueDate}. Please clear your dues at the earliest. Thank you!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const sendAllPendingAlerts = () => {
    const pendingStudents = students.filter(s => s.status === 'Pending');
    if (pendingStudents.length === 0) {
      alert('No pending students found to send alerts!');
      return;
    }

    pendingStudents.forEach((student, index) => {
      const cleanMobile = student.mobile.replace(/[^0-9]/g, '');
      const phone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
      const message = `Dear student and aspirant ${student.name}, this is a gentle reminder from Shree Medha StudyHall. Your join date was ${student.joinDate} and your studyhall fee of ₹${student.amount.toLocaleString('en-IN')} is due on ${student.dueDate}. Please clear your dues at the earliest. Thank you!`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      setTimeout(() => {
        window.open(url, '_blank');
      }, index * 800);
    });
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.mobile.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' ? true : s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      {/* Banner / Header */}
      <div style={styles.banner}>
        <div style={styles.overlay}>
          <span style={styles.badgeTop}>✨ QUIET ENVIRONMENT • HIGH PRODUCTIVITY</span>
          <h1 style={styles.title}>Shree Medha <span style={styles.highlight}>StudyHall</span></h1>
          <p style={styles.subtitle}>Monthly Fee Payments & Student Reminders Dashboard</p>
        </div>
      </div>

      {/* Stat Cards Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👤</div>
          <div>
            <div style={styles.statLabel}>Total Students</div>
            <div style={styles.statValue}>{totalStudents}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>💰</div>
          <div>
            <div style={styles.statLabel}>Total Fees</div>
            <div style={styles.statValue}>₹{totalFees.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#dcfce7', color: '#16a34a' }}>✅</div>
          <div>
            <div style={styles.statLabel}>Fees Collected</div>
            <div style={{ ...styles.statValue, color: '#16a34a' }}>₹{feesCollected.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#fee2e2', color: '#dc2626' }}>⏳</div>
          <div>
            <div style={styles.statLabel}>Pending Fees</div>
            <div style={{ ...styles.statValue, color: '#dc2626' }}>₹{pendingFees.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Add New Student Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>➕ Add New Student</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Student Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Mobile Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Amount (₹)</label>
            <input
              type="number"
              placeholder="₹ 1500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Join Date</label>
            <input
              type="date"
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.addButton}>Add Student</button>
        </form>
      </div>

      {/* Payment Records Card */}
      <div style={styles.card}>
        <div style={styles.cardHeaderRow}>
          <h2 style={styles.cardTitle}>📋 Payment Records ({filteredStudents.length})</h2>
          <button onClick={sendAllPendingAlerts} style={styles.bulkWhatsappBtn}>
            💬 Send Bulk WhatsApp Alerts (Pending)
          </button>
        </div>

        {/* Search & Filter Options */}
        <div style={styles.filterRow}>
          <input 
            type="text" 
            placeholder="Search student name or mobile..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending Only</option>
            <option value="Paid">Paid Only</option>
          </select>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Join Date</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.empty}>No records found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#111827' }}>{student.name}</td>
                    <td style={styles.td}>{student.mobile}</td>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#047857' }}>₹{Number(student.amount).toLocaleString('en-IN')}</td>
                    <td style={styles.td}>{student.joinDate}</td>
                    <td style={styles.td}>{student.dueDate}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge, 
                        backgroundColor: student.status === 'Paid' ? '#d1e7dd' : '#f8d7da',
                        color: student.status === 'Paid' ? '#0f5132' : '#842029'
                      }}>
                        {student.status === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button 
                          onClick={() => toggleStatus(student.id)} 
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: student.status === 'Paid' ? '#6b7280' : '#2563eb'
                          }}
                        >
                          {student.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                        <button 
                          onClick={() => sendWhatsAppAlert(student)} 
                          style={styles.whatsappBtn}
                        >
                          WhatsApp
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)} 
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '20px auto',
    padding: '20px',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#333',
    backgroundColor: '#f3f4f6',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
  },
  banner: {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '12px',
    padding: '36px 20px',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
  },
  overlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badgeTop: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '10px',
    backdropFilter: 'blur(5px)',
    letterSpacing: '0.5px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  highlight: {
    color: '#38bdf8',
    textShadow: '0 2px 8px rgba(56, 189, 248, 0.4)'
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: '400',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
  },
  statIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '14px',
    alignItems: 'end',
    marginTop: '12px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    display: 'block',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc'
  },
  addButton: {
    padding: '11px 16px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
  },
  bulkWhatsappBtn: {
    padding: '10px 16px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px'
  },
  filterSelect: {
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    backgroundColor: '#fff'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  trHead: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0'
  },
  th: {
    padding: '12px 10px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569'
  },
  tr: {
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '12px 10px',
    fontSize: '13px',
    color: '#475569'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block'
  },
  actionGroup: {
    display: 'flex',
    gap: '6px'
  },
  actionBtn: {
    border: 'none',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  whatsappBtn: {
    border: 'none',
    backgroundColor: '#22c55e',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteBtn: {
    border: 'none',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  empty: {
    textAlign: 'center',
    padding: '24px',
    color: '#94a3b8'
  }
};