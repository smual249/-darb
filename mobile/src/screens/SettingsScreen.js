import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/api';

function SettingsScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('darb_user').then((u) => {
      if (u) {
        const user = JSON.parse(u);
        setName(user.name || '');
        setPhone(user.phone || '');
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      const { data } = await auth.update({ name, phone });
      await AsyncStorage.setItem('darb_user', JSON.stringify(data.user));
      Alert.alert('تم', 'تم حفظ الإعدادات');
    } catch {}
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('darb_token');
    await AsyncStorage.removeItem('darb_user');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ الإعدادات</Text>

      <View style={styles.section}>
        <Text style={styles.label}>الاسم</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#666" />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholderTextColor="#666" />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>حفظ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>تسجيل خروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 15 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 30, marginTop: 20 },
  section: { marginBottom: 15 },
  label: { color: '#888', marginBottom: 5 },
  input: { backgroundColor: '#16213e', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16 },
  saveBtn: { backgroundColor: '#4caf50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { backgroundColor: '#e94560', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default SettingsScreen;
