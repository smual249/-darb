import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  { icon: '📅', label: 'موعد جديد', msg: 'ودي أضيف موعد جديد' },
  { icon: '🗂️', label: 'عرض المواعيد', msg: 'عندي مهام؟' },
  { icon: 'ℹ️', label: 'التصنيفات', msg: 'وش التصنيفات المتوفرة؟' },
  { icon: '❓', label: 'مساعدة', msg: 'وش تقدر تسوي؟' },
];

function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'مرحباً! أنا درب 🤖\n\nأقدر أساعدك تضيف مواعيد و تذكيرات بالكلام الطبيعي.\n\nجرب تقول:\n• "ذكرني بتجديد الاستمارة"\n• "عندي اجتماع بكره الساعة 10"\n• "موعد دكتور يوم 15 يناير"' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [heyDarb, setHeyDarb] = useState(localStorage.getItem('darb_hey_darb') === 'true');
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const wakeRef = useRef(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    preinitTTS();
    window.addEventListener('touchstart', preinitTTS, { once: true });
    window.addEventListener('click', preinitTTS, { once: true });
  }, [messages]);

  useEffect(() => {
    navigator.serviceWorker?.addEventListener('message', (e) => {
      if (e.data?.type === 'voice-command') {
        toast.success('🎤 "يا درب" من الخلفية!');
      }
    });
  }, []);

  useEffect(() => {
    if (heyDarb) requestWakeLock();
    else releaseWakeLock();
    localStorage.setItem('darb_hey_darb', heyDarb);
  }, [heyDarb]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {});
      }
    } catch {}
  };

  const releaseWakeLock = () => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('darb_token')}`,
        },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        const reply = data.reply || data.response || 'تم استلام رسالتك';
        if (data.taskCreated) {
          setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
          toast.success('✅ تم إضافة الموعد بنجاح!');
          setTimeout(() => navigate('/tasks'), 2000);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        }
        speak(reply);
      } else {
        throw new Error(data.error || 'خطأ في الاتصال');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `❌ عذراً: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error('المتصفح لا يدعم الإدخال الصوتي');
    if (listening) { stopListening(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(prev => prev + text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); toast.error('تعرف على الصوت فشل، حاول مرة ثانية'); };
    recognition.start();
    setListening(true);
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speak = (text) => {
    if (!autoSpeak) return;
    if (!window.speechSynthesis) return console.log('TTS not supported');
    window.speechSynthesis.cancel();
    const clean = text.replace(/[📅🗂️ℹ️❓🎉✅❌🔔👋💡🌟🫡🤚😊🤍✨🤖]/g, '').substring(0, 200);
    if (!clean.trim()) return;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onerror = (e) => console.log('TTS error:', e.error);
    window.speechSynthesis.speak(utterance);
  };

  const preinitTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.getVoices();
    }
  };

  const startHeyDarb = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error('المتصفح لا يدعم التعرف الصوتي');
    if (heyDarb) { stopHeyDarb(); return; }
    toast.success('🎤 "يا درب" نشط! قول "يا درب" وانتظر الرد');
    setHeyDarb(true);
    const listen = () => {
      const r = new SpeechRecognition();
      r.lang = 'ar-SA';
      r.continuous = true;
      r.interimResults = false;
      r.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
        if (text.includes('يا درب') || text.includes('hey darb') || text.includes('يا دارب')) {
          toast.success('🎤 سمعتك! قولي طلبك');
          r.stop();
          const listenCmd = () => {
            const r2 = new SpeechRecognition();
            r2.lang = 'ar-SA';
            r2.continuous = false;
            r2.interimResults = false;
            r2.onresult = async (e2) => {
              const cmd = e2.results[0][0].transcript;
              if (cmd.trim()) {
                sendMessage(cmd);
                await new Promise(r => setTimeout(r, 5000));
              }
            };
            r2.start();
          };
          setTimeout(listenCmd, 500);
        }
      };
      r.onend = () => { if (heyDarb) setTimeout(listen, 300); };
      r.start();
      wakeRef.current = r;
    };
    listen();
  };

  const stopHeyDarb = () => {
    wakeRef.current?.stop();
    setHeyDarb(false);
    toast('🔇 "يا درب" متوقف');
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>💬 المحادثة الذكية</h1>
        <p style={{ color: '#888', fontSize: '14px' }}>تحدث مع الذكاء الاصطناعي لإنشاء وإدارة المواعيد</p>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
        borderRadius: '20px', border: '1px solid rgba(233,69,96,0.1)',
        overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {messages.map((msg, i) => (
            <div key={i} className="fade-in" style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-start',
              flexDirection: 'row-reverse', alignItems: 'flex-start', gap: '10px',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #e94560, #c23152)'
                  : 'linear-gradient(135deg, #3498db, #2980b9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: '16px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(194,49,82,0.1))'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.08)'}`,
                fontSize: '14px', lineHeight: 1.6, color: '#eee',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', color: '#888',
              fontSize: '14px',
            }}>
              <div style={{ animation: 'pulse 1.5s infinite' }}>🤖</div>
              <span>يكتب...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {!loading && messages.length <= 1 && quickActions.map((action, i) => (
            <button key={i} onClick={() => sendMessage(action.msg)} style={{
              padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: '#aaa', cursor: 'pointer',
              fontSize: '12px', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(233,69,96,0.1)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.03)'}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder={listening ? '🎤 أتكلمي...' : 'اكتب رسالتك...'} disabled={loading}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#e94560'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button type="button" onClick={startListening} title="🎤 تسجيل صوتي" style={{
            width: '46px', borderRadius: '14px', border: 'none', flexShrink: 0,
            background: listening ? '#e94560' : 'rgba(255,255,255,0.08)',
            color: listening ? '#fff' : '#aaa', fontSize: '18px', cursor: 'pointer',
            transition: 'all 0.2s',
            animation: listening ? 'pulse 1s infinite' : 'none',
          }}>
            {listening ? '🔴' : '🎤'}
          </button>
          <button type="submit" disabled={loading || !input.trim()} style={{
            padding: '12px 24px', borderRadius: '14px', border: 'none',
            background: loading || !input.trim() ? '#333' : 'linear-gradient(135deg, #e94560, #c23152)',
            color: '#fff', fontSize: '15px', fontWeight: '700', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            {loading ? '...' : 'إرسال'}
          </button>
          <button type="button" onClick={startHeyDarb} title="🎯 يا درب - استماع دائم" style={{
            width: '46px', borderRadius: '14px', border: 'none', flexShrink: 0,
            background: heyDarb ? '#2ecc71' : 'rgba(255,255,255,0.08)',
            color: heyDarb ? '#fff' : '#aaa', fontSize: '16px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {heyDarb ? '🔊' : '🔇'}
          </button>
          <button type="button" onClick={() => setAutoSpeak(!autoSpeak)} title={autoSpeak ? '🔊 قراءة الردود' : '🔇 كتم الصوت'} style={{
            width: '46px', borderRadius: '14px', border: 'none', flexShrink: 0,
            background: autoSpeak ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
            color: autoSpeak ? '#2ecc71' : '#666', fontSize: '16px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            🔊
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
