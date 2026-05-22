export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  return false;
}

export function sendNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    requestNotificationPermission();
    return;
  }
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      dir: 'rtl',
      lang: 'ar',
      tag: 'darb-reminder',
      requireInteraction: true,
      ...options,
    });
  } catch (e) {
    console.log('Notification error:', e);
  }
}

export function scheduleNotification(taskTitle, dueDate, minutesBefore = 30) {
  const due = new Date(dueDate);
  const now = new Date();
  const reminderTime = new Date(due.getTime() - minutesBefore * 60 * 1000);
  const delay = reminderTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      sendNotification(
        `🔔 تذكير: ${taskTitle}`,
        `بقيت ${minutesBefore} دقيقة على الموعد`
      );
    }, delay);
  }
}

export function checkAndNotify(tasks) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  tasks.forEach(task => {
    if (!task.dueDate || task.completed) return;
    const due = new Date(task.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin > 0 && diffMin <= 60) {
      sendNotification(
        `🔔 تذكير: ${task.title}`,
        task.dueDate
          ? `الموعد: ${new Date(task.dueDate).toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
          : 'موعدك باقي له أقل من ساعة'
      );
    }
  });
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(e => console.log('SW registration failed:', e));
  }
}
