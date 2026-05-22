import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('يرجى ملء جميع الحقول');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في تسجيل الدخول');
      localStorage.setItem('darb_token', data.token);
      localStorage.setItem('darb_user', JSON.stringify(data.user));
      toast.success('مرحباً بعودتك! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '20px',
    }}>
      <div style={{
        position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'radial-gradient(circle at 70% 30%, rgba(233,69,96,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      <div className="fade-in" style={{
        width: '420px', maxWidth: '100%', position: 'relative',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #e94560, #c23152)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '32px', fontWeight: 'bold', color: '#fff',
            boxShadow: '0 8px 32px rgba(233,69,96,0.3)',
          }}>د</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>درب</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>سكرتير خاص يدير مواعيدك ويرتب جدولك</p>
        </div>
        <form onSubmit={handleLogin} style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(22,33,62,0.95))',
          borderRadius: '20px', padding: '36px',
          border: '1px solid rgba(233,69,96,0.15)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>
            تسجيل الدخول
          </h2>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px',
                transition: 'all 0.2s', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#e94560'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px',
                transition: 'all 0.2s', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#e94560'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
            background: loading ? '#666' : 'linear-gradient(135deg, #e94560, #c23152)',
            color: '#fff', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}>
            {loading ? 'جاري...' : 'تسجيل الدخول'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '18px', color: '#888', fontSize: '14px' }}>
            ما عندك حساب؟{' '}
            <Link to="/register" style={{ color: '#e94560', textDecoration: 'none', fontWeight: '600' }}>
              سجل الآن
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
