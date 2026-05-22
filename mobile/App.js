import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import DashboardScreen from './src/screens/DashboardScreen';
import EmailsScreen from './src/screens/EmailsScreen';
import TelegramScreen from './src/screens/TelegramScreen';
import WhatsAppScreen from './src/screens/WhatsAppScreen';
import TasksScreen from './src/screens/TasksScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#333' },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'الرئيسية', tabBarIcon: () => null }} />
      <Tab.Screen name="Emails" component={EmailsScreen} options={{ tabBarLabel: 'البريد', tabBarIcon: () => null }} />
      <Tab.Screen name="Telegram" component={TelegramScreen} options={{ tabBarLabel: 'تليجرام', tabBarIcon: () => null }} />
      <Tab.Screen name="WhatsApp" component={WhatsAppScreen} options={{ tabBarLabel: 'واتساب', tabBarIcon: () => null }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarLabel: 'المهام', tabBarIcon: () => null }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'الإعدادات', tabBarIcon: () => null }} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
