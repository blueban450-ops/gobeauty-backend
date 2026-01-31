import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import io from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationsScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications/me');
      return res.data;
    }
  });

  React.useEffect(() => {
    const socket = io('http://192.168.10.25:4000'); // Update to your server address
    // TODO: Replace with actual userId from auth context if needed
    // socket.emit('join', userId);
    socket.on('notification', (notif) => {
      queryClient.invalidateQueries(['notifications']);
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'booking-update': '📅',
      'booking-confirmed': '✅',
      'booking-cancelled': '❌',
      'payment': '💳',
      'message': '💬',
      'promo': '🎁'
    };
    return icons[type] || '🔔';
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[styles.notifCard, !item.read && styles.unread]}>
      <Text style={styles.icon}>{getTypeIcon(item.type)}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      <FlatList contentContainerStyle={{ paddingBottom: 140 }}
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  list: { padding: 16 },
  notifCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  unread: { backgroundColor: '#fef3f2', borderColor: '#ec4899' },
  icon: { fontSize: 24 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  message: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ec4899'
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#9ca3af' }
});

export default NotificationsScreen;
