import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { telegram } from '../services/api';

function TelegramScreen() {
  const [msgList, setMsgList] = useState([]);

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    try {
      const { data } = await telegram.messages({ limit: 50 });
      setMsgList(data.messages);
    } catch {}
  };

  const handleApprove = async (id) => {
    try {
      await telegram.approve(id, {});
      Alert.alert('تم', 'تم إرسال الرد');
      loadMessages();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✈️ تليجرام</Text>

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
  card: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, marginBottom: 10 },
  from: { color: '#0088cc', fontWeight: 'bold' },
  text: { color: '#aaa', fontSize: 14, marginVertical: 5 },
  btn: { backgroundColor: '#4caf50', padding: 8, borderRadius: 6, alignSelf: 'flex-start', marginTop: 5 },
  btnText: { color: '#fff', fontSize: 13 },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 },
});

export default TelegramScreen;
