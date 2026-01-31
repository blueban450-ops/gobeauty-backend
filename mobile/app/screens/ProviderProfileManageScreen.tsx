import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Pakistan ki 3 cities + France cities
const CITIES_LIST = [
  "Karachi", "Lahore", "Islamabad",
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier"
];

interface FormData {
  name: string;
  description: string;
  phone: string;
  city: string;
  addressLine: string;
  homeService: boolean;
  salonVisit: boolean;
  workingHours: string;
  experience: string;
  specialization: string;
  instagram: string;
  facebook: string;
}

export default function ProviderProfileManageScreen() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  // API base URL helper
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return null;
    const apiBase = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
    if (url.startsWith('http')) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, apiBase);
    }
    if (url.startsWith('/')) return `${apiBase}${url}`;
    return url;
  };
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: async () => (await api.get('/providers/me/profile')).data
  });

  const [form, setForm] = useState<FormData>({
    name: '', description: '', phone: '', city: '', addressLine: '',
    homeService: false, salonVisit: false, workingHours: '09:00 AM - 05:00 PM',
    experience: '', specialization: '', instagram: '', facebook: '',
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Time Picker States
  const [pickerType, setPickerType] = useState<'start' | 'end' | null>(null);
  const [tempHour, setTempHour] = useState(9);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAMPM, setTempAMPM] = useState<'AM' | 'PM'>('AM');

  // Fix: Defining filteredCities properly
  const filteredCities = CITIES_LIST.filter(c => 
    c.toLowerCase().startsWith(form.city.toLowerCase())
  );

  const parseTimeString = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(' ')) return { hour: 9, minute: 0, ampm: 'AM' };
    const [time, ampm] = timeStr.split(' ');
    const [hourStr, minStr] = time.split(':');
    return { hour: parseInt(hourStr, 10), minute: parseInt(minStr, 10), ampm: ampm as any };
  };

  const formatTimeString = (hour: number, minute: number, ampm: string) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const openPicker = (type: 'start' | 'end') => {
    setPickerType(type);
    const timeStr = form.workingHours;
    const part = type === 'start' ? timeStr.split(' - ')[0] : (timeStr.split(' - ')[1] || '');
    const { hour, minute, ampm } = parseTimeString(part);
    setTempHour(hour);
    setTempMinute(minute);
    setTempAMPM(ampm);
  };

  const savePickerTime = () => {
    const formatted = formatTimeString(tempHour, tempMinute, tempAMPM);
    if (pickerType === 'start') {
      const endPart = form.workingHours.split(' - ')[1] || "05:00 PM";
      setForm({ ...form, workingHours: `${formatted} - ${endPart}` });
    } else {
      const startPart = form.workingHours.split(' - ')[0] || "09:00 AM";
      setForm({ ...form, workingHours: `${startPart} - ${formatted}` });
    }
    setPickerType(null);
  };

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '', description: profile.description || '',
        phone: profile.phone || '', city: profile.city || '',
        addressLine: profile.addressLine || '', homeService: !!profile.homeService,
        salonVisit: !!profile.salonVisit, workingHours: profile.workingHours || '09:00 AM - 05:00 PM',
        experience: profile.experience || '', specialization: profile.specialization || '',
        instagram: profile.instagram || '', facebook: profile.facebook || '',
      });
      setAvatar(normalizeImageUrl(profile.avatar));
      setCoverImage(normalizeImageUrl(profile.coverImage));
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => (await api.patch('/providers/me', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      Alert.alert('Success', 'Profile updated!');
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.error || 'Failed')
  });

  const pickImage = async (type: 'avatar' | 'cover') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
        uploadImage(result.assets[0].uri, type);
    }
  };

  const uploadImage = async (uri: string, type: 'avatar' | 'cover') => {
    try {
      type === 'avatar' ? setUploadingAvatar(true) : setUploadingCover(true);
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      formData.append('image', { 
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, 
        name: filename, 
        type: 'image/jpeg' 
      } as any);
      
      const response = await api.post(type === 'avatar' ? '/providers/me/avatar' : '/providers/me/cover', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      type === 'avatar' 
        ? setAvatar(normalizeImageUrl(response.data.avatarUrl)) 
        : setCoverImage(normalizeImageUrl(response.data.coverUrl));
        
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
    } catch (e) { 
      Alert.alert('Error', 'Upload failed'); 
    } finally { 
      type === 'avatar' ? setUploadingAvatar(false) : setUploadingCover(false); 
    }
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.city) return Alert.alert('Error', 'Required fields missing');
    updateMutation.mutate(form);
  };

  if (isLoading) return <ActivityIndicator style={{flex:1}} size="large" color="#ec4899" />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.coverContainer}>
        <TouchableOpacity style={styles.coverImageContainer} onPress={() => pickImage('cover')}>
          {coverImage ? <Image source={{ uri: coverImage }} style={styles.coverImage} /> : <View style={styles.coverPlaceholder}><Ionicons name="images" size={40} color="#cbd5e1" /><Text>Add Cover Photo</Text></View>}
          {uploadingCover && <View style={styles.uploadingOverlay}><ActivityIndicator color="#fff" /></View>}
          <View style={styles.coverEditBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => pickImage('avatar')}>
          {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={40} color="#94a3b8" /></View>}
          {uploadingAvatar && <View style={styles.uploadingOverlay}><ActivityIndicator color="#fff" /></View>}
          <View style={styles.avatarEditBadge}><Ionicons name="camera" size={14} color="#fff" /></View>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 50 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}><Text style={styles.label}>Business Name *</Text><View style={styles.inputContainer}><TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Salon Name" /></View></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Description</Text><View style={[styles.inputContainer, styles.textAreaContainer]}><TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} placeholder="About your business" /></View></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Specialization</Text><View style={styles.inputContainer}><TextInput style={styles.input} value={form.specialization} onChangeText={(v) => setForm({ ...form, specialization: v })} placeholder="e.g. Makeup" /></View></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Experience</Text><View style={styles.inputContainer}><TextInput style={styles.input} value={form.experience} onChangeText={(v) => setForm({ ...form, experience: v })} placeholder="e.g. 5 Years" /></View></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.inputGroup}><Text style={styles.label}>Phone *</Text><View style={styles.inputContainer}><TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" /></View></View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={form.city} placeholder="Search city" onChangeText={(t) => { setForm({...form, city: t}); setShowCityDropdown(t.length > 0); }} />
            </View>
            {showCityDropdown && filteredCities.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView style={{maxHeight: 150}} keyboardShouldPersistTaps="handled">
                  {filteredCities.map(c => (
                    <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setForm({...form, city: c}); setShowCityDropdown(false); }}>
                      <Text>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}><Text style={styles.label}>Full Address</Text><View style={[styles.inputContainer, styles.textAreaContainer]}><TextInput style={[styles.input, styles.textArea]} value={form.addressLine} onChangeText={(v) => setForm({ ...form, addressLine: v })} multiline numberOfLines={3} placeholder="Address" /></View></View>

          <Text style={styles.label}>Working Hours</Text>
          <View style={styles.timePickerRow}>
            <TouchableOpacity style={styles.timePickerButton} onPress={() => openPicker('start')}><Text style={styles.timePickerText}>{form.workingHours.split(' - ')[0] || 'Start'}</Text></TouchableOpacity>
            <Text>to</Text>
            <TouchableOpacity style={styles.timePickerButton} onPress={() => openPicker('end')}><Text style={styles.timePickerText}>{form.workingHours.split(' - ')[1] || 'End'}</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Availability</Text>
          <View style={styles.serviceModesContainer}>
            <TouchableOpacity style={[styles.serviceModeCard, form.homeService && styles.serviceModeCardActive]} onPress={() => setForm({ ...form, homeService: !form.homeService })}>
                <Ionicons name="home" size={24} color={form.homeService ? "#ec4899" : "#94a3b8"} />
                <Text style={{fontSize: 12, marginTop: 5}}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.serviceModeCard, form.salonVisit && styles.serviceModeCardActive]} onPress={() => setForm({ ...form, salonVisit: !form.salonVisit })}>
                <Ionicons name="business" size={24} color={form.salonVisit ? "#ec4899" : "#94a3b8"} />
                <Text style={{fontSize: 12, marginTop: 5}}>Salon</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <View style={styles.inputGroup}><Text style={styles.label}>Instagram</Text><View style={styles.inputContainer}><TextInput style={styles.input} value={form.instagram} onChangeText={(v) => setForm({ ...form, instagram: v })} placeholder="@username" /></View></View>
            <View style={styles.inputGroup}><Text style={styles.label}>Facebook</Text><View style={styles.inputContainer}><TextInput style={styles.input} value={form.facebook} onChangeText={(v) => setForm({ ...form, facebook: v })} placeholder="Facebook link" /></View></View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert('Logout', 'Are you sure?', [{text:'No'},{text:'Yes', onPress: logout}])}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {pickerType && (
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContainer}>
            <Text style={{fontWeight:'bold', marginBottom: 20}}>Select Time</Text>
            <View style={{flexDirection:'row', gap: 15, alignItems: 'center'}}>
                <TextInput keyboardType='numeric' value={tempHour.toString()} onChangeText={t => setTempHour(parseInt(t) || 1)} style={{borderBottomWidth:1, width: 30, textAlign:'center'}} />
                <Text>:</Text>
                <TextInput keyboardType='numeric' value={tempMinute.toString()} onChangeText={t => setTempMinute(parseInt(t) || 0)} style={{borderBottomWidth:1, width: 30, textAlign:'center'}} />
                <TouchableOpacity onPress={() => setTempAMPM(tempAMPM==='AM'?'PM':'AM')}><Text>{tempAMPM}</Text></TouchableOpacity>
            </View>
            <View style={{flexDirection:'row', gap: 20, marginTop: 25}}>
                <TouchableOpacity onPress={() => setPickerType(null)}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={savePickerTime}><Text style={{color:'#ec4899', fontWeight:'bold'}}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  coverContainer: { position: 'relative', height: 180 },
  coverImageContainer: { width: '100%', height: 180, backgroundColor: '#e2e8f0' },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { position: 'absolute', bottom: -40, left: 20, width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff', backgroundColor: '#fff' },
  avatar: { width: 92, height: 92, borderRadius: 46 },
  avatarPlaceholder: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 15, color: '#1e293b' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#475569' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, height: 48 },
  input: { flex: 1, fontSize: 14, color: '#1e293b' },
  textAreaContainer: { height: 100, alignItems: 'flex-start', paddingTop: 10 },
  textArea: { textAlignVertical: 'top' },
  dropdown: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 5 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timePickerButton: { flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ec4899' },
  timePickerText: { color: '#ec4899', fontWeight: 'bold' },
  serviceModesContainer: { flexDirection: 'row', gap: 15 },
  serviceModeCard: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center' },
  serviceModeCardActive: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  saveButton: { backgroundColor: '#ec4899', marginHorizontal: 16, marginTop: 25, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { marginTop: 15, marginHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center' },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold' },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: '#ec4899', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  coverEditBadge: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#ec4899', justifyContent: 'center', alignItems: 'center' },
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  customModalContainer: { backgroundColor: '#fff', padding: 25, borderRadius: 20, width: '80%', alignItems: 'center' },
});