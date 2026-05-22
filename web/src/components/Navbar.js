import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { path: '/chat', label: 'المحادثة', icon: '💬' },
  { path: '/tasks', label: 'المواعيد', icon: '📅' },
  { path: '/emails', label: 'البريد', icon: '✉️' },
  { path: '/telegram', label: 'تليجرام', icon: '📱' },
  { path: '/whatsapp', label: 'واتساب', icon: '💬' },
  { path: '/settings', label: 'الإعدادات', icon: '⚙️' },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('darb_token');
    localStorage.removeItem('darb_user');
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      height: '64px',
      borderBottom: '1px solid var(--border-accent)',
      boxShadow: '0 2px 20px var(--shadow)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/dashboard" style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '32px',
        textDecoration: 'none',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '16px', color: '#fff',
          boxShadow: '0 4px 12px var(--accent-glow)',
        }}>د</div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.2 }}>درب</div>
          <div style={{ fontSize: '10px', color: 'var(--accent)', lineHeight: 1 }}>سكرتير خاص فيك</div>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={{
            padding: '8px 14px', borderRadius: '10px', textDecoration: 'none',
            color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: location.pathname === item.path ? 'var(--accent-glow)' : 'transparent',
            fontSize: '13px', fontWeight: location.pathname === item.path ? '600' : '400',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} style={{
        padding: '8px 18px', borderRadius: '10px', border: '1px solid var(--border-accent)',
        background: 'transparent', color: 'var(--accent)', cursor: 'pointer',
        fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.target.style.background = 'var(--accent-glow)'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
      >
        🚪 خروج
      </button>
    </nav>
  );
}

export default Navbar;
