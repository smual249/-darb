import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { checkAndNotify, requestNotificationPermission, sendNotification } from '../utils/notifications';

const CATEGORIES = [
  { id: 'general', icon: '📋', label: 'عام' },
  { id: 'visa', icon: '🛂', label: 'فيزا' },
  { id: 'iqama', icon: '🆔', label: 'إقامة' },
  { id: 'driving_license', icon: '🚗', label: 'رخصة قيادة' },
  { id: 'car_registration', icon: '🚙', label: 'استمارة' },
  { id: 'passport', icon: '📘', label: 'جواز سفر' },
  { id: 'insurance', icon: '🛡️', label: 'تأمين' },
  { id: 'custom', icon: '📌', label: 'مخصص' },
  { id: 'bill', icon: '🧾', label: 'فاتورة' },
  { id: 'loan', icon: '💰', label: 'قرض' },
  { id: 'installment', icon: '💳', label: 'قسط' },
  { id: 'rent', icon: '🏠', label: 'إيجار' },
  { id: 'salary', icon: '💵', label: 'راتب' },
  { id: 'meeting', icon: '🤝', label: 'اجتماع' },
  { id: 'medical', icon: '🏥', label: 'موعد طبي' },
  { id: 'work', icon: '💼', label: 'دوام' },
  { id: 'school', icon: '📚', label: 'مدرسة' },
  { id: 'exam', icon: '📝', label: 'اختبار' },
  { id: 'interview', icon: '👔', label: 'مقابلة' },
  { id: 'birthday', icon: '🎂', label: 'عيد ميلاد' },
  { id: 'anniversary', icon: '💍', label: 'ذكرى زواج' },
  { id: 'occasion', icon: '🎉', label: 'مناسبة' },
  { id: 'party', icon: '🎊', label: 'حفلة' },
  { id: 'travel', icon: '✈️', label: 'سفر' },
  { id: 'booking', icon: '📋', label: 'حجز' },
  { id: 'maintenance', icon: '🔧', label: 'صيانة' },
  { id: 'shopping', icon: '🛒', label: 'تسوق' },
  { id: 'sports', icon: '⚽', label: 'رياضة' },
  { id: 'religious', icon: '🕋', label: 'ديني' },
  { id: 'project_deadline', icon: '📌', label: 'مشروع' },
  { id: 'appointment', icon: '📅', label: 'موعد' },
  { id: 'important', icon: '⭐', label: 'مهم' },
  { id: 'other', icon: '📌', label: 'أخرى' },
];

