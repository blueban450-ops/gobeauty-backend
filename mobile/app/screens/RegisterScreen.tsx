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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';

// Pakistan ki 3 cities aur France ki cities ki list
const CITIES_LIST = [
  "Karachi", "Lahore", "Islamabad", // Pakistan
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier" // France
];

interface RegisterScreenProps {
  userType: 'CUSTOMER' | 'PROVIDER';
  onBack: () => void;
  onRegistered: (user: any) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  userType,
  onBack,
  onRegistered,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Professional fields
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const validateEmail = (e: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(e);
  };

  const handleRegisterStep1 = () => {
    setError('');
    if (!name.trim()) return setError('Name is required');
    if (!email.trim() || !validateEmail(email)) return setError('Invalid email format');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!phone.trim()) return setError('Phone number is required');

    setStep(2);
  };

  const handleRegister = async () => {
    setError('');
    if (userType === 'PROVIDER') {
      if (!businessName.trim()) return setError('Business name is required');
      if (!city) return setError('Please select a city');
      if (!address.trim()) return setError('Address is required');
    }
    if (!agreeTerms) return setError('Please agree to terms and conditions');

    setLoading(true);
    try {
      const payload = {
        fullName: name,
        email,
        password,
        phone,
        role: userType,
        ...(userType === 'PROVIDER' && { businessName, city, address, description }),
      };

      const { data } = await api.post('/auth/register', payload);
      Alert.alert('Success', 'Account created successfully!');
      onRegistered(data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // City filtering logic
  const filteredCities = CITIES_LIST.filter(c => 
    c.toLowerCase().startsWith(city.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={step === 1 ? onBack : () => setStep(1)}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>{step === 1 ? 'Create Account' : (userType === 'CUSTOMER' ? 'Confirm Account' : 'Business Details')}</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? (userType === 'CUSTOMER' ? 'As a Customer' : 'As a Professional') : (userType === 'CUSTOMER' ? 'Review your info' : 'Business details')}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.step, styles.stepActive]}><Text style={styles.stepText}>1</Text></View>
          <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
          <View style={[styles.step, step === 2 && styles.stepActive]}><Text style={styles.stepText}>2</Text></View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {step === 1 ? (
            <>
              {/* Step 1 Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={18} color="#94a3b8" />
                  <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={18} color="#94a3b8" />
                  <TextInput style={styles.input} placeholder="email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={18} color="#94a3b8" />
                  <TextInput style={styles.input} placeholder="+92..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="key" size={18} color="#94a3b8" />
                  <TextInput style={styles.input} placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="key" size={18} color="#94a3b8" />
                  <TextInput style={styles.input} placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                </View>
              </View>

              <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleRegisterStep1}>
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Step 2 Fields */}
              {userType === 'PROVIDER' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Business Name</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="business" size={18} color="#94a3b8" />
                      <TextInput style={styles.input} placeholder="Salon Name" value={businessName} onChangeText={setBusinessName} />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>City</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location" size={18} color="#94a3b8" />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Search city (e.g. Lahore)" 
                        value={city} 
                        onChangeText={(text) => {
                            setCity(text);
                            setShowCityDropdown(text.length > 0);
                        }} 
                      />
                    </View>
                    {showCityDropdown && filteredCities.length > 0 && (
                      <View style={styles.dropdown}>
                        <ScrollView style={{maxHeight: 150}} keyboardShouldPersistTaps="handled">
                          {filteredCities.map(c => (
                            <TouchableOpacity 
                              key={c} 
                              style={styles.dropdownItem} 
                              onPress={() => { 
                                setCity(c); 
                                setShowCityDropdown(false); 
                              }}
                            >
                              <Text style={styles.dropdownItemText}>{c}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <View style={[styles.inputContainer, {height: 80, alignItems: 'flex-start', paddingTop: 10}]}>
                      <TextInput 
                        style={[styles.input, {textAlignVertical: 'top'}]} 
                        placeholder="Complete Address" 
                        value={address} 
                        onChangeText={setAddress} 
                        multiline 
                      />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.confirmBox}>
                  <Ionicons name="person-circle" size={60} color="#ec4899" />
                  <Text style={styles.confirmTitle}>{name}</Text>
                  <Text style={styles.confirmSubtitle}>{email}</Text>
                  <Text style={styles.confirmSubtitle}>{phone}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.checkbox} onPress={() => setAgreeTerms(!agreeTerms)}>
                <View style={[styles.checkboxBox, agreeTerms && styles.checkboxBoxChecked]}>
                  {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>I agree to Terms & Conditions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]} 
                onPress={handleRegister} 
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create Account</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  step: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  stepActive: { backgroundColor: '#ec4899' },
  stepText: { color: 'white', fontWeight: '700' },
  stepLine: { width: 40, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 10 },
  stepLineActive: { backgroundColor: '#ec4899' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 12, borderRadius: 10, marginHorizontal: 20, marginBottom: 20 },
  errorText: { color: '#dc2626', fontSize: 13, marginLeft: 8, flex: 1 },
  form: { paddingHorizontal: 20, gap: 15 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, height: 50 },
  input: { flex: 1, fontSize: 15, color: '#1e293b', marginLeft: 10 },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 10 },
  buttonPrimary: { backgroundColor: '#ec4899' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  checkboxBox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  checkboxBoxChecked: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  checkboxLabel: { fontSize: 13, color: '#64748b' },
  confirmBox: { alignItems: 'center', padding: 25, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
  confirmSubtitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  dropdown: { backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  dropdownItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 14, color: '#334155' }
});