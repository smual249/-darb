import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/api';

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data } = await auth.register({ name, email, password });
      await AsyncStorage.setItem('darb_token', data.token);
      await AsyncStorage.setItem('darb_user', JSON.stringify(data.user));
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('خطأ', error.response?.data?.error || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>درب</Text>
      <Text style={styles.subtitle}>سكرتير خاص فيك</Text>

      <TextInput style={styles.input} placeholder="الاسم" placeholderTextColor="#666"
        value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="البريد الإلكتروني" placeholderTextColor="#666"
        value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="كلمة المرور" placeholderTextColor="#666"
        value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'جاري...' : 'إنشاء حساب'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>لديك حساب؟ تسجيل دخول</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', padding: 20 },
  title: { color: '#e94560', fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#16213e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#e94560', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#e94560', textAlign: 'center', marginTop: 20 },
});

export default RegisterScreen;
