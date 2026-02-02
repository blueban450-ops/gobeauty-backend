import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../lib/api';

const initialForm = {
  categoryName: '',
  serviceId: '',
  customName: '',
  price: '',
  durationMin: '',
  description: '',
  homeService: false,
  salonVisit: false,
  imageFile: null,
  isActive: true,
};

const ProviderServiceManageScreen = () => {
  const [categories, setCategories] = useState([]);
  const [baseServices, setBaseServices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, baseRes, svcRes] = await Promise.all([
          api.get('/categories'),
          api.get('/services'),
          api.get('/providers/me/services'),
        ]);
        setCategories(catRes.data);
        setBaseServices(baseRes.data);
        setServices(svcRes.data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load data');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleAdd = () => {
    setForm(initialForm);
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (idx) => {
    setForm(services[idx]);
    setEditMode(true);
    setEditIndex(idx);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.categoryName || !form.serviceId || !form.customName || !form.price || !form.durationMin) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setUploading(true);
    try {
      let res;
      if (editMode) {
        res = await api.patch(`/providers/me/services/${services[editIndex]._id}`, {
          serviceId: form.serviceId,
          customName: form.customName,
          price: form.price,
          durationMin: form.durationMin,
          description: form.description,
          homeService: form.homeService,
          salonVisit: form.salonVisit,
          isActive: form.isActive,
        });
      } else {
        res = await api.post('/providers/me/services', {
          serviceId: form.serviceId,
          customName: form.customName,
          price: form.price,
          durationMin: form.durationMin,
          description: form.description,
          homeService: form.homeService,
          salonVisit: form.salonVisit,
          isActive: form.isActive,
        });
      }
      // Image upload
      if (form.imageFile && res.data._id) {
        const data = new FormData();
        data.append('image', {
          uri: form.imageFile.uri,
          type: 'image/jpeg',
          name: form.imageFile.fileName || 'thumbnail.jpg',
        });
        try {
          const imgRes = await api.post(`/providers/me/services/${res.data._id}/thumbnail`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('Image upload response:', imgRes.data);
        } catch (imgErr) {
          console.log('Image upload error:', imgErr);
          Alert.alert('Error', imgErr?.response?.data?.message || 'Image upload failed');
        }
      }
      // Refresh
      const svcRes = await api.get('/providers/me/services');
      setServices(svcRes.data);
      setShowForm(false);
    } catch (err) {
      console.log('Service save error:', err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save service');
    }
    setUploading(false);
  };

  const handleDelete = (idx) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/providers/me/services/${services[idx]._id}`);
            const svcRes = await api.get('/providers/me/services');
            setServices(svcRes.data);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete service');
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3], // vertical portrait
      quality: 1,
    });
    console.log('ImagePicker result:', result);
    if (!result.canceled) {
      // If result.assets exists, use result.assets[0], else use result
      const asset = result.assets ? result.assets[0] : result;
      console.log('Selected image asset:', asset);
      setForm((f) => ({ ...f, imageFile: asset }));
    } else {
      console.log('Image selection canceled');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Provider Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={{ color: '#fff', fontSize: 28 }}>+</Text>
        </TouchableOpacity>
      </View>
      {/* Service List */}
      <ScrollView style={styles.listContainer}>
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No services added yet.</Text>
          </View>
        ) : (
          services.map((service, idx) => (
            <View key={service._id || idx} style={styles.serviceCardVertical}>
              {service.thumbnail ? (
                <Image source={{ uri: service.thumbnail }} style={{ width: 120, height: 180, borderRadius: 12 }} />
              ) : (
                <View style={styles.serviceThumbnailPlaceholderVertical}>
                  <Text>Image</Text>
                </View>
              )}
              <View style={styles.serviceContentVertical}>
                <View style={styles.serviceHeaderVertical}>
                  <View>
                    <Text style={styles.serviceName}>{service.customName || service.serviceId?.name}</Text>
                    <Text style={styles.serviceCategory}>
                      {categories.find(
                        (c) => c._id === (service.serviceId?.categoryId?._id || service.categoryName)
                      )?.name || ''}
                    </Text>
                  </View>
                  <View style={styles.serviceActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(idx)}>
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(idx)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailText}>Price:</Text>
                    <Text>{service.price}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailText}>Duration:</Text>
                    <Text>{service.durationMin} min</Text>
                  </View>
                </View>
                <View style={styles.badgeRow}>
                  {service.homeService && (
                    <View style={[styles.badge, styles.badgePrimary]}>
                      <Text style={styles.badgeText}>Home</Text>
                    </View>
                  )}
                  {service.salonVisit && (
                    <View style={[styles.badge, styles.badgeInfo]}>
                      <Text style={styles.badgeText}>Salon</Text>
                    </View>
                  )}
                  <View style={[styles.badge, service.isActive ? styles.badgePrimary : styles.badgeWarning]}>
                    <Text style={styles.badgeText}>{service.isActive ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {/* Modal Form */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>{editMode ? 'Edit Service' : 'Add Service'}</Text>
              {/* Category Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryBtn,
                      form.categoryName === cat._id && styles.categoryBtnActive,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, categoryName: cat._id }))}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        form.categoryName === cat._id && styles.categoryBtnTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Base Service Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {baseServices
                  .filter((bs) => !form.categoryName || bs.categoryId?._id === form.categoryName)
                  .map((bs) => (
                    <TouchableOpacity
                      key={bs._id}
                      style={[
                        styles.categoryBtn,
                        form.serviceId === bs._id && styles.categoryBtnActive,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, serviceId: bs._id }))}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
                          form.serviceId === bs._id && styles.categoryBtnTextActive,
                        ]}
                      >
                        {bs.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
              {/* Form Inputs */}
              <TextInput
                style={styles.input}
                placeholder="Custom Name"
                value={form.customName}
                onChangeText={(text) => setForm((f) => ({ ...f, customName: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={form.price}
                onChangeText={(text) => setForm((f) => ({ ...f, price: text }))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Duration (min)"
                value={form.durationMin}
                onChangeText={(text) => setForm((f) => ({ ...f, durationMin: text }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                value={form.description}
                onChangeText={(text) => setForm((f) => ({ ...f, description: text }))}
                multiline
              />
              {/* Toggles */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleButton, form.homeService && styles.toggleButtonActive]}
                  onPress={() => setForm((f) => ({ ...f, homeService: !f.homeService }))}
                >
                  <Text style={[styles.toggleLabel, form.homeService && styles.toggleLabelActive]}>
                    Home Service
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, form.salonVisit && styles.toggleButtonActive]}
                  onPress={() => setForm((f) => ({ ...f, salonVisit: !f.salonVisit }))}
                >
                  <Text style={[styles.toggleLabel, form.salonVisit && styles.toggleLabelActive]}>
                    Salon Visit
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Image Picker */}
              <TouchableOpacity style={styles.thumbnailPicker} onPress={pickImage}>
                {form.imageFile ? (
                  <Image source={{ uri: form.imageFile.uri }} style={styles.thumbnailPreview} />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <Text style={{ color: '#94a3b8' }}>Pick Image</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Active Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleButton, form.isActive && styles.toggleButtonActive]}
                  onPress={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                >
                  <Text style={[styles.toggleLabel, form.isActive && styles.toggleLabelActive]}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Save/Cancel Buttons */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSave}
                disabled={uploading}
              >
                <Text style={styles.primaryButtonText}>
                  {uploading ? 'Saving...' : editMode ? 'Save Changes' : 'Add Service'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowForm(false)}
                disabled={uploading}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94a3b8' },
  serviceCardVertical: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    alignItems: 'center',
    elevation: 2,
  },
  serviceThumbnailVertical: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#f1f5f9',
  },
  serviceThumbnailPlaceholderVertical: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceContentVertical: { flex: 1, padding: 16 },
  serviceHeaderVertical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  serviceCategory: { fontSize: 12, color: '#64748b', marginTop: 2 },
  serviceActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDescription: { fontSize: 14, color: '#64748b', marginBottom: 12, lineHeight: 20 },
  serviceDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgePrimary: { backgroundColor: '#f3e8ff' },
  badgeInfo: { backgroundColor: '#dbeafe' },
  badgeWarning: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#ec4899',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#475569', fontSize: 16, fontWeight: '600' },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  categoryBtnActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  categoryBtnText: { color: '#64748b', fontWeight: '600' },
  categoryBtnTextActive: { color: '#fff' },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    gap: 8,
  },
  toggleButtonActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  toggleLabelActive: { color: '#fff' },
  thumbnailPicker: {
    width: 100,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  thumbnailPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

export default ProviderServiceManageScreen;