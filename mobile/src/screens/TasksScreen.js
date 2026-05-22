import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { tasks } from '../services/api';

const categories = [
  { value: 'general', label: 'عام' },
  { value: 'visa', label: 'فيزا' },
  { value: 'loan', label: 'قرض' },
  { value: 'bill', label: 'فاتورة' },
  { value: 'meeting', label: 'اجتماع' },
  { value: 'deadline', label: 'موعد' },
  { value: 'other', label: 'أخرى' },
];

function TasksScreen() {
  const [taskList, setTaskList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const { data } = await tasks.list({ limit: 100 });
      setTaskList(data.tasks);
    } catch {}
  };

  const handleCreate = async () => {
    if (!title) return Alert.alert('خطأ', 'الرجاء إدخال عنوان المهمة');
    try {
      await tasks.create({ title, description });
      Alert.alert('تم', 'تم إنشاء المهمة');
      setShowForm(false);
      setTitle('');
      setDescription('');
      loadTasks();
    } catch {}
  };

  const handleComplete = async (id) => {
    try {
      await tasks.complete(id);
      loadTasks();
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await tasks.delete(id);
      loadTasks();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✅ المهام</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? 'إلغاء' : '+ جديد'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="عنوان المهمة" placeholderTextColor="#666"
            value={title} onChangeText={setTitle} />
          <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="الوصف" placeholderTextColor="#666"
            value={description} onChangeText={setDescription} multiline />
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>إنشاء</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={taskList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.card, { opacity: item.status === 'completed' ? 0.5 : 1 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardActions}>
                {item.status !== 'completed' && (
                  <TouchableOpacity onPress={() => handleComplete(item._id)}>
                    <Text style={styles.completeBtn}>✓</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            {item.description && <Text style={styles.desc}>{item.description}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مهام</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#e94560', padding: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  form: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, marginBottom: 15 },
  input: { backgroundColor: '#16213e', color: '#fff', padding: 12, borderRadius: 6, marginBottom: 10 },
  createBtn: { backgroundColor: '#4caf50', padding: 12, borderRadius: 6, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontWeight: 'bold', flex: 1 },
  cardActions: { flexDirection: 'row', gap: 15 },
  completeBtn: { color: '#4caf50', fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { color: '#e94560', fontSize: 18, fontWeight: 'bold' },
  desc: { color: '#aaa', fontSize: 13, marginTop: 5 },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 },
});

export default TasksScreen;
