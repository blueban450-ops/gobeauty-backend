import React from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProviderBookingsModal({ visible, bookings, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Booking Details</Text>
          <FlatList
            data={bookings}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.bookingItem}>
                <Text selectable style={styles.label}>Booking ID: <Text selectable style={styles.value}>{item._id}</Text></Text>
                <Text style={styles.label}>Customer: <Text style={styles.value}>{item.customerUserId?.fullName || 'N/A'}</Text></Text>
                {(() => {
                  const dateObj = new Date(item.scheduledStart);
                  const dateStr = dateObj.toLocaleDateString();
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                  return (
                    <Text style={styles.label}>
                      Date: <Text style={styles.value}>{dateStr}</Text>{'  '}
                      Time: <Text style={styles.value}>{timeStr}</Text>
                    </Text>
                  );
                })()}
                <Text style={styles.label}>Status: <Text style={[
                  styles.value,
                  item.status === 'CONFIRMED' ? { color: '#2563eb', fontWeight: 'bold' } :
                  item.status === 'REJECTED' ? { color: '#dc2626', fontWeight: 'bold' } :
                  {}
                ]}>{item.status}</Text></Text>
                <Text style={styles.label}>Total: <Text style={styles.value}>Rs {item.total}</Text></Text>
                <Text style={styles.label}>Payment: <Text style={[styles.value, { color: item.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }]}>{item.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</Text></Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>No bookings found.</Text>}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#ec4899', marginBottom: 16, textAlign: 'center' },
  bookingItem: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 10 },
  label: { color: '#64748b', fontWeight: '600' },
  value: { color: '#1e293b', fontWeight: 'normal' },
  closeBtn: { backgroundColor: '#ec4899', padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
