import React, { useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getCustomerBookings } from '../lib/api';

// --- Types Definition ---
interface Booking {
  _id: string;
  providerId?: string | { _id: string; name: string; type: string; rating?: number };
  mode: 'HOME' | 'SALON';
  scheduledStart: string;
  total: number;
  status: string;
  items?: Array<{ serviceName?: string; serviceNameSnapshot?: string }>; // Fix: add serviceName/serviceNameSnapshot
  // ... add any other fields as needed
}

export default function BookingsListScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // --- ROBUST QUERY ---
  const { data: bookings, isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ['bookings-customer'],
    queryFn: async () => {
      try {
        console.log('Fetching bookings...');
        const response = await getCustomerBookings();
        // Safety Check: Ensure we always return an Array
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.bookings)) return response.bookings;
        return []; 
      } catch (err) {
        console.error('Error fetching bookings:', err);
        return []; // Return empty array on error to prevent crash
      }
    },
  });

  // Auto-Refresh on Focus
  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'ON_THE_WAY': return '#8b5cf6';
      case 'STARTED': return '#a855f7';
      case 'COMPLETED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'PENDING': return '#fef3c7';
      case 'CONFIRMED': return '#dbeafe';
      case 'ON_THE_WAY': return '#ede9fe';
      case 'STARTED': return '#f3e8ff';
      case 'COMPLETED': return '#d1fae5';
      case 'CANCELLED': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  // --- EMPTY STATE CHECK ---
  if (!bookings || bookings.length === 0) {
    // Dynamic calendar icon with today's date and month
    const today = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = today.getDate();
    const month = monthNames[today.getMonth()];
    return (
      <View style={styles.empty}>
        <View style={{alignItems:'center',marginBottom:16}}>
          <View style={{backgroundColor:'#fff',borderRadius:12,shadowColor:'#ec4899',shadowOpacity:0.12,shadowRadius:8,elevation:3,padding:0}}>
            <View style={{backgroundColor:'#ec4899',borderTopLeftRadius:12,borderTopRightRadius:12,paddingHorizontal:18,paddingTop:8,paddingBottom:2,alignItems:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold',fontSize:16,letterSpacing:1}}>{month}</Text>
            </View>
            <View style={{backgroundColor:'#fff',borderBottomLeftRadius:12,borderBottomRightRadius:12,paddingHorizontal:18,paddingVertical:8,alignItems:'center',borderWidth:1,borderColor:'#f3f4f6'}}>
              <Text style={{color:'#1e293b',fontWeight:'bold',fontSize:32}}>{day}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
        <Text style={styles.emptyText}>Start booking services to see them here</Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('home')} // Fixed route name
        >
          <Text style={styles.browseBtnText}>Browse Services</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} booking(s)</Text>
      </View>

      {bookings.map((booking) => {
        // --- SAFE DATA EXTRACTION ---
        let providerIdValue = '';
        let providerName = 'Unknown Provider';
        let providerType = 'Service';

        // Fix: Always extract providerIdValue and providerName from both object and string
        if (booking.providerId && typeof booking.providerId === 'object') {
          providerIdValue = booking.providerId._id || '';
          providerName = booking.providerId.name || 'Provider';
          providerType = booking.providerId.type || 'Service';
        } else if (typeof booking.providerId === 'string') {
          providerIdValue = booking.providerId;
          // Try to get provider name from another field if available
          if ((booking as any).providerName) providerName = (booking as any).providerName;
        }

        return (
          <TouchableOpacity
            key={booking._id}
            style={styles.cardMini}
            onPress={() => {
              navigation.navigate('BookingDetail', { booking });
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={styles.miniDate}>
                {booking.scheduledStart
                  ? new Date(booking.scheduledStart).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  : 'N/A'}
              </Text>
              <Text style={{ width: 18 }} />
              <Text style={styles.miniPrice}>Rs {booking.total ? booking.total.toLocaleString() : '0'}</Text>
              <Text style={{ width: 18 }} />
              {booking.status === 'CONFIRMED' && (
                <Text style={styles.confirmText}>CONFIRMED</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  browseBtn: { backgroundColor: '#ec4899', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: '#f3f4f6', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  cardMini: { backgroundColor: '#f3f4f6', marginHorizontal: 24, marginTop: 12, borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#64748b', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  miniDate: { fontSize: 14, color: '#475569', fontWeight: '600' },
  miniPrice: { fontSize: 15, color: '#ec4899', fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 17, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  providerType: { fontSize: 13, color: '#64748b' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailIcon: { fontSize: 16, marginRight: 8, width: 24 },
  detailText: { fontSize: 14, color: '#475569' },
  servicesRow: { marginTop: 8, marginBottom: 12 },
  servicesLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  servicesText: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  priceLabel: { fontSize: 14, color: '#64748b' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#ec4899' },
  confirmBadge: { backgroundColor: '#e0e7ff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  confirmBadgeText: { color: '#2563eb', fontWeight: 'bold', fontSize: 11 },
  confirmBadgeGreen: { backgroundColor: '#d1fae5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8, borderWidth: 1, borderColor: '#10b981' },
  confirmBadgeTextGreen: { color: '#059669', fontWeight: 'bold', fontSize: 11 },
  confirmText: { color: '#059669', fontWeight: 'bold', fontSize: 15 },
});