import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { requestNotificationPermission } from '../utils/notifications';

const REMINDER_OPTIONS = [
  { value: '15', label: 'قبل 15 دقيقة' },
  { value: '30', label: 'قبل 30 دقيقة' },
  { value: '60', label: 'قبل ساعة' },
  { value: '120', label: 'قبل ساعتين' },
  { value: '1440', label: 'قبل يوم' },
  { value: '4320', label: 'قبل 3 أيام' },
  { value: '10080', label: 'قبل أسبوع' },
  { value: '20160', label: 'قبل أسبوعين' },
  { value: '43200', label: 'قبل شهر' },
];

function Settings() {
  const user = JSON.parse(localStorage.getItem('darb_user') || '{}');
  const { theme, toggleTheme } = useTheme();
  const [reminder, setReminder] = useState(localStorage.getItem('darb_reminder') || '30');

  const handleSave = () => {
    localStorage.setItem('darb_reminder', reminder);
    toast.success('✅ تم حفظ الإعدادات');
  };

  const handleNotification = () => {
    const granted = requestNotificationPermission();
    if (granted) {
      toast.success('🔔 الإشعارات مفعلة');
    } else {
      toast('🔔 سمح بالإشعارات من المتصفح', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>⚙️ الإعدادات</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>تخصيص التطبيق حسب رغبتك</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px', padding: '24px', border: '1px solid var(--border-accent)',
          boxShadow: '0 8px 32px var(--shadow)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>👤 الملف الشخصي</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>الاسم</label>
              <div style={{
                padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '13px',
              }}>{user.name || 'غير محدد'}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>البريد الإلكتروني</label>
              <div style={{
                padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '13px',
              }}>{user.email || 'غير محدد'}</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px', padding: '24px', border: '1px solid var(--border-accent)',
          boxShadow: '0 8px 32px var(--shadow)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>🔔 الإشعارات</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>التذكير الافتراضي قبل الموعد</label>
              <select value={reminder} onChange={e => setReminder(e.target.value)}
                style={{
                  width: '220px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                  background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                {REMINDER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={handleNotification} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--input-bg)', color: 'var(--text-primary)', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.target.style.background = 'var(--accent-glow)'}
                onMouseLeave={e => e.target.style.background = 'var(--input-bg)'}>
                🔔 تفعيل إشعارات المتصفح
              </button>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                الإشعارات تشتغل حتى لو كان البرنامج مصغر. راح تنبهك قبل المواعيد.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px', padding: '24px', border: '1px solid var(--border-accent)',
          boxShadow: '0 8px 32px var(--shadow)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>🎨 المظهر</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <select value={theme} onChange={toggleTheme}
              style={{
                width: '220px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}>
              <option value="dark" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>🌙 داكن</option>
              <option value="light" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>☀️ فاتح</option>
            </select>
            <button onClick={toggleTheme} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>
              {theme === 'dark' ? '☀️ الوضع الفاتح' : '🌙 الوضع الداكن'}
            </button>
          </div>
        </div>

        <button onClick={handleSave} style={{
          padding: '12px 28px', borderRadius: '12px', border: 'none', alignSelf: 'flex-start',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 16px var(--accent-glow)',
        }}>
          💾 حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

export default Settings;
