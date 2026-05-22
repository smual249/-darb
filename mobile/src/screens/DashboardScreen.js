import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { emails, telegram, whatsapp, tasks } from '../services/api';

function DashboardScreen() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [e, t, w, ts] = await Promise.all([
        emails.list({ limit: 100 }).catch(() => ({ data: { emails: [] } })),
        telegram.messages({ limit: 100 }).catch(() => ({ data: { messages: [] } })),
        whatsapp.messages({ limit: 100 }).catch(() => ({ data: { messages: [] } })),
        tasks.list({ limit: 100 }).catch(() => ({ data: { tasks: [] } })),
      ]);
      setStats({
        emails: e.data.emails.length,
        telegram: t.data.messages.length,
        whatsapp: w.data.messages.length,
        tasks: ts.data.tasks.length,
        completedTasks: ts.data.tasks.filter(x => x.status === 'completed').length,
      });
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#e94560" /></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>درب</Text>
      <Text style={styles.subtitle}>سكرتير خاص فيك</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.icon}>📧</Text>
          <Text style={styles.cardTitle}>البريد</Text>
          <Text style={styles.count}>{stats.emails}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.icon}>✈️</Text>
          <Text style={styles.cardTitle}>تليجرام</Text>
          <Text style={styles.count}>{stats.telegram}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.cardTitle}>واتساب</Text>
          <Text style={styles.count}>{stats.whatsapp}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.cardTitle}>المهام</Text>
          <Text style={styles.count}>{stats.tasks}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 15 },
  center: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#e94560', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  subtitle: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { background: '#1a1a2e', borderRadius: 12, padding: 20, width: '48%', marginBottom: 15, backgroundColor: '#1a1a2e' },
  icon: { fontSize: 32, marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  count: { color: '#e94560', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
});

export default DashboardScreen;
