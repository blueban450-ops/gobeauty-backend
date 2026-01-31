import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import SearchBar from '../components/SearchBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

// --- Type Definitions ---
type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetails: { service: any };
  Search: undefined;
  ProviderDetail: { providerId: string }; // Parameter needed here
  Booking: { providerId: string; providerName: string; preselectedService: any };
  BookingConfirm: undefined;
};

// --- Component: Service Card ---
const ServiceCard = ({ service, onPress, onProviderPress }: { service: any, onPress: () => void, onProviderPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    {service.thumbnail ? (
      <Image source={{ uri: service.thumbnail }} style={styles.thumbnailVertical} />
    ) : (
      <View style={styles.thumbnailPlaceholder}><Text>No Image</Text></View>
    )}
    <View style={styles.providerInfoInline}>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onProviderPress} activeOpacity={0.7}>
        {service.provider?.avatar ? (
          <Image source={{ uri: service.provider.avatar }} style={styles.providerAvatarSmall} />
        ) : null}
        <Text style={styles.byProviderSmall} numberOfLines={1}>
          {service.provider?.profileName || service.provider?.name || 'Unknown Provider'}
        </Text>
      </TouchableOpacity>
    </View>
    <View style={styles.caption}>
      <Text style={styles.serviceName} numberOfLines={1}>{service.customName || service.serviceId?.name || 'Service'}</Text>
    </View>
  </TouchableOpacity>
);

// --- Main Screen ---
const HomeScreen = () => {
  const [error, setError] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const canGoBack = navigation.canGoBack && navigation.canGoBack();

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const res = await api.get('/categories');
        setCategories(Array.isArray(res.data) ? res.data : res.data?.categories || []);
      } catch (e) {
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/providers');
        
        // Flatten services
        const allServices = (res.data.providers || []).flatMap((provider: any) => {
          return (provider.services || []).map((service: any) => ({
            ...service,
            provider: {
              _id: provider._id,
              name: provider.name,
              city: provider.city,
              profileName: provider.ownerUserId?.fullName || '',
              avatar: provider.avatar || ''
            },
            price: service.price,
            durationMin: service.durationMin,
            description: service.description,
            thumbnail: service.thumbnail,
            customName: service.customName,
            serviceName: service.customName || service.serviceId?.name || '',
            serviceId: service.serviceId,
            _id: service._id,
            homeService: service.homeService,
            salonVisit: service.salonVisit
          }));
        });
        setServices(allServices);
      } catch (err) {
        setError('Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filter Logic
  const filtered = services.filter(service => {
    const name = service.customName || service.serviceId?.name || '';
    let serviceCategoryId = null;

    if (service.category) {
      serviceCategoryId = service.category;
    } else if (service.serviceId && typeof service.serviceId === 'object') {
      serviceCategoryId = service.serviceId.categoryId || service.serviceId._id;
    } else if (service.serviceId) {
      serviceCategoryId = service.serviceId;
    }

    // Category Filter
    let matchCategory = true;
    if (selectedCategory) {
      matchCategory = (String(serviceCategoryId) === String(selectedCategory));
      
      // Fuzzy Match Fallback
      if (!matchCategory) {
        const catObj = categories.find((c) => String(c._id) === String(selectedCategory));
        const selectedCategoryName = catObj ? (catObj.name || '').toLowerCase() : '';
        
        if (selectedCategoryName) {
           const serviceNames = [
            name,
            service.serviceId?.name,
            service.serviceId?.categoryName,
            service.categoryName
          ].filter(Boolean).map(s => String(s).toLowerCase());
          matchCategory = serviceNames.some(n => n.includes(selectedCategoryName));
        }
      }
    }
    
    return name.toLowerCase().includes(search.toLowerCase()) && matchCategory;
  });

  return (
    <View style={styles.bgGradient}>
      {loading ? (
        <ActivityIndicator size="large" color="#6b7280" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.empty, { color: 'red' }]}>Error: {error}</Text>
      ) : (
        <FlatList
          data={filtered.map((item, i) => ({ ...item, key: `service-${i}` }))}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => {
                navigation.navigate('Booking', {
                  providerId: item.provider?._id || item.providerId,
                  providerName: item.provider?.profileName || item.provider?.name || '',
                  preselectedService: item
                });
              }}
              onProviderPress={() => {
                if (item.provider?._id) {
                  navigation.navigate('ProviderDetail', { providerId: item.provider._id });
                } else {
                  Alert.alert('Provider not found', 'No provider profile available.');
                }
              }}
            />
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Back Button */}
              {canGoBack && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
              {/* Search Bar */}
              <View style={{ marginTop: 48, marginBottom: 0, marginHorizontal: 20 }}>
                <SearchBar
                  placeholder="Search services..."
                  onDebouncedChange={setSearch}
                />
              </View>
              {/* Categories horizontal scroll - pill style, always at top */}
              {!catLoading && categories.length > 0 && (
                <View style={{ marginTop: 16, marginBottom: 0 }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 4 }}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10, minHeight: 44, alignItems: 'center' }}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedCategory('')}
                      style={[styles.categoryPillGlass, !selectedCategory && styles.categoryPillActiveGlass]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.categoryPillText, !selectedCategory && styles.categoryPillTextActive]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {categories.map((cat: any) => (
                      <TouchableOpacity
                        key={cat._id}
                        onPress={() => setSelectedCategory(cat._id)}
                        style={[styles.categoryPillGlass, selectedCategory === cat._id && styles.categoryPillActiveGlass]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[styles.categoryPillText, selectedCategory === cat._id && styles.categoryPillTextActive]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {cat.name ? String(cat.name) : 'Unnamed'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          }
          ListEmptyComponent={<Text style={styles.empty}>No services found.</Text>}
        />
      )}
    </View>
  );
};

