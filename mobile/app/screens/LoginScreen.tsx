import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { RegisterScreen } from './RegisterScreen';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const LoginScreen: React.FC<{ onLogin: (token: string, user: User) => void }> = ({ onLogin }) => {
  const [userType, setUserType] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const handleLogin = async () => {
    // English Alerts
    if (!email || !password) {
      Alert.alert('Required', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user.role !== userType) {
        Alert.alert('Access Denied', `This account is registered as a ${data.user.role}.`);
        setLoading(false);
        return;
      }
      onLogin(data.token, data.user);
    } catch (err: any) {
      console.log('LOGIN ERROR:', err, err.response?.data);
      Alert.alert('Error', err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (type: 'CUSTOMER' | 'PROVIDER') => {
    if (type === userType) return;
    setUserType(type);
    Animated.spring(flipAnimation, {
      toValue: type === 'PROVIDER' ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  if (showRegister) {
    return (
      <RegisterScreen
        userType={userType}
        onBack={() => setShowRegister(false)}
        onRegistered={(user) => {
          setShowRegister(false);
          setEmail(user.email);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.circleDecor} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <View style={styles.imageWrapper}>
              <Animated.View style={[styles.flipCard, { transform: [{ rotateY: frontInterpolate }] }]}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300' }} style={styles.headerImg} />
              </Animated.View>
              <Animated.View style={[styles.flipCard, styles.flipCardBack, { transform: [{ rotateY: backInterpolate }] }]}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300' }} style={styles.headerImg} />
              </Animated.View>
            </View>

            <Text style={styles.brandTitle}>GoBeauty<Text style={styles.pinkDot}>.</Text></Text>
            <Text style={styles.brandSubtitle}>Modern Beauty Experience</Text>
          </View>

          <View style={styles.switchContainer}>
            <TouchableOpacity onPress={() => toggleRole('CUSTOMER')} style={[styles.switchTab, userType === 'CUSTOMER' && styles.switchActive]}>
              <Text style={[styles.switchText, userType === 'CUSTOMER' && styles.switchTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleRole('PROVIDER')} style={[styles.switchTab, userType === 'PROVIDER' && styles.switchActive]}>
              <Text style={[styles.switchText, userType === 'PROVIDER' && styles.switchTextActive]}>Expert</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.authCard}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#ec4899" />
                <TextInput 
                  style={styles.textInput} 
                  placeholder="Enter your email" 
                  value={email} 
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#ec4899" />
                <TextInput 
                  style={styles.textInput} 
                  placeholder="Enter your password" 
                  value={password} 
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPass}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.signInBtn, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signInBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => setShowRegister(true)}>
                <Text style={styles.signUpLink}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  circleDecor: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#fdf2f8' },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 70, marginBottom: 25 },
  imageWrapper: { width: 90, height: 90, marginBottom: 15 },
  flipCard: { width: 90, height: 90, borderRadius: 30, backgroundColor: '#fff', backfaceVisibility: 'hidden', elevation: 8, shadowColor: '#ec4899', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 10, overflow: 'hidden' },
  flipCardBack: { position: 'absolute', top: 0 },
  headerImg: { width: '100%', height: '100%' },
  brandTitle: { fontSize: 32, fontWeight: '900', color: '#1e293b' },
  pinkDot: { color: '#ec4899' },
  brandSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },
  switchContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', marginHorizontal: 40, borderRadius: 18, padding: 5, marginBottom: 30 },
  switchTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 14 },
  switchActive: { backgroundColor: '#ffffff', elevation: 4, shadowOpacity: 0.1 },
  switchText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  switchTextActive: { color: '#ec4899' },
  authCard: { marginHorizontal: 25, padding: 25, borderRadius: 30, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  inputBox: { marginBottom: 18 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, height: 56, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  textInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  rememberMe: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  rememberText: { fontSize: 13, color: '#64748b' },
  forgotPass: { fontSize: 13, color: '#ec4899', fontWeight: '700' },
  signInBtn: { backgroundColor: '#ec4899', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  signInBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#64748b', fontSize: 14 },
  signUpLink: { color: '#ec4899', fontWeight: '800', fontSize: 14 }
});