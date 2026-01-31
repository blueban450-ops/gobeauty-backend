import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image, 
  Platform, 
  ActivityIndicator,
  KeyboardAvoidingView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // FIXED: Missing import
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const CITIES_LIST = [
  'Lahore', 'Karachi', 'Islamabad',
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
];

const EditProfileScreen = ({ navigation }: any) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || user?.location || '');
  const [city, setCity] = useState(user?.city || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const displayAvatar = () => {
    if (!avatar) return null;
    if (avatar.startsWith('file://') || avatar.startsWith('http')) {
      return { uri: avatar };
    }
    const baseUrl = api.defaults.baseURL?.replace('/api', '');
    return { uri: `${baseUrl}${avatar}` };
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Required', 'Name and Email are mandatory.');
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('city', city);

      if (avatar && avatar.startsWith('file://')) {
        const fileName = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('avatar', {
          uri: avatar,
          name: fileName || 'profile.jpg',
          type: type,
        } as any);
      }

      const res = await api.put('/profile/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Backend returns data, we ensure frontend compatibility
      const updatedUser = { 
        ...user, 
        ...res.data.user, 
        name: res.data.user.fullName || res.data.user.name 
      };

      // Get current token safely
      let token = user?.token;
      if (!token) {
        token = await AsyncStorage.getItem('token') || '';
      }
      
      // Update global context
      await login(token, updatedUser);
      
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e: any) {
      console.error("Update Error:", e);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.9} style={styles.avatarWrapper}>
              {avatar ? (
                <Image source={displayAvatar()!} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#cbd5e1" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <InputField label="Full Name" icon="person-outline" value={name} onChangeText={setName} placeholder="Enter your name" />
            <InputField label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address" />
            <InputField label="Phone Number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="Enter phone" keyboardType="phone-pad" />
            <InputField label="Address" icon="location-outline" value={address} onChangeText={setAddress} placeholder="Enter address" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={20} color="#ec4899" />
                <TextInput
                  style={styles.input}
                  value={city}
                  placeholder="Select city"
                  onChangeText={(text) => {
                    setCity(text);
                    setShowCityDropdown(true);
                  }}
                />
              </View>
              {showCityDropdown && city.length > 0 && (
                <View style={styles.dropdown}>
                  {CITIES_LIST.filter(c => c.toLowerCase().includes(city.toLowerCase())).map(c => (
                    <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setCity(c); setShowCityDropdown(false); }}>
                      <Text style={styles.dropdownText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const InputField = ({ label, icon, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color="#ec4899" />
      <TextInput style={styles.input} placeholderTextColor="#94a3b8" {...props} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', padding: 3, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#ec4899', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
  formCard: { backgroundColor: 'white', borderRadius: 24, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  input: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1e293b', fontWeight: '500' },
  dropdown: { backgroundColor: 'white', borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: '#f1f5f9', elevation: 3 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownText: { fontSize: 14, color: '#475569' },
  saveBtn: { backgroundColor: '#ec4899', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 5 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
});

export default EditProfileScreen;