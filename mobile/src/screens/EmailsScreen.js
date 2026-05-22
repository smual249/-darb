import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { emails } from '../services/api';

function EmailsScreen() {
  const [emailList, setEmailList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadEmails(); }, []);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const { data } = await emails.list({ limit: 50 });
      setEmailList(data.emails);
    } catch {} finally { setLoading(false); }
  };

  const handleGenerateReply = async (id) => {
    try {
      await emails.generateReply(id);
      Alert.alert('تم', 'تم إنشاء الرد الآلي');
      loadEmails();
    } catch {}
  };

  const handleApproveReply = async (id) => {
    try {
      await emails.approveReply(id, {});
      Alert.alert('تم', 'تم إرسال الرد');
      loadEmails();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📧 البريد الإلكتروني</Text>
        <TouchableOpacity style={styles.fetchBtn} onPress={loadEmails}>
          <Text style={styles.fetchBtnText}>تحديث</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={emailList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.from}>{item.fromName || item.from}</Text>
            <Text style={styles.subject}>{item.subject}</Text>
            {!item.isReplied && !item.replyPending && (
              <TouchableOpacity style={styles.btn} onPress={() => handleGenerateReply(item._id)}>
                <Text style={styles.btnText}>✨ إنشاء رد</Text>
              </TouchableOpacity>
            )}
            {item.replyPending && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#4caf50' }]} onPress={() => handleApproveReply(item._id)}>
                <Text style={styles.btnText}>✅ اعتماد الرد</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد رسائل</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  fetchBtn: { backgroundColor: '#e94560', padding: 10, borderRadius: 8 },
  fetchBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, marginBottom: 10 },
  from: { color: '#fff', fontWeight: 'bold' },
  subject: { color: '#aaa', fontSize: 14, marginVertical: 5 },
  btn: { backgroundColor: '#e94560', padding: 8, borderRadius: 6, alignSelf: 'flex-start', marginTop: 5 },
  btnText: { color: '#fff', fontSize: 13 },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 },
});

export default EmailsScreen;
