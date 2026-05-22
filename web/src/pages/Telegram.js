import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

function Telegram() {
  const socket = useSocket();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchInfo();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (data) => {
      if (data.platform === 'telegram') {
        setMessages(prev => [{ id: Date.now(), fromName: data.from, text: data.text, receivedAt: new Date() }, ...prev]);
        toast(`📩 ${data.from}: ${data.text}`, { duration: 4000, style: { background: '#2c3e50', color: '#fff', borderRadius: '10px' } });
      }
    });
    return () => { socket.off('new_message'); };
  }, [socket]);

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('darb_token')}` };

  const fetchInfo = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/telegram/bot-info', { headers: authHeaders, credentials: 'include' });
      const data = await res.json();
      setConnected(data.connected);
      if (data.connected && data.hasGlobalBot) fetchMessages();
    } catch {}
    setChecking(false);
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/telegram/messages', { headers: authHeaders, credentials: 'include' });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {}
  };

  const connect = async () => {
    try {
      const res = await fetch('/api/telegram/connect', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('darb_token')}` }, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConnected(true);
      toast.success('✅ تم ربط البوت!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const disconnect = async () => {
    try {
      await fetch('/api/telegram/disconnect', { method: 'POST', headers: authHeaders, credentials: 'include' });
      setConnected(false);
      toast('❌ تم قطع الاتصال');
    } catch {}
  };

  if (checking) return <div className="fade-in"><p style={{ color: '#888' }}>جارٍ التحميل...</p></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>📱 تليجرام</h1>
        <p style={{ color: '#888', fontSize: '14px' }}>ربط تليجرام للردود التلقائية</p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
        borderRadius: '16px', padding: '40px', textAlign: 'center',
        border: '1px solid rgba(233,69,96,0.1)',
      }}>
        {connected ? (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2ecc71', marginBottom: '8px' }}>البوت متصل!</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
              البوت شغال، أي رسالة تجيك على تليجرام راح تظهر هنا
            </p>
            <button onClick={fetchMessages} style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#aaa', cursor: 'pointer', fontSize: '13px', marginBottom: '12px', marginLeft: '8px',
            }}>
              🔄 تحديث
            </button>
            <button onClick={disconnect} style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(233,69,96,0.3)',
              background: 'transparent', color: '#e94560', cursor: 'pointer', fontSize: '13px',
            }}>
              قطع الاتصال
            </button>

            {messages.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '12px' }}>آخر الرسائل ({messages.length})</h3>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {messages.slice(0, 20).map((msg, i) => (
                    <div key={msg._id || i} style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '12px', color: '#3498db', fontWeight: '600', marginBottom: '2px' }}>
                        {msg.fromName} {msg.isBusiness && '🏢'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#ddd' }}>{msg.text}</div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                        {msg.receivedAt ? new Date(msg.receivedAt).toLocaleString('ar-SA') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>بوت التليجرام</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              البوت مضبوط وجاهز. اضغط على اتصال لتفعيل البوت وابدأ استقبال الرسائل
            </p>
            <button onClick={connect} style={{
              padding: '12px 28px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #0088cc, #0077b5)',
              color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            }}>
              🔗 اتصال
            </button>
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', color: '#666' }}>
              💡 البوت مضبوط في الإعدادات، ارسل رسالة للبوت على تليجرام وشوفها هنا
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Telegram;
