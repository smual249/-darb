import React, { useState } from 'react';
import toast from 'react-hot-toast';

function Emails() {
  const [connected, setConnected] = useState(() => {
    const u = JSON.parse(localStorage.getItem('darb_user') || '{}');
    return !!(u.emailSettings?.connected || u.emailSettings?.gmailUser);
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(!connected);
  const [form, setForm] = useState({ email: '', appPassword: '' });
  const [emails, setEmails] = useState([]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!form.email || !form.appPassword) return toast.error('املأ جميع الحقول');
    setLoading(true);
    try {
      const res = await fetch('/api/emails/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الربط');
      const user = JSON.parse(localStorage.getItem('darb_user') || '{}');
      user.emailSettings = { ...user.emailSettings, connected: true, gmailUser: form.email };
      localStorage.setItem('darb_user', JSON.stringify(user));
      setConnected(true);
      setShowForm(false);
      toast.success('✅ تم ربط Gmail بنجاح!');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/emails/fetch', {
        headers: { Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEmails(data.emails || []);
        toast.success(`📩 تم جلب ${data.count || 0} رسالة`);
      } else throw new Error(data.error);
    } catch (err) { toast.error(`فشل الجلب: ${err.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>✉️ البريد الإلكتروني</h1>
        <p style={{ color: '#888', fontSize: '14px' }}>{connected ? 'إدارة صندوق الوارد' : 'ربط حساب Gmail'}</p>
      </div>

      {!connected || showForm ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
          borderRadius: '16px', padding: '40px',
          border: '1px solid rgba(233,69,96,0.1)',
          maxWidth: '500px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>📧</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>ربط Gmail</h2>



          <form onSubmit={handleConnect}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Gmail الإيميل</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com" dir="ltr"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>كلمة مرور التطبيق (App Password)</label>
              <input value={form.appPassword} onChange={e => setForm({ ...form, appPassword: e.target.value })}
                placeholder="xxxx xxxx xxxx xxxx" dir="ltr" type="password"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
              background: loading ? '#333' : 'linear-gradient(135deg, #e94560, #c23152)',
              color: '#fff', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'جاري الربط...' : '🔗 ربط Gmail'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
            borderRadius: '16px', padding: '24px', border: '1px solid rgba(46,204,113,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>✅ Gmail متصل</h3>
              <p style={{ fontSize: '13px', color: '#888' }}>حسابك متصل والردود التلقائية شغالة</p>
            </div>
            <button onClick={fetchEmails} disabled={loading} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: loading ? '#333' : 'linear-gradient(135deg, #e94560, #c23152)',
              color: '#fff', fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            }}>{loading ? '...' : '📩 جلب الرسائل'}</button>
          </div>

          {emails.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '14px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div>اضغطي "جلب الرسائل" لعرض رسائلك</div>
            </div>
          )}

          {emails.map((email, i) => (
            <EmailCard key={email.messageId || i} email={email} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmailCard({ email }) {
  const [reply, setReply] = useState(email.aiGeneratedReply || '');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showReply, setShowReply] = useState(false);

  const generateReply = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/emails/${email._id}/generate-reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
      });
      const data = await res.json();
      if (res.ok) { setReply(data.reply); setShowReply(true); toast.success('🤖 تم توليد الرد'); }
      else throw new Error(data.error);
    } catch (err) { toast.error(err.message); }
    finally { setGenerating(false); }
  };

  const sendReply = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/emails/${email._id}/approve-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
        body: JSON.stringify({ reply }),
      });
      if (res.ok) { toast.success('✅ تم إرسال الرد'); setShowReply(false); }
      else throw new Error((await res.json()).error);
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
      borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div onClick={() => setShowBody(!showBody)} style={{ cursor: 'pointer' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>{email.subject}</div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {email.fromName} - {email.receivedAt ? new Date(email.receivedAt).toLocaleDateString('ar-SA') : ''}
        </div>
      </div>

      {showBody && email.body && (
        <div style={{
          marginTop: '12px', padding: '12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', fontSize: '13px', color: '#bbb', lineHeight: 1.6,
          maxHeight: '200px', overflowY: 'auto',
        }}>
          {email.body}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={generateReply} disabled={generating} style={{
          padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(233,69,96,0.3)',
          background: generating ? '#333' : 'transparent', color: generating ? '#666' : '#e94560',
          cursor: generating ? 'not-allowed' : 'pointer', fontSize: '12px',
        }}>
          {generating ? '...' : '🤖 توليد رد'}
        </button>
        <button onClick={() => setShowBody(!showBody)} style={{
          padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '12px',
        }}>
          {showBody ? '🔺 إخفاء' : '🔽 عرض الرسالة'}
        </button>
      </div>

      {showReply && (
        <div className="fade-in" style={{ marginTop: '12px' }}>
          <textarea value={reply} onChange={e => setReply(e.target.value)}
            rows="4" style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(46,204,113,0.3)',
              background: 'rgba(46,204,113,0.05)', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical',
            }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={sendReply} disabled={sending || !reply.trim()} style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: sending || !reply.trim() ? '#333' : 'linear-gradient(135deg, #2ecc71, #27ae60)',
              color: '#fff', fontSize: '12px', fontWeight: '700', cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer',
            }}>
              {sending ? '...' : '✉️ إرسال الرد'}
            </button>
            <button onClick={() => setShowReply(false)} style={{
              padding: '8px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '12px',
            }}>
              ❌ إلغاء
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
            💡 الذكاء الاصطناعي كتب الرد — تقدر تعدل عليه قبل الإرسال
          </div>
        </div>
      )}
    </div>
  );
}

export default Emails;
