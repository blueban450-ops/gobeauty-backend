import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Booking {
  _id: string;
  service: { name: string };
  provider: { businessName: string };
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export const BookingsScreen: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/me');
      return res.data;
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date, time }: { id: string; date: string; time: string }) =>
      api.patch(`/bookings/${id}/reschedule`, { date, time }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setRescheduleModal(false);
      setNewDate('');
      setNewTime('');
      Alert.alert('Success', 'Booking rescheduled successfully');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Success', 'Booking cancelled and refund initiated');
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
    setRescheduleModal(true);
  };

  const handleCancel = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Refund will be initiated.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(booking._id) }
      ]
    );
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceName}>{item.service?.name}</Text>
          <Text style={styles.providerName}>{item.provider?.businessName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> 
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Feather name="calendar" style={styles.icon} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="clock" style={styles.icon} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="credit-card" style={styles.icon} />
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </View>

      {(item.status === 'pending' || item.status === 'confirmed') && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rescheduleBtn]}
            onPress={() => handleReschedule(item)}
          >
            <Text style={styles.actionBtnText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => handleCancel(item)}
          >
            <Text style={styles.actionBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <FlatList contentContainerStyle={{ paddingBottom: 140 }}
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        }
      />

      <Modal visible={rescheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Booking</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Date</Text>
              <TextInput
                style={styles.input}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Time</Text>
              <TextInput
                style={styles.input}
                value={newTime}
                onChangeText={setNewTime}
                placeholder="HH:MM"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setRescheduleModal(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={() => {
                  if (selectedBooking && newDate && newTime) {
                    rescheduleMutation.mutate({
                      id: selectedBooking._id,
                      date: newDate,
                      time: newTime
                    });
                  }
                }}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  list: { padding: 16 },
  bookingCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  serviceName: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', letterSpacing: 0.1 },
  providerName: { fontSize: 10, color: '#64748b', marginTop: 1, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  bookingDetails: { marginBottom: 3 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
  icon: { fontSize: 12, marginRight: 4, color: '#3b82f6' },
  detailText: { fontSize: 10, color: '#334155', fontWeight: '500' },
  priceText: { fontSize: 11, fontWeight: 'bold', color: '#ec4899', marginLeft: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  rescheduleBtn: { backgroundColor: '#3b82f6' },
  cancelBtn: { backgroundColor: '#ef4444' },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelModalBtn: { backgroundColor: '#f3f4f6' },
  cancelModalText: { color: '#6b7280', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#ec4899' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' }
});