const PRIORITIES = [
  { id: 'urgent', label: '⛔ عاجل', color: '#e94560' },
  { id: 'high', label: '🔴 مهم', color: '#f39c12' },
  { id: 'medium', label: '🟡 متوسط', color: '#3498db' },
  { id: 'low', label: '🟢 بسيط', color: '#2ecc71' },
];

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', category: 'general', priority: 'medium',
    dueDate: '', reminderInterval: '30',
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
      });
      const data = await res.json();
      if (res.ok) setTasks(data.tasks || []);
    } catch (err) {
      toast.error('فشل تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    if (tasks.length > 0) checkAndNotify(tasks);
  }, [tasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('يرجى إدخال عنوان الموعد');
    const payload = { ...form, reminderInterval: Number(form.reminderInterval) };
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في الإضافة');
      toast.success('✅ تم إضافة الموعد بنجاح');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'general', priority: 'medium', dueDate: '', reminderInterval: 30 });
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
      });
      if (res.ok) {
        toast.success('🗑️ تم الحذف');
        fetchTasks();
      }
    } catch { toast.error('خطأ في الحذف'); }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('darb_token')}` },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        toast.success(task.completed ? '🔄 تم إعادة تفعيل الموعد' : '✅ تم الإكمال');
        fetchTasks();
      }
    } catch { toast.error('خطأ في التحديث'); }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);
  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>📅 المواعيد</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>{tasks.length} موعد | {tasks.filter(t => !t.completed).length} نشط</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => {
            requestNotificationPermission();
            sendNotification('🔔 درب', 'الإشعارات شغالة! ✅');
            toast.success('✅ تم إرسال إشعار تجريبي');
          }} style={{
            padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: '#aaa', cursor: 'pointer', fontSize: '12px',
          }}>
            🔔 اختبار الإشعارات
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #e94560, #c23152)',
            color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(233,69,96,0.3)',
          }}>
            {showForm ? '✕ إلغاء' : '+ موعد جديد'}
          </button>
          <SmartScheduler tasks={tasks} fetchTasks={fetchTasks} />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="fade-in" style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(22,33,62,0.95))',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
          border: '1px solid rgba(233,69,96,0.15)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>➕ إضافة موعد جديد</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>العنوان</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: تجديد استمارة السيارة"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#e94560'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>التاريخ والوقت</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                  colorScheme: 'dark',
                }}
                onFocus={e => e.target.style.borderColor = '#e94560'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>التصنيف</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#e94560'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#1a1a2e', color: '#fff' }}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>الأولوية</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#e94560'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#1a1a2e', color: '#fff' }}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>التذكير</label>
              <select value={form.reminderInterval} onChange={e => setForm({ ...form, reminderInterval: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#e94560'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <option value="15" style={{ background: '#1a1a2e', color: '#fff' }}>قبل 15 دقيقة</option>
                <option value="30" style={{ background: '#1a1a2e', color: '#fff' }}>قبل 30 دقيقة</option>
                <option value="60" style={{ background: '#1a1a2e', color: '#fff' }}>قبل ساعة</option>
                <option value="120" style={{ background: '#1a1a2e', color: '#fff' }}>قبل ساعتين</option>
                <option value="1440" style={{ background: '#1a1a2e', color: '#fff' }}>قبل يوم</option>
                <option value="4320" style={{ background: '#1a1a2e', color: '#fff' }}>قبل 3 أيام</option>
                <option value="10080" style={{ background: '#1a1a2e', color: '#fff' }}>قبل أسبوع</option>
                <option value="20160" style={{ background: '#1a1a2e', color: '#fff' }}>قبل أسبوعين</option>
                <option value="43200" style={{ background: '#1a1a2e', color: '#fff' }}>قبل شهر</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>التفاصيل (اختياري)</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="تفاصيل إضافية عن الموعد..."
                rows="2"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical',
                }}
                onFocus={e => e.target.style.borderColor = '#e94560'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #e94560, #c23152)', color: '#fff',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          }}>
            ✅ تأكيد الإضافة
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '8px' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
          background: filter === 'all' ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.03)',
          color: filter === 'all' ? '#e94560' : '#888', cursor: 'pointer', fontSize: '12px', fontWeight: filter === 'all' ? '600' : '400',
          whiteSpace: 'nowrap',
        }}>الكل</button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
            background: filter === cat.id ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.03)',
            color: filter === cat.id ? '#e94560' : '#888', cursor: 'pointer', fontSize: '12px',
            whiteSpace: 'nowrap',
          }}>{cat.icon} {cat.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>جارٍ التحميل...</div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>ما فيه مواعيد</div>
          <div style={{ fontSize: '13px' }}>اضف موعد جديد عشان تبدأ</div>
        </div>
      ) : (
        <>
          {activeTasks.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '12px' }}>النشطة ({activeTasks.length})</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {activeTasks.map(task => (
                  <TaskCard key={task._id} task={task} onToggle={toggleComplete} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {completedTasks.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '12px' }}>المكتملة ({completedTasks.length})</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {completedTasks.map(task => (
                  <TaskCard key={task._id} task={task} onToggle={toggleComplete} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
  const priority = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2];
  return (
    <div className="slide-in" style={{
      background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
      borderRadius: '14px', padding: '16px',
      border: task.completed ? '1px solid rgba(46,204,113,0.2)' : '1px solid rgba(255,255,255,0.06)',
      opacity: task.completed ? 0.6 : 1,
      display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      <div onClick={() => onToggle(task)} style={{
        width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
        border: `2px solid ${task.completed ? '#2ecc71' : 'rgba(255,255,255,0.2)'}`,
        background: task.completed ? 'rgba(46,204,113,0.2)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
      }}>
        {task.completed ? '✓' : ''}
      </div>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: `${priority.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>
        {cat.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
          {task.title}
        </div>
        <div style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          {task.category && <span>{cat.icon} {cat.label}</span>}
        </div>
      </div>
      <div style={{
        padding: '2px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600',
        background: `${priority.color}20`, color: priority.color, flexShrink: 0,
      }}>
        {priority.label.split(' ').slice(1).join(' ')}
      </div>
      <button onClick={() => onDelete(task._id)} style={{
        padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(233,69,96,0.2)',
        background: 'transparent', color: '#e94560', cursor: 'pointer', fontSize: '12px',
        flexShrink: 0,
      }}>🗑️</button>
    </div>
  );
}

