import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const intensityStyles = {
  0: { bg: 'rgba(46,204,113,0.9)', icon: '🔔' },
  1: { bg: 'rgba(243,156,18,0.9)', icon: '🔔🔔' },
  2: { bg: 'rgba(231,76,60,0.95)', icon: '🔴🔴🔴' },
  3: { bg: 'rgba(192,57,43,0.98)', icon: '🚨🚨🚨🚨' },
};

export default function NotificationOverlay() {
  const socket = useSocket();
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('nag', (data) => {
      const int = data.intensity || 0;
      if (int >= 2) {
        setActive(data);
      } else {
        toast(data.messageAr, {
          icon: intensityStyles[int]?.icon || '🔔',
          duration: 6000,
          style: { background: intensityStyles[int]?.bg, color: '#fff', borderRadius: '12px', fontFamily: 'Cairo' },
        });
        if (data.tasks && data.tasks.length > 0) {
          data.tasks.forEach(t => {
            toast(`${t.title} - متأخرة ${t.overdueDays} يوم`, {
              icon: '⏰', duration: 5000,
              style: { background: '#2c3e50', color: '#fff', borderRadius: '10px', fontFamily: 'Cairo' },
            });
          });
        }
      }
    });
    socket.on('reminder', (data) => {
      toast(data.message || `🔔 ${data.title}`, {
        duration: 8000,
        style: { background: '#8e44ad', color: '#fff', borderRadius: '12px', fontFamily: 'Cairo' },
      });
    });
    return () => {
      socket.off('nag');
      socket.off('reminder');
    };
  }, [socket]);

  const dismiss = useCallback(async () => {
    setActive(null);
    try {
      await fetch('/api/schedule/acknowledge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      });
    } catch {}
  }, []);

  if (!active) return null;

  const style = intensityStyles[active.intensity] || intensityStyles[3];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: style.bg, borderRadius: '24px', padding: '40px',
        maxWidth: '450px', width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        animation: 'pulse 1s ease infinite',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>{style.icon}</div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
          {active.messageAr}
        </h2>
        <div style={{ display: 'grid', gap: '8px', marginBottom: '24px', textAlign: 'right' }}>
          {active.tasks && active.tasks.slice(0, 5).map(t => (
            <div key={t._id} style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>⏰ متأخرة {t.overdueDays} يوم</span>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{t.title}</span>
            </div>
          ))}
        </div>
        <button onClick={dismiss} style={{
          padding: '14px 40px', borderRadius: '14px', border: 'none',
          background: 'rgba(255,255,255,0.2)', color: '#fff',
          fontSize: '16px', fontWeight: '700', cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}>
          ✕ خلاص دخلت
        </button>
      </div>
    </div>
  );
}
