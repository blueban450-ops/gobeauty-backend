// BookingSummaryScreen.tsx
// This file is for the Booking Summary page UI (second screenshot)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './BookingScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function BookingSummaryScreen({ route }: { route: { params: any } }) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'BookingConfirm'>>();
  const { providerName, date, time, duration, mode, groupSize, service, price } = route.params;

  const handleConfirmBooking = () => {
    navigation.navigate('BookingConfirm', {
      providerName,
      date,
      time,
      duration,
      mode,
      groupSize,
      service,
      price,
      paymentMethod: 'cash', // Default for summary
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Booking Summary</Text>
      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.label}>Provider</Text><Text style={styles.value}>{providerName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{date}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Time</Text><Text style={styles.value}>{time}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{duration}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Mode</Text><View style={styles.mode}><MaterialIcons name={mode === 'HOME' ? 'home' : 'store'} size={18} color="#64748b" /><Text style={styles.modeText}>{mode === 'HOME' ? 'Home Service' : 'Salon Visit'}</Text></View></View>
        <View style={styles.row}><Text style={styles.label}>Group Size</Text><Text style={styles.value}>{groupSize}</Text></View>
      </View>

      <View style={styles.servicesCard}>
        <Text style={styles.servicesTitle}>Services</Text>
        <View style={styles.serviceRow}>
          <Text style={styles.serviceLabel}>{service?.serviceName || 'Service'}</Text>
          <Text style={styles.serviceValue}>Rs {price}</Text>
        </View>
        <Text style={styles.serviceDuration}>{service?.duration || '60 min'}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>Rs {price}</Text>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Payment</Text>
        <View style={styles.paymentMethodRow}>
          <Text style={styles.paymentMethodIcon}>💵</Text>
          <View>
            <Text style={styles.paymentMethodLabel}>Cash on Service</Text>
            <Text style={styles.paymentMethodDesc}>Pay after service completion</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBooking}>
        <Text style={styles.confirmBtnText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 18, textAlign: 'left', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: '#64748b', fontWeight: 'bold', fontSize: 15 },
  value: { color: '#1e293b', fontSize: 15 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modeText: { marginLeft: 6, color: '#1e293b', fontSize: 15 },
  servicesCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 18 },
  servicesTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 17, marginBottom: 10 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceLabel: { color: '#64748b', fontSize: 15 },
  serviceValue: { color: '#ec4899', fontWeight: 'bold', fontSize: 16 },
  serviceDuration: { color: '#64748b', fontSize: 13, marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  totalLabel: { fontWeight: 'bold', color: '#1e293b', fontSize: 16 },
  totalValue: { color: '#ec4899', fontWeight: 'bold', fontSize: 20 },
  paymentCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 18 },
  paymentTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 17, marginBottom: 10 },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentMethodIcon: { fontSize: 22, marginRight: 8 },
  paymentMethodLabel: { color: '#1e293b', fontWeight: 'bold', fontSize: 15 },
  paymentMethodDesc: { color: '#64748b', fontSize: 13 },
  confirmBtn: { backgroundColor: '#ec4899', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});
