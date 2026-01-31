import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../lib/api';

const styles = StyleSheet.create({
      serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
      },
      serviceCardGrid: {
        flexBasis: '48%',
        maxWidth: '48%',
        marginBottom: 18,
        backgroundColor: 'rgba(243,244,246,0.92)', // light grey
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#d1d5db', // darker grey border
        shadowColor: '#cbd5e1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 14,
        elevation: 5,
        minWidth: 0,
      },
      serviceThumbnailGrid: {
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 14,
        backgroundColor: '#eee',
        resizeMode: 'cover',
        marginBottom: 8,
      },
    serviceThumbnailVertical: {
      width: '100%',
      aspectRatio: 3/4,
      borderRadius: 18,
      backgroundColor: '#eee',
      resizeMode: 'cover',
      marginBottom: 10,
      alignSelf: 'center',
    },
  coverPhoto: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    resizeMode: 'cover',
    backgroundColor: '#e5e7eb',
  },
  profileCardModern: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    margin: 12,
    marginTop: 18,
    borderRadius: 24,
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: '#a1a1aa',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  profilePicModern: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: '#d1d5db', // grey border
    position: 'absolute',
    top: 110,
    left: '50%',
    marginLeft: -36,
    backgroundColor: 'rgba(243,244,246,0.92)', // light grey
    zIndex: 2,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  profileSpacer: {
    height: 60,
  },
  serviceDetailTitleProminent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDetailPriceProminent: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDetailDurationProminent: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  serviceDetailInfoProminent: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 4,
  },
  serviceDetailDescProminent: {
    fontSize: 16,
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
  },
  container: { flex: 1, backgroundColor: '#f3f4f6', minHeight: '100%', paddingLeft: 0, marginLeft: 0, overflow: 'hidden' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bookButtonModern: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 24,
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: 'transparent',
    elevation: 0,
  },
  bookButtonTextModern: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

});



const ProviderDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { providerId } = route.params as any;
  const [provider, setProvider] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!providerId) return;
    setLoading(true);
    setError('');
    api.get(`/providers/${providerId}`)
      .then(res => setProvider(res.data))
      .catch(() => setError('Failed to load provider'))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }
  if (error || !provider) {
    return <View style={styles.loading}><Text>{error || 'No provider found.'}</Text></View>;
  }

  // Pick best images
  const coverImage = provider.coverImage || (provider.gallery && provider.gallery.length > 1 ? provider.gallery[1] : null) || provider.avatar;
  const profileImage = provider.avatar || (provider.gallery && provider.gallery.length > 0 ? provider.gallery[0] : null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Modern Profile Card with Cover Photo and Profile Pic */}
        <View style={styles.profileCardModern}>
          {coverImage && (
            <Image source={{ uri: coverImage }} style={styles.coverPhoto} />
          )}
          {profileImage && (
            <Image source={{ uri: profileImage }} style={styles.profilePicModern} />
          )}
          <View style={styles.profileSpacer} />
          <Text style={[styles.serviceDetailTitleProminent, { marginTop: 40, fontSize: 26, color: '#ec4899', fontWeight: 'bold', textAlign: 'center' }]}>{provider.name}</Text>
          {provider.city && <Text style={styles.serviceDetailInfoProminent}>City: {provider.city}</Text>}
          {provider.addressLine && <Text style={styles.serviceDetailInfoProminent}>Address: {provider.addressLine}</Text>}
          {provider.phone && <Text style={styles.serviceDetailInfoProminent}>Phone: {provider.phone}</Text>}
          {provider.experience && <Text style={styles.serviceDetailInfoProminent}>Experience: {provider.experience}</Text>}
          {provider.specialization && <Text style={styles.serviceDetailInfoProminent}>Specialization: {provider.specialization}</Text>}
          {provider.workingHours && <Text style={styles.serviceDetailInfoProminent}>Working Hours: {provider.workingHours}</Text>}
          {provider.instagram && <Text style={styles.serviceDetailInfoProminent}>Instagram: {provider.instagram}</Text>}
          {provider.facebook && <Text style={styles.serviceDetailInfoProminent}>Facebook: {provider.facebook}</Text>}
          {provider.description && <Text style={styles.serviceDetailDescProminent}>{provider.description}</Text>}
        </View>
        {/* Services List */}
        <Text style={[styles.serviceDetailTitleProminent, { fontSize: 20, marginTop: 10, marginBottom: 0 }]}>Services</Text>
        {provider.services && provider.services.length > 0 ? (
          <View style={styles.serviceGrid}>
            {provider.services.map((svc: any) => (
              <TouchableOpacity
                key={svc._id}
                style={styles.serviceCardGrid}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ServiceDetails', { service: svc })}
              >
                {svc.thumbnail && <Image source={{ uri: svc.thumbnail }} style={styles.serviceThumbnailGrid} />}
                <Text style={[styles.serviceDetailTitleProminent, { fontSize: 15, color: '#ec4899', marginBottom: 2 }]} numberOfLines={1}>{svc.customName || svc.serviceId?.name || 'Service'}</Text>
                <Text style={styles.serviceDetailPriceProminent}>₨{svc.price}</Text>
                <Text style={styles.serviceDetailDurationProminent}>⏱ {svc.durationMin} min</Text>
                {svc.description && <Text style={styles.serviceDetailDescProminent} numberOfLines={2}>{svc.description}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.serviceDetailInfoProminent}>No services found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderDetailScreen;
