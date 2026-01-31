// CheckoutScreen.tsx
// This file is for the Checkout page UI (first screenshot)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './BookingScreen';

export default function CheckoutScreen({ route }: { route: { params: any } }) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'BookingConfirm'>>();
  const { service, date, time, groupSize, notes, mode, price, providerId, providerName } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const paymentOptions = [
    { key: 'cash', label: 'Cash' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'card', label: 'Card' },
  ];

  const handleConfirmBooking = () => {
    navigation.navigate('BookingConfirm', {
      providerId,
      providerName,
      services: [{ ...service }],
      slot: new Date(date).toISOString(),
      date,
      groupSize,
      mode,
      paymentMethod,
      notes,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <View style={styles.card}>
        {service?.thumbnail ? (
          <Image source={{ uri: service.thumbnail }} style={styles.serviceImage} />
        ) : null}
        <Text style={styles.serviceName}>{service?.serviceName || 'Service Name Not Available'}</Text>
        {service?.description ? (
          <Text style={styles.serviceDescription}>{service.description}</Text>
        ) : null}
        <View style={styles.row}><Feather name="user" size={18} color="#ec4899" /><Text style={styles.value}>{providerName || ''}</Text></View>
        <View style={styles.row}><Feather name="calendar" size={18} color="#ec4899" /><Text style={styles.value}>{new Date(date).toLocaleDateString()}</Text></View>
        <View style={styles.row}><Feather name="clock" size={18} color="#ec4899" /><Text style={styles.value}>{time?.hour}:{time?.minute} {time?.period}</Text></View>
        <View style={styles.row}><FontAwesome5 name="users" size={18} color="#ec4899" /><Text style={styles.value}>{groupSize} {groupSize > 1 ? 'People' : 'Person'}</Text></View>
        <View style={styles.row}><MaterialIcons name={mode === 'HOME' ? 'home' : 'store'} size={18} color="#ec4899" /><Text style={styles.value}>{mode === 'HOME' ? 'Home Service' : 'Salon Visit'}</Text></View>
        {notes ? <View style={styles.row}><Feather name="edit-2" size={18} color="#ec4899" /><Text style={styles.value}>{notes}</Text></View> : null}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>Rs {price}</Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>Select Payment Method</Text>
        <View style={styles.paymentOptionsRow}>
          {paymentOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.paymentOption, paymentMethod === opt.key && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod(opt.key)}
            >
              <View style={[styles.radio, paymentMethod === opt.key && styles.radioSelected]}>
                {paymentMethod === opt.key && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.paymentLabel, paymentMethod === opt.key && styles.paymentLabelSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBooking} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmBtnText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ec4899', marginBottom: 18, textAlign: 'center', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 24, shadowColor: '#ec4899', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4, alignItems: 'center', marginBottom: 24 },
  serviceImage: { width: 90, height: 90, borderRadius: 12, marginBottom: 12 },
  serviceName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 2, textAlign: 'center' },
  serviceDescription: { fontSize: 15, color: '#64748b', marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  value: { color: '#1e293b', fontSize: 16, marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 14, width: '100%' },
  priceLabel: { fontWeight: 'bold', color: '#64748b', fontSize: 16 },
  priceValue: { color: '#ec4899', fontWeight: 'bold', fontSize: 20 },
  confirmBtn: { backgroundColor: '#ec4899', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  paymentSection: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginTop: 8, marginBottom: 24, shadowColor: '#ec4899', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  paymentTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 14 },
  paymentOptionsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 4 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginHorizontal: 6, backgroundColor: '#fff' },
  paymentOptionSelected: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  paymentLabel: { marginLeft: 8, fontSize: 16, color: '#64748b', fontWeight: '600' },
  paymentLabelSelected: { color: '#ec4899' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  radioSelected: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ec4899' },
});
