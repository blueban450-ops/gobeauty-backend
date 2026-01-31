import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BookingConfirmationScreen({ route }) {
  const { service, date, time, groupSize, mode, price, paymentMethod } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Feather name="check-circle" size={64} color="#22c55e" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Booking Confirmed!</Text>
        {service?.thumbnail && (
          <Image source={{ uri: service.thumbnail }} style={styles.serviceImage} />
        )}
        <Text style={styles.serviceName}>{service?.serviceName || 'Service Name Not Available'}</Text>
        {service?.description ? (
          <Text style={styles.serviceDescription}>{service.description}</Text>
        ) : null}
        <Text style={styles.detail}>Date: {new Date(date).toLocaleDateString()}</Text>
        <Text style={styles.detail}>Time: {time?.hour}:{time?.minute} {time?.period}</Text>
        <Text style={styles.detail}>People: {groupSize}</Text>
        <Text style={styles.detail}>Mode: {mode === 'HOME' ? 'Home Service' : 'Salon Visit'}</Text>
        <Text style={styles.detail}>Payment: {paymentMethod?.charAt(0).toUpperCase() + paymentMethod?.slice(1)}</Text>
        <Text style={styles.price}>Total: Rs {price}</Text>
      </View>
      <Text style={styles.thankyou}>Thank you for booking with us!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 28, shadowColor: '#22c55e', shadowOpacity: 0.15, shadowRadius: 16, elevation: 6, alignItems: 'center', marginBottom: 24, width: '100%' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#22c55e', marginBottom: 10, textAlign: 'center', letterSpacing: 1 },
  serviceImage: { width: 90, height: 90, borderRadius: 12, marginBottom: 10 },
  serviceName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 2, textAlign: 'center' },
  serviceDescription: { fontSize: 15, color: '#64748b', marginBottom: 10, textAlign: 'center' },
  detail: { fontSize: 16, color: '#64748b', marginBottom: 2, textAlign: 'center' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#ec4899', marginTop: 10, marginBottom: 4 },
  thankyou: { textAlign: 'center', color: '#64748b', fontSize: 18, marginTop: 10, fontWeight: '600' },
});
