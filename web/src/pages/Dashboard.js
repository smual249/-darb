import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CATEGORY_MAP = {
  general: '📋 عام', visa: '🛂 فيزا', iqama: '🆔 إقامة',
  driving_license: '🚗 رخصة قيادة', car_registration: '🚙 استمارة',
  passport: '📘 جواز سفر', insurance: '🛡️ تأمين', bill: '🧾 فاتورة',
  loan: '💰 قرض', installment: '💳 قسط', rent: '🏠 إيجار',
  salary: '💵 راتب', meeting: '🤝 اجتماع', medical: '🏥 موعد طبي',
  work: '💼 دوام', school: '📚 مدرسة', exam: '📝 اختبار',
  interview: '👔 مقابلة', birthday: '🎂 عيد ميلاد',
  anniversary: '💍 ذكرى زواج', occasion: '🎉 مناسبة', party: '🎊 حفلة',
  travel: '✈️ سفر', booking: '📋 حجز', maintenance: '🔧 صيانة',
  shopping: '🛒 تسوق', sports: '⚽ رياضة', religious: '🕋 ديني',
  project_deadline: '📌 مشروع', appointment: '📅 موعد', important: '⭐ مهم',
  other: '📌 أخرى',
};

const PRIORITY_COLORS = { urgent: '#e94560', high: '#f39c12', medium: '#3498db', low: '#2ecc71' };

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, urgent: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('darb_user') || '{}');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
      });
      const data = await res.json();
      if (res.ok && data.tasks) {
        setTasks(data.tasks);
        const now = new Date();
        const today = now.toDateString();
        setStats({
          total: data.tasks.length,
          today: data.tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today).length,
          urgent: data.tasks.filter(t => t.priority === 'urgent').length,
          completed: data.tasks.filter(t => t.completed).length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const quickLinks = [
    { label: 'المحادثة', desc: 'تحدث مع الذكاء', icon: '💬', path: '/chat', color: '#e94560' },
    { label: 'موعد جديد', desc: 'أضف تذكيراً', icon: '📅', path: '/tasks', color: '#3498db' },
    { label: 'البريد', desc: 'صندوق الوارد', icon: '✉️', path: '/emails', color: '#2ecc71' },
    { label: 'الإعدادات', desc: 'تخصيص التطبيق', icon: '⚙️', path: '/settings', color: '#f39c12' },
  ];

  const upcomingTasks = tasks.filter(t => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
          مرحباً، {user.name || 'مستخدم'} 👋
        </h1>
        <p style={{ color: '#888', fontSize: '14px' }}>هذه لوحة التحكم الخاصة بك</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'إجمالي المواعيد', value: stats.total, color: '#3498db', icon: '📋' },
          { label: 'مواعيد اليوم', value: stats.today, color: '#2ecc71', icon: '📅' },
          { label: 'عاجلة', value: stats.urgent, color: '#e94560', icon: '⛔' },
          { label: 'مكتملة', value: stats.completed, color: '#9b59b6', icon: '✅' },
        ].map((card, i) => (
          <div key={i} className="slide-in" style={{
            background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
            borderRadius: '16px', padding: '20px', border: `1px solid ${card.color}20`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#888' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
          borderRadius: '16px', padding: '24px', border: '1px solid rgba(233,69,96,0.1)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            🔗 روابط سريعة
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {quickLinks.map((link, i) => (
              <div key={i} onClick={() => navigate(link.path)} style={{
                padding: '16px', borderRadius: '12px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(233,69,96,0.1)`; e.currentTarget.style.borderColor = `${link.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{link.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{link.label}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{link.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
          borderRadius: '16px', padding: '24px', border: '1px solid rgba(233,69,96,0.1)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            📅 المواعيد القادمة
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>جاري التحميل...</div>
          ) : upcomingTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
              <div>ما عندك مواعيد قادمة</div>
            </div>
          ) : (
            upcomingTasks.map((task, i) => (
              <div key={task._id || i} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
                borderBottom: i < upcomingTasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: `${PRIORITY_COLORS[task.priority] || '#3498db'}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {CATEGORY_MAP[task.category]?.split(' ')[0] || '📌'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{task.title}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'بدون تاريخ'}
                  </div>
                </div>
                <div style={{
                  padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600',
                  background: `${PRIORITY_COLORS[task.priority] || '#3498db'}20`,
                  color: PRIORITY_COLORS[task.priority] || '#3498db',
                }}>
                  {task.priority === 'urgent' ? 'عاجل' : task.priority === 'high' ? 'مهم' : task.priority === 'low' ? 'بسيط' : 'متوسط'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
