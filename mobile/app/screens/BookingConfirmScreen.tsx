import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function BookingConfirmScreen() {
  const route = useRoute();
  // Debug log to inspect params and services
  // eslint-disable-next-line no-console
  console.log('BookingConfirmScreen params:', JSON.stringify(route?.params, null, 2));
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const params = route.params as any;
  // Debug log to show the raw services param
  // eslint-disable-next-line no-console
  console.log('RAW params.services:', JSON.stringify(params.services, null, 2));

  // Helper: flatten any nested array/objects and return first valid service object
  function getFirstServiceAnyStructure(input: any): any | null {
    // If input is not array, just return if it's an object
    if (!Array.isArray(input)) {
      if (input && typeof input === 'object') {
        // If object has 'services' property, recurse
        if (Array.isArray(input.services)) {
          return getFirstServiceAnyStructure(input.services);
        }
        return input;
      }
      return null;
    }
    // If array, flatten all nested arrays
    const flat = input.flat(Infinity).filter(Boolean);
    for (let item of flat) {
      if (item && typeof item === 'object') {
        if (Array.isArray(item.services)) {
          const found = getFirstServiceAnyStructure(item.services);
          if (found) return found;
        } else {
          return item;
        }
      }
    }
    return null;
  }
  const firstService = params.services ? getFirstServiceAnyStructure(params.services) : null;
  const singleService = firstService ? [firstService] : [];
  
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('--- SENDING POST /bookings ---', data);
      try {
        const res = await api.post('/bookings', data);
        console.log('--- POST /bookings RESPONSE ---', res.data);
        return res.data;
      } catch (err) {
        console.log('--- POST /bookings ERROR ---', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('Booking API response:', JSON.stringify(data, null, 2));
      if (data && data.customerUserId) {
        console.log('Booking customerUserId:', data.customerUserId);
      } else {
        console.log('Booking API response missing customerUserId:', data);
      }
      queryClient.invalidateQueries({ queryKey: ['bookings-customer'] });
      navigation.navigate('BookingConfirmationPage', { booking: data });
    },
    onError: (error: any) => {
      console.log('Booking API error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create booking');
    }
  });

  const handleConfirm = () => {
    console.log('handleConfirm called');
    if (params.mode === 'HOME' && (!addressLine || !city)) {
      Alert.alert('Error', 'Please provide your address for home service');
      return;
    }
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiry || !cvv) {
        Alert.alert('Error', 'Please enter all card details');
        return;
      }
    }
    const bookingData = {
      providerId: params.providerId,
      mode: params.mode,
      scheduledStart: params.slot,
      serviceIds: singleService.map((s: any) => s.providerServiceId),
      groupSize: params.groupSize || 1,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? { cardNumber, expiry, cvv } : undefined,
      customerAddress: params.mode === 'HOME' ? {
        addressLine,
        city,
        postalCode: postalCode || undefined,
        lat: 0,
        lng: 0
      } : undefined
    };

    console.log('Calling mutation.mutate with:', bookingData);
    mutation.mutate(bookingData);
  };

  const totalPrice = (singleService?.reduce((sum: number, s: any) => sum + s.price, 0) || 0) * (params.groupSize || 1);
  const totalDuration = singleService?.reduce((sum: number, s: any) => sum + s.durationMin, 0) || 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Booking Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Provider</Text>
            <Text style={styles.value}>{params.providerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {new Date(params.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>
              {new Date(params.slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{totalDuration} minutes</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mode</Text>
            <View style={[styles.modeBadge, params.mode === 'HOME' ? styles.homeBadge : styles.salonBadge]}>
              <Text style={styles.modeBadgeText}>
                {params.mode === 'HOME' ? '🏠 Home Service' : '🏪 Salon Visit'}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Group Size</Text>
            <Text style={styles.value}>{params.groupSize || 1}</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Services</Text>
          {singleService && singleService.length > 1 && (
            <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 10 }}>
              ⚠️ Error: Multiple services detected! Data: {JSON.stringify(singleService, null, 2)}
            </Text>
          )}
          {!singleService[0] && (
            <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 10 }}>
              ⚠️ Error: No valid service found! Data: {JSON.stringify(params.services, null, 2)}
            </Text>
          )}
          {singleService && singleService[0] && (
            <View style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{singleService[0].serviceName}</Text>
                <Text style={styles.serviceDuration}>{singleService[0].durationMin} min</Text>
                {singleService[0].note ? (
                  <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Note: {singleService[0].note}</Text>
                ) : null}
              </View>
              <Text style={styles.servicePrice}>Rs {singleService[0].price}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs {totalPrice}</Text>
          </View>
        </View>

        {/* Address for Home Service */}
        {params.mode === 'HOME' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Address</Text>
            <Text style={styles.helperText}>Provider will visit this address</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line *</Text>
              <TextInput
                style={styles.input}
                value={addressLine}
                onChangeText={setAddressLine}
                placeholder="House/Flat no., Street name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Optional"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            {['cash', 'wallet', 'card'].map((method) => (
              <TouchableOpacity
                key={method}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: paymentMethod === method ? '#ec4899' : '#e2e8f0',
                  backgroundColor: paymentMethod === method ? '#fdf2f8' : '#fff',
                  marginHorizontal: 4
                }}
                onPress={() => setPaymentMethod(method)}
              >
                <Text style={{ color: paymentMethod === method ? '#ec4899' : '#64748b', fontWeight: 'bold' }}>
                  {method === 'cash' ? 'Cash' : method === 'wallet' ? 'Wallet' : 'Card'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {paymentMethod === 'card' && (
            <View style={{ marginTop: 8 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="Card Number"
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="CVV"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          )}
          {paymentMethod === 'cash' && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>💵 Cash on Service</Text>
              <Text style={styles.paymentSubtext}>Pay after service completion</Text>
            </View>
          )}
          {paymentMethod === 'wallet' && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>💰 Wallet Payment</Text>
              <Text style={styles.paymentSubtext}>Pay using your wallet balance</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#ec4899',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleConfirm}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 20, marginTop: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, color: '#64748b' },
  value: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right' },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  homeBadge: { backgroundColor: '#d1fae5' },
  salonBadge: { backgroundColor: '#e0e7ff' },
  modeBadgeText: { fontSize: 12, fontWeight: '600' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  serviceDuration: { fontSize: 13, color: '#64748b' },
  servicePrice: { fontSize: 15, fontWeight: 'bold', color: '#ec4899' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  helperText: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 15, color: '#1e293b' },
  paymentInfo: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 },
  paymentText: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  paymentSubtext: { fontSize: 13, color: '#64748b' },
  bottom: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  bottomTotal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  bottomTotalLabel: { fontSize: 16, color: '#64748b' },
  bottomTotalValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  confirmBtn: { backgroundColor: '#ec4899', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
