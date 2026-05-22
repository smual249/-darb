import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { whatsapp } from '../services/api';

function WhatsAppScreen() {
  const [msgList, setMsgList] = useState([]);
  const [sendTo, setSendTo] = useState('');
  const [sendText, setSendText] = useState('');

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    try {
      const { data } = await whatsapp.messages({ limit: 50 });
      setMsgList(data.messages);
    } catch {}
  };

  const handleApprove = async (id) => {
    try {
      await whatsapp.approve(id, {});
      Alert.alert('تم', 'تم إرسال الرد');
      loadMessages();
    } catch {}
  };

  const handleSend = async () => {
    if (!sendTo || !sendText) return Alert.alert('خطأ', 'الرجاء إدخال الرقم والنص');
    try {
      await whatsapp.send({ to: sendTo, text: sendText });
      Alert.alert('تم', 'تم إرسال الرسالة');
      setSendText('');
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 واتساب</Text>

      <View style={styles.sendBox}>
        <TextInput style={styles.input} placeholder="رقم المستلم" placeholderTextColor="#666"
          value={sendTo} onChangeText={setSendTo} />
        <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="نص الرسالة" placeholderTextColor="#666"
          value={sendText} onChangeText={setSendText} multiline />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>إرسال</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={msgList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.from}>{item.fromName || item.from}</Text>
            <Text style={styles.text}>{item.text}</Text>
            {item.replyPending && (
              <TouchableOpacity style={styles.btn} onPress={() => handleApprove(item._id)}>
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
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  sendBox: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, marginBottom: 15 },
  input: { backgroundColor: '#16213e', color: '#fff', padding: 12, borderRadius: 6, marginBottom: 10 },
  sendBtn: { backgroundColor: '#25D366', padding: 12, borderRadius: 6, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, marginBottom: 10 },
  from: { color: '#25D366', fontWeight: 'bold' },
  text: { color: '#aaa', fontSize: 14, marginVertical: 5 },
  btn: { backgroundColor: '#4caf50', padding: 8, borderRadius: 6, alignSelf: 'flex-start', marginTop: 5 },
  btnText: { color: '#fff', fontSize: 13 },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 },
});

export default WhatsAppScreen;