function SmartScheduler({ tasks, fetchTasks }) {
  const [open, setOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [preference, setPreference] = useState('صباحي');
  const [busyTimes, setBusyTimes] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (!taskInput.trim()) return toast.error('اكتب مهامك أولاً');
    setLoading(true);
    setSchedule(null);
    try {
      const res = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tasks: taskInput, preference, busyTimes }),
      });
      const data = await res.json();
      if (data.schedule && data.schedule.length > 0) {
        setSchedule(data.schedule);
      } else {
        toast.error(data.error || 'ما قدرت أنشئ الجدول');
      }
    } catch { toast.error('خطأ في الاتصال'); }
    setLoading(false);
  };

  const saveAll = async () => {
    if (!schedule) return;
    setSaving(true);
    let saved = 0;
    for (const item of schedule) {
      const dueDate = new Date();
      const timeMatch = item.time?.match(/(\d+)/);
      if (timeMatch) dueDate.setHours(parseInt(timeMatch[1]) + (item.time?.includes('مساء') ? 12 : 0), 0, 0, 0);
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: item.title,
            description: item.description || '',
            category: item.category || 'general',
            priority: item.priority || 'medium',
            dueDate: dueDate.toISOString(),
            reminderInterval: 30,
          }),
        });
        if (res.ok) saved++;
      } catch {}
    }
    if (saved > 0) {
      toast.success(`✅ تم حفظ ${saved} مهمة`);
      fetchTasks();
      setOpen(false);
      setSchedule(null);
      setTaskInput('');
    } else {
      toast.error('فشل في حفظ المهام');
    }
    setSaving(false);
  };

  const updateScheduleItem = (index, field, value) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const addCustomItem = () => {
    const newItem = { title: 'مهمة جديدة', time: '9:00 صباحاً', priority: 'medium', category: 'general', description: '' };
    setSchedule(schedule ? [...schedule, newItem] : [newItem]);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(155,89,182,0.3)',
        background: 'linear-gradient(135deg, rgba(155,89,182,0.2), rgba(142,68,173,0.2))',
        color: '#bb8fce', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
      }}>
        🧠 جدول ذكي
      </button>

      {open && (
        <div onClick={() => { if (!loading) { setOpen(false); setSchedule(null); } }} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} className="fade-in" style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '20px', padding: '28px', maxWidth: '600px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(155,89,182,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>🧠 الجدولة الذكية</h2>
              <button onClick={() => { setOpen(false); setSchedule(null); }} style={{
                background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer',
              }}>✕</button>
            </div>

            {!schedule ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>اكتب مهامك</label>
                  <textarea value={taskInput} onChange={e => setTaskInput(e.target.value)}
                    placeholder={'موعد طبي، تجديد إقامة، شراء مستلزمات، مقابلة عمل...'}
                    rows="4"
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>الوقت المناسب</label>
                    <select value={preference} onChange={e => setPreference(e.target.value)} style={{
                      width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                    }}>
                      <option value="صباحي" style={{ background: '#1a1a2e' }}>☀️ صباحي</option>
                      <option value="مسائي" style={{ background: '#1a1a2e' }}>🌙 مسائي</option>
                      <option value="لا تفضيل" style={{ background: '#1a1a2e' }}>⚖️ لا تفضيل</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>أوقات مشغولة</label>
                    <input value={busyTimes} onChange={e => setBusyTimes(e.target.value)}
                      placeholder="مثال: 9-12 ظهراً"
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button onClick={generate} disabled={loading} style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                  background: loading ? 'rgba(155,89,182,0.3)' : 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                  color: '#fff', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? '🔄 جاري توليد الجدول...' : '🤖 توليد جدول ذكي'}
                </button>
              </>
            ) : (
              <>
                <p style={{ color: '#2ecc71', fontSize: '14px', marginBottom: '16px' }}>
                  ✅ تم توليد الجدول! تقدر تعدل على الأوقات قبل الحفظ
                </p>
                <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                  {schedule.map((item, i) => (
                    <div key={i} className="slide-in" style={{
                      background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ color: '#e94560', fontWeight: '700', fontSize: '12px', minWidth: '24px' }}>#{i + 1}</span>
                        <input value={item.title} onChange={e => updateScheduleItem(i, 'title', e.target.value)}
                          style={{
                            flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', fontWeight: '600', outline: 'none',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#888', fontSize: '11px' }}>🕐</span>
                        <input value={item.time} onChange={e => updateScheduleItem(i, 'time', e.target.value)}
                          style={{
                            flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)', color: '#bb8fce', fontSize: '12px', outline: 'none',
                          }}
                        />
                        <span style={{ color: '#888', fontSize: '11px' }}>🏷️</span>
                        <select value={item.priority} onChange={e => updateScheduleItem(i, 'priority', e.target.value)}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '11px', outline: 'none',
                          }}>
                          <option value="urgent" style={{ background: '#1a1a2e' }}>⛔ عاجل</option>
                          <option value="high" style={{ background: '#1a1a2e' }}>🔴 عالي</option>
                          <option value="medium" style={{ background: '#1a1a2e' }}>🟡 وسط</option>
                          <option value="low" style={{ background: '#1a1a2e' }}>🟢 منخفض</option>
                        </select>
                        <button onClick={() => setSchedule(schedule.filter((_, idx) => idx !== i))} style={{
                          background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '14px', padding: '4px',
                        }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addCustomItem} style={{
                  width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.2)',
                  background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
                }}>
                  + إضافة مهمة مخصصة
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={saveAll} disabled={saving} style={{
                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#fff',
                    fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                  }}>
                    {saving ? '🔄 جاري الحفظ...' : '💾 حفظ الكل'}
                  </button>
                  <button onClick={() => { setSchedule(null); }} style={{
                    padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '13px',
                  }}>
                    تعديل
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Tasks;
