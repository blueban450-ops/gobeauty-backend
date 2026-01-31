import React from 'react';
import io from 'socket.io-client';
import ProviderBookingsModal from '../components/ProviderBookingsModal';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function ProviderDashboardScreen() {
  // Notification modal state
  const [showNotif, setShowNotif] = React.useState(false);
  // State for showing booking details modal (move above conditional return)
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [showBookingModal, setShowBookingModal] = React.useState(false);

  // Notifications state (for real-time updates)
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = React.useState(true);

  // Fetch notifications for provider (initial load)
  React.useEffect(() => {
    let mounted = true;
    api.get('/notifications/me').then(res => {
      if (mounted) {
        setNotifications(res.data);
        setLoadingNotifs(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Socket.io for real-time notifications
  React.useEffect(() => {
    // Replace with your server URL if needed
    const socket = io('http://10.0.2.2:4000');
    // TODO: Replace with actual providerId from profile/auth context
    // socket.emit('join', providerId);

    socket.on('notification', (notif) => {
      console.log('Socket notification:', notif);
      setNotifications(prev => [notif, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: async () => (await api.get('/providers/me/profile')).data
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['provider-earnings'],
    queryFn: async () => (await api.get('/providers/me/earnings')).data
  });

  const { data: pending = [], isLoading: loadingPending } = useQuery({
    queryKey: ['provider-bookings', 'PENDING'],
    queryFn: async () => (await api.get('/bookings/provider/me', { params: { status: 'PENDING' } })).data
  });

  const { data: confirmed = [], isLoading: loadingConfirmed } = useQuery({
    queryKey: ['provider-bookings', 'CONFIRMED'],
    queryFn: async () => (await api.get('/bookings/provider/me', { params: { status: 'CONFIRMED' } })).data
  });

  // All bookings for modal
  const { data: allBookings = [], isLoading: loadingAllBookings } = useQuery({
    queryKey: ['provider-bookings', 'ALL'],
    queryFn: async () => (await api.get('/bookings/provider/me')).data
  });

  const loading = loadingProfile || loadingEarnings || loadingPending || loadingConfirmed;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.muted}>Loading dashboard...</Text>
      </View>
    );
  }

  const cards = [
    { label: 'Pending Requests', value: pending.length, color: '#f59e0b' },
    { label: 'Confirmed', value: confirmed.length, color: '#3b82f6' },
    { label: 'Total Bookings', value: earnings?.totalBookings || 0, color: '#8b5cf6' },
    { label: 'Net Earnings', value: `Rs ${(earnings?.netEarnings || 0).toLocaleString()}`, color: '#10b981' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
                {/* Bookings Button ab neeche show hoga */}
              {/* Bookings Button ab neeche show hoga */}
              <View style={{ marginTop: 32, marginBottom: 24, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.35)',
                    borderRadius: 22,
                    paddingVertical: 10,
                    paddingHorizontal: 32,
                    alignItems: 'center',
                    shadowColor: '#fff',
                    shadowOpacity: 0.7,
                    shadowOffset: { width: -2, height: -2 },
                    shadowRadius: 8,
                    elevation: 4,
                    borderWidth: 1.5,
                    borderColor: '#f3f4f6',
                    // iOS glass effect
                    backdropFilter: 'blur(18px)',
                    // Soft inner shadow (neumorphism)
                    overflow: 'hidden',
                  }}
                  activeOpacity={0.6}
                  onPress={() => setShowBookingModal(true)}
                >
                  <Text style={{
                    color: '#ec4899',
                    fontWeight: '700',
                    fontSize: 16,
                    letterSpacing: 0.5,
                    textShadowColor: '#fff',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 6,
                  }}>
                    Show Booking Details
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bookings Modal */}
              <ProviderBookingsModal
                visible={showBookingModal}
                bookings={allBookings}
                onClose={() => setShowBookingModal(false)}
              />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.title}>Provider Dashboard</Text>
          {/* Modern Bell Icon */}
          <View style={styles.bellWrapper}>
            <TouchableOpacity onPress={() => setShowNotif(true)}>
              <View style={{ position: 'relative' }}>
                <Feather name="bell" size={28} color="#ec4899" style={styles.bellIcon} />
                {/* Notification badge (show count if unread) */}
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{notifications.filter(n => !n.isRead).length}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>{profile?.name}</Text>
        {!profile?.isVerified && (
          <Text style={styles.warning}>Pending admin verification</Text>
        )}
      </View>


      {/* Notification Modal */}
      {showNotif && (
        <View style={styles.notifModalOverlay}>
          <View style={styles.notifModal}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: '#ec4899', textAlign: 'center' }}>Notifications</Text>
            {loadingNotifs ? (
              <ActivityIndicator size="small" color="#ec4899" />
            ) : notifications.length === 0 ? (
              <Text style={{ color: '#64748b', textAlign: 'center' }}>No notifications</Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {notifications.map((n, idx) => (
                  <View key={n._id || idx} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: n.isRead ? '#fff' : '#fdf2f8' }}>
                    <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>{n.title || 'Notification'}</Text>
                    <Text style={{ color: '#64748b', marginTop: 2 }}>{n.body || ','}</Text>
                    <Text style={{ color: '#ec4899', fontSize: 11, marginTop: 2 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setShowNotif(false)} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#ec4899', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, justifyContent: 'space-between', marginBottom: 8, marginTop: 18 }}>
        {cards.map((card, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: 'rgba(255,255,255,0.32)',
              borderRadius: 18,
              padding: 18,
              width: '48%',
              marginBottom: 14,
              borderWidth: 1.5,
              borderColor: card.color + '55',
              shadowColor: '#fff',
              shadowOpacity: 0.7,
              shadowOffset: { width: -2, height: -2 },
              shadowRadius: 8,
              elevation: 3,
              alignItems: 'center',
              backdropFilter: 'blur(14px)',
            }}
          >
            <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600', marginBottom: 6 }}>{card.label}</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: card.color, textShadowColor: '#fff', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>{card.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Earnings</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.muted}>Gross</Text>
          <Text style={styles.value}>Rs {(earnings?.totalEarnings || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.muted}>Commission (12%)</Text>
          <Text style={styles.value}>Rs {(earnings?.commission || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Net</Text>
          <Text style={[styles.value, styles.net]}>Rs {(earnings?.netEarnings || 0).toLocaleString()}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    bellWrapper: { marginLeft: 12 },
    bellIcon: { textShadowColor: '#fdf2f8', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    bellBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#ec4899', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    bellBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 2 },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  muted: { color: '#6b7280', marginTop: 8 },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  bellWrapper: { marginLeft: 12 },
  bellIcon: { fontSize: 28, color: '#ec4899', textShadowColor: '#fdf2f8', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  bellBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#ec4899', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  bellBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  warning: { marginTop: 8, color: '#f97316', fontWeight: '600' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1.5, borderRadius: 12, padding: 16, width: '47%' },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  block: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  blockTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  label: { fontSize: 14, color: '#111827', fontWeight: '600' },
  value: { fontSize: 14, color: '#111827', fontWeight: '600' },
  net: { color: '#10b981' }
});
