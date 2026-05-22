import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('darb_token')) navigate('/dashboard');
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('يرجى ملء جميع الحقول');
    if (password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في التسجيل');
      toast.success('تم التسجيل بنجاح!');
      navigate('/login');
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
      <div className="fade-in" style={{ width: '420px', maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #e94560, #c23152)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '32px', fontWeight: 'bold', color: '#fff',
            boxShadow: '0 8px 32px rgba(233,69,96,0.3)',
          }}>د</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>انضم لدرب</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>سكرتيرك الذكي الجديد</p>
        </div>
        <form onSubmit={handleRegister} style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(22,33,62,0.95))',
          borderRadius: '20px', padding: '36px',
          border: '1px solid rgba(233,69,96,0.15)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>
            إنشاء حساب جديد
          </h2>
          {['الاسم', 'البريد الإلكتروني', 'كلمة المرور'].map((label, i) => {
            const fields = [name, email, password];
            const setters = [setName, setEmail, setPassword];
            const types = ['text', 'email', 'password'];
            const placeholders = ['محمد أحمد', 'your@email.com', '••••••••'];
            return (
              <div key={i} style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>{label}</label>
                <input type={types[i]} value={fields[i]} onChange={e => setters[i](e.target.value)}
                  placeholder={placeholders[i]}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px',
                    transition: 'all 0.2s', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#e94560'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            );
          })}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
            background: loading ? '#666' : 'linear-gradient(135deg, #e94560, #c23152)',
            color: '#fff', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}>
            {loading ? 'جاري...' : 'إنشاء حساب'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '18px', color: '#888', fontSize: '14px' }}>
            عندك حساب؟{' '}
            <Link to="/login" style={{ color: '#e94560', textDecoration: 'none', fontWeight: '600' }}>
              تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