// Update styles for pill categories
const styles = StyleSheet.create({
  bgGradient: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f3f4f6',
    // iOS style soft gradient (for real, use expo-linear-gradient)
  },
  searchBarGlass: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    marginBottom: 18,
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: '#ec4899',
    height: 48,
    justifyContent: 'center',
    shadowColor: '#ec4899',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  searchBeautiful: {
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingLeft: 18,
    paddingRight: 44,
    borderRadius: 22,
    fontWeight: '400',
    letterSpacing: 0.2,
    height: 48,
  },
  searchIconAbsolute: {
    position: 'absolute',
    right: 18,
    top: 13,
    zIndex: 2,
  },
  searchIconBox: { display: 'none' },
  searchIcon: { display: 'none' },
  card: {
    flex: 1,
    aspectRatio: 110/190,
    marginHorizontal: 8,
    marginVertical: 18,
    backgroundColor: 'transparent',
    padding: 0,
    minWidth: 0,
    maxWidth: '48%',
    borderRadius: 0,
    marginBottom: 22,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  serviceName: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  caption: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 2,
    height: 60,
    width: '100%',
    marginBottom: 10,
  },
  thumbnailVertical: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    resizeMode: 'cover',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    shadowColor: '#6b7280',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  thumbnailPlaceholder: {
    width: '100%',
    aspectRatio: 110/170,
    borderRadius: 18,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  byProviderSmall: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'left',
    marginLeft: 2,
    flex: 1,
  },
  providerInfoInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
    minHeight: 18,
    marginLeft: 2,
  },
  providerAvatarSmall: {
    width: 16,
    height: 16,
    borderRadius: 0,
    marginRight: 4,
    backgroundColor: '#eee',
  },
  // Glassmorphism/gradient pills
  categoryPillGlass: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(107,114,128,0.10)',
    minWidth: 50,
    maxWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    shadowColor: '#6b7280',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryPillActiveGlass: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryPillText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  categoryPillTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 18,
    left: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 8,
    shadowColor: '#6b7280',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
});

export default HomeScreen;