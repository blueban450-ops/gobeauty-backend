import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Sukkur'
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

export default function ProviderProfileScreen() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const navigation = useNavigation();

  // ...existing code...

  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: async () => (await api.get('/providers/me/profile')).data
  });

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    phone: '',
    city: '',
    addressLine: '',
    homeService: false,
    salonVisit: false,
    workingHours: '',
    experience: '',
    specialization: '',
    instagram: '',
    facebook: '',
  });

  // ...existing code...

  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Time picker states for working hours
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Helper to parse existing time string or default to 9 AM / 5 PM
  const parseTime = (timeStr: string, isEnd = false) => {
    const date = new Date();
    if (!timeStr) {
      date.setHours(isEnd ? 17 : 9, 0, 0, 0); // Default 9 AM or 5 PM
      return date;
    }
    try {
      const parts = timeStr.split(' - ');
      const timePart = isEnd ? parts[1] : parts[0];
      if (!timePart) throw new Error();
      const [time, modifier] = timePart.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    } catch (e) {
      date.setHours(isEnd ? 17 : 9, 0, 0, 0);
    }
    return date;
  };

  // Format time as 9:00 AM
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const endTime = parseTime(form.workingHours, true);
      const newString = `${formatTime(selectedDate)} - ${formatTime(endTime)}`;
      setForm({ ...form, workingHours: newString });
      if (Platform.OS === 'android') setShowStartPicker(false);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const startTime = parseTime(form.workingHours, false);
      const newString = `${formatTime(startTime)} - ${formatTime(selectedDate)}`;
      setForm({ ...form, workingHours: newString });
      if (Platform.OS === 'android') setShowEndPicker(false);
    }
  };


  // ...existing code...

  React.useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        description: profile.description || '',
        phone: profile.phone || '',
        city: profile.city || '',
        addressLine: profile.addressLine || '',
        homeService: !!profile.homeService,
        salonVisit: !!profile.salonVisit,
        workingHours: profile.workingHours || '',
        experience: profile.experience || '',
        specialization: profile.specialization || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
      });
      // ...existing code...
      setAvatar(profile.avatar || null);
      setCoverImage(profile.coverImage || null);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch('/providers/me', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      Alert.alert('Success', 'Profile updated successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    }
  });

  const pickImage = async (type: 'avatar' | 'cover') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadImage(result.assets[0].uri, type);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string, type: 'avatar' | 'cover') => {
    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
      } else {
        setUploadingCover(true);
      }

      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /(\.\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: fileType,
      } as any);

      const endpoint = type === 'avatar' ? '/providers/me/avatar' : '/providers/me/cover';
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (type === 'avatar') {
        setAvatar(response.data.avatarUrl);
        // Just invalidate queries to refresh everywhere (no navigation)
      } else {
        setCoverImage(response.data.coverUrl);
      }

      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload image');
    } finally {
      if (type === 'avatar') {
        setUploadingAvatar(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.city) {
      Alert.alert('Error', 'Business name, phone, and city are required');
      return;
    }
    updateMutation.mutate(form);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirm',
      'Kya aap logout karna chahte ho?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive'
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Cover Image */}
      <View style={styles.coverContainer}>
        <TouchableOpacity
          style={styles.coverImageContainer}
          onPress={() => pickImage('cover')}
          activeOpacity={0.8}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="images" size={40} color="#cbd5e1" />
              <Text style={styles.coverPlaceholderText}>Add Cover Photo</Text>
            </View>
          )}
          {uploadingCover && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <View style={styles.coverEditBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Profile Picture */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => pickImage('avatar')}
          activeOpacity={0.8}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#94a3b8" />
            </View>
          )}
          {uploadingAvatar && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Verification Status */}
      {!profile?.isVerified && (
        <View style={styles.statusBanner}>
          <Ionicons name="alert-circle" size={20} color="#f59e0b" />
          <Text style={styles.statusText}>Pending admin verification</Text>
        </View>
      )}

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="storefront" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholder="Your salon/business name"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>About Your Business</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder="Tell customers about your services, expertise..."
              placeholderTextColor="#cbd5e1"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialization</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="color-palette" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.specialization}
              onChangeText={(v) => setForm({ ...form, specialization: v })}
              placeholder="e.g., Bridal Makeup, Hair Styling"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Experience</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="star" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.experience}
              onChangeText={(v) => setForm({ ...form, experience: v })}
              placeholder="e.g., 5+ years"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              placeholder="03XX-XXXXXXX"
              placeholderTextColor="#cbd5e1"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <Ionicons name="location" size={18} color="#94a3b8" style={styles.inputIcon} />
            <Text style={[styles.input, !form.city && styles.placeholderText]}>
              {form.city || 'Select your city'}
            </Text>
            <Ionicons
              name={showCityDropdown ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#94a3b8"
            />
          </TouchableOpacity>

          {showCityDropdown && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll}>
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setForm({ ...form, city });
                      setShowCityDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, form.city === city && styles.dropdownItemTextActive]}>
                      {city}
                    </Text>
                    {form.city === city && (
                      <Ionicons name="checkmark" size={18} color="#ec4899" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Address</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.addressLine}
              onChangeText={(v) => setForm({ ...form, addressLine: v })}
              placeholder="Complete address with landmarks"
              placeholderTextColor="#cbd5e1"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Working Hours</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={form.workingHours}
              onChangeText={(v) => setForm({ ...form, workingHours: v })}
              placeholder="e.g. 9:00 AM - 6:00 PM"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>


      </View>

      {/* Service Modes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Availability</Text>
        <View style={styles.serviceModesContainer}>
          <TouchableOpacity
            style={[styles.serviceModeCard, form.homeService && styles.serviceModeCardActive]}
            onPress={() => setForm({ ...form, homeService: !form.homeService })}
          >
            <View style={[styles.serviceModeIcon, form.homeService && styles.serviceModeIconActive]}>
              <Ionicons name="home" size={24} color={form.homeService ? '#fff' : '#ec4899'} />
            </View>
            <Text style={[styles.serviceModeTitle, form.homeService && styles.serviceModeTitleActive]}>
              Home Service
            </Text>
            <Text style={styles.serviceModeDesc}>Visit customers at their location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serviceModeCard, form.salonVisit && styles.serviceModeCardActive]}
            onPress={() => setForm({ ...form, salonVisit: !form.salonVisit })}
          >
            <View style={[styles.serviceModeIcon, form.salonVisit && styles.serviceModeIconActive]}>
              <Ionicons name="business" size={24} color={form.salonVisit ? '#fff' : '#ec4899'} />
            </View>
            <Text style={[styles.serviceModeTitle, form.salonVisit && styles.serviceModeTitleActive]}>
              Salon Visit
            </Text>
            <Text style={styles.serviceModeDesc}>Customers visit your salon</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Media (Optional)</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instagram</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="logo-instagram" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.instagram}
              onChangeText={(v) => setForm({ ...form, instagram: v })}
              placeholder="@username"
              placeholderTextColor="#cbd5e1"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Facebook</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="logo-facebook" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.facebook}
              onChangeText={(v) => setForm({ ...form, facebook: v })}
              placeholder="facebook.com/yourpage"
              placeholderTextColor="#cbd5e1"
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, updateMutation.isPending && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fa', // Soft off-white for modern look
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  coverContainer: {
    position: 'relative',
    height: 180,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  coverImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#e2e8f0',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245,245,255,0.7)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // blur effect not supported in RN StyleSheet, use expo-blur if needed
  },
  coverPlaceholderText: {
    marginTop: 8,
    fontSize: 15,
    color: '#b0b0c3',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 24,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    // Glowing effect
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ec4899',
    backgroundColor: '#fff',
    // Extra glow for iOS/Android (if supported)
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ec4899',
    // Glowing effect for placeholder too
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 14,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 50,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginHorizontal: 12,
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,245,255,0.7)',
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 14,
    minHeight: 48,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  placeholderText: {
    color: '#cbd5e1',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
  },
  dropdownItemTextActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  serviceModesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceModeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  serviceModeCardActive: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  serviceModeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fdf2f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceModeIconActive: {
    backgroundColor: '#ec4899',
  },
  serviceModeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  serviceModeTitleActive: {
    color: '#ec4899',
  },
  serviceModeDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'linear-gradient(90deg, #ec4899 0%, #a78bfa 100%)', // not supported in RN
    backgroundColor: '#ec4899',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,0,0,0.06)',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  }
});
