import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BookingConfirmationPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const booking = (route.params as any)?.booking;

  // Extract provider name and booking id robustly
  const bookingId = booking?._id || booking?.id || 'N/A';
  const serviceName = booking?.items?.[0]?.serviceName || booking?.items?.[0]?.serviceNameSnapshot || 'N/A';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Your booking has been successfully created.</Text>
      <View style={styles.detailsCard}>
        <Text style={styles.label}>Booking ID:</Text>
        <Text style={styles.value}>{bookingId}</Text>
        <Text style={styles.label}>Service:</Text>
        <Text style={styles.value}>{serviceName}</Text>
        <Text style={styles.label}>Date & Time:</Text>
        <Text style={styles.value}>{booking?.scheduledStart ? new Date(booking.scheduledStart).toLocaleString() : 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('bookings' as never)}>
        <Text style={styles.buttonText}>Go to My Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ec4899', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 24 },
  detailsCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 32, width: '80%' },
  label: { fontSize: 15, color: '#64748b', marginTop: 8 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  button: { backgroundColor: '#ec4899', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
