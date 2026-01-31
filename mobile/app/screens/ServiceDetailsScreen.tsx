import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import api from '../lib/api';

const ServiceDetailsScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const [providerService, setProviderService] = useState<any>(service);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch latest provider service details by ID
    const fetchProviderService = async () => {
      setLoading(true);
      setError('');
      try {
        // service._id is the ProviderService ID
        const res = await api.get(`/providers/${service.provider?._id || service.providerId}/services`);
        // Find the matching service by _id
        const found = (res.data || []).find((s: any) => s._id === service._id);
        if (found) setProviderService({ ...service, ...found });
      } catch (err) {
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    if (service.provider?._id || service.providerId) fetchProviderService();
  }, [service]);

  if (loading) return <ActivityIndicator size="large" color="#ec4899" style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {providerService.thumbnail ? (
        <Image source={{ uri: providerService.thumbnail }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}><Text>No Image</Text></View>
      )}
      <View style={styles.infoBox}>
        <Text style={styles.title}>{providerService.customName || providerService.serviceName || providerService.serviceId?.name || 'Service'}</Text>
        <TouchableOpacity style={styles.providerRow} activeOpacity={0.7} onPress={() => {
          if (providerService.provider?._id) {
            navigation.navigate('ProviderDetail', { providerId: providerService.provider._id });
          }
        }}>
          {providerService.provider?.avatar ? (
            <Image source={{ uri: providerService.provider.avatar }} style={styles.providerAvatar} />
          ) : null}
          <Text style={styles.providerName}>{providerService.provider?.profileName || providerService.provider?.name || ''}</Text>
        </TouchableOpacity>
        {providerService.description ? (
          <Text style={styles.desc}>{providerService.description}</Text>
        ) : null}
        <View style={{ marginTop: 10 }}>
          {providerService.price !== undefined && (
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Price:</Text> Rs {providerService.price}</Text>
          )}
          {providerService.durationMin !== undefined && (
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Duration:</Text> {providerService.durationMin} min</Text>
          )}
          {providerService.homeService !== undefined && (
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Home Service:</Text> {providerService.homeService ? 'Yes' : 'No'}</Text>
          )}
          {providerService.salonVisit !== undefined && (
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Salon Visit:</Text> {providerService.salonVisit ? 'Yes' : 'No'}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => {
          // Go to BookingScreen with this service pre-selected
          navigation.navigate('Booking', {
            providerId: providerService.provider?._id || providerService.providerId,
            providerName: providerService.provider?.profileName || providerService.provider?.name || '',
            preselectedService: providerService
          });
        }}
      >
        <Text style={styles.bookBtnText}>Book Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    detailRow: {
      fontSize: 15,
      color: '#444',
      marginTop: 2,
    },
    detailLabel: {
      fontWeight: 'bold',
      color: '#ec4899',
    },
  container: { alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 36,
    resizeMode: 'cover',
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    alignSelf: 'center',
  },
  infoBox: { width: '100%', backgroundColor: '#f9f9f9', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ec4899', marginBottom: 8 },
  providerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  providerAvatar: { width: 22, height: 22, borderRadius: 11, marginRight: 8, backgroundColor: '#eee' },
  providerName: { fontSize: 15, color: '#888', fontStyle: 'italic' },
  desc: { fontSize: 15, color: '#444', marginTop: 6 },
  bookBtn: { backgroundColor: '#ec4899', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center', marginTop: 10 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});

export default ServiceDetailsScreen;
