import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

function WhatsApp() {
  const socket = useSocket();
  const [phone, setPhone] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;
    if (!socket) return;

    socket.on('whatsapp_qr', (data) => {
      setQrCode(data.qr);
      setConnecting(true);
    });

    socket.on('whatsapp_ready', () => {
      setReady(true);
      setQrCode(null);
      setConnecting(false);
      toast.success('✅ واتساب متصل!');
    });

    socket.on('whatsapp_disconnected', (data) => {
      setReady(false);
      setQrCode(null);
      setConnecting(false);
      toast.error(`❌ انقطع الاتصال: ${data.reason}`);
    });

    return () => {
      socket.off('whatsapp_qr');
      socket.off('whatsapp_ready');
      socket.off('whatsapp_disconnected');
    };
  }, []);

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('darb_token')}` };

  const connect = async () => {
    setError('');
    setQrCode(null);
    setConnecting(true);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, credentials: 'include',
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('🔗 جاري الاتصال... امسح QR');
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST', headers: authHeaders, credentials: 'include' });
      setReady(false);
      setQrCode(null);
      setConnecting(false);
      toast.success('تم قطع الاتصال');
    } catch {}
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>💬 واتساب</h1>
        <p style={{ color: '#888', fontSize: '14px' }}>ربط واتساب للردود التلقائية</p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
        borderRadius: '16px', padding: '40px', textAlign: 'center',
        border: '1px solid rgba(233,69,96,0.1)',
      }}>
        {ready ? (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2ecc71', marginBottom: '8px' }}>واتساب متصل!</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>الردود التلقائية شغالة</p>
            <button onClick={disconnect} style={{
              padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(233,69,96,0.3)',
              background: 'transparent', color: '#e94560', cursor: 'pointer', fontSize: '14px',
            }}>
              قطع الاتصال
            </button>
          </>
        ) : qrCode ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>امسح QR code</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>
              افتح واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز
            </p>
            <div style={{
              display: 'inline-block', padding: '16px', borderRadius: '16px',
              background: '#fff', marginBottom: '16px',
            }}>
              <img src={qrCode} alt="WhatsApp QR" style={{ width: '220px', height: '220px' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#f39c12' }}>⏳ في انتظار المسح...</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📱</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>واتساب</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              اربط واتساب للرد التلقائي على الرسائل. بعد الضغط على اتصال، امسح QR code من واتساب
            </p>
            <div style={{ maxWidth: '360px', margin: '0 auto' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px', textAlign: 'right' }}>رقم الهاتف (اختياري)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+9665XXXXXXXX"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                  }} />
              </div>
              <button onClick={connect} disabled={connecting} style={{
                padding: '12px 28px', borderRadius: '12px', border: 'none',
                background: connecting ? '#555' : 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#fff', fontSize: '15px', fontWeight: '700', cursor: connecting ? 'not-allowed' : 'pointer',
              }}>
                {connecting ? '🔄 جاري الاتصال...' : '🔗 اتصال بالواتساب'}
              </button>
            </div>
            {error && <p style={{ color: '#e94560', fontSize: '12px', marginTop: '12px' }}>{error}</p>}
          </>
        )}
        <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', color: '#666' }}>
          💡 يستخدم whatsapp-web.js — امسح QR مرة واحدة فقط
        </div>
      </div>
    </div>
  );
}

export default WhatsApp;
