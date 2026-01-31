import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function ProviderRequestsScreen() {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['provider-bookings', 'PENDING-LIST'],
    queryFn: async () => (await api.get('/bookings/provider/me', { params: { status: 'PENDING' } })).data
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/bookings/${id}/accept`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-bookings', 'PENDING-LIST'] })
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/bookings/${id}/reject`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-bookings', 'PENDING-LIST'] })
  });

  const handleAction = (id: string, action: 'accept' | 'reject') => {
    if (action === 'accept') acceptMutation.mutate(id);
    else rejectMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.muted}>Loading requests...</Text>
      </View>
    );
  }

  if (!bookings.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.title}>No pending requests</Text>
        <Text style={styles.muted}>Bookings will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Requests</Text>
        <Text style={styles.muted}>{bookings.length} pending</Text>
      </View>

      {bookings.map((b: any) => (
        <View key={b._id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.bold}>{b.customerUserId?.fullName || 'Customer'}</Text>
            <Text style={styles.price}>Rs {b.total?.toLocaleString()}</Text>
          </View>
          <Text style={styles.muted}>{new Date(b.scheduledStart).toLocaleString()}</Text>
          <Text style={styles.services}>{b.items?.map((i: any) => i.snapshots?.serviceName).join(', ')}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.badge}>{b.mode === 'HOME' ? 'Home Service' : 'Salon Visit'}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.reject]}
                onPress={() => handleAction(b._id, 'reject')}
                disabled={rejectMutation.isPending || acceptMutation.isPending}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.accept]}
                onPress={() => handleAction(b._id, 'accept')}
                disabled={rejectMutation.isPending || acceptMutation.isPending}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  muted: { color: '#6b7280', marginTop: 6 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  card: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bold: { fontWeight: '700', color: '#111827', fontSize: 15 },
  price: { color: '#ec4899', fontWeight: '700' },
  services: { color: '#111827', marginTop: 6, fontWeight: '500' },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, color: '#0f172a', fontWeight: '600', marginTop: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginHorizontal: 2,
    shadowColor: '#ec4899',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  reject: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
  },
  rejectText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  accept: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  }
});
