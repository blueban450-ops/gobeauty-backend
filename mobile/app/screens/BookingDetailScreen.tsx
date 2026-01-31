import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function BookingDetailScreen() {
  const route = useRoute();
  const booking = (route.params as any)?.booking;

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No booking data found.</Text>
      </View>
    );
  }

  const providerName = booking.providerName || booking.providerId?.name || 'N/A';
  const serviceName = booking.items?.[0]?.serviceName || booking.items?.[0]?.serviceNameSnapshot || 'N/A';
  const paymentMethod = booking.paymentMethod ? booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1) : 'N/A';
  const cardDetails = booking.cardDetails;
  const address = booking.customerAddress ? `${booking.customerAddress.addressLine || ''}, ${booking.customerAddress.city || ''} ${booking.customerAddress.postalCode || ''}`.trim() : null;

  // Custom detail message logic
  const showDetailMsg = booking.status === 'CONFIRMED' && booking.paymentStatus !== 'PAID';
  // Format time with AM/PM
  const formattedDate = booking.scheduledStart ? new Date(booking.scheduledStart).toLocaleDateString() : 'N/A';
  const formattedTime = booking.scheduledStart ? new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      }}
      style={styles.bgImage}
      imageStyle={{ opacity: 0.13 }}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(243,244,246,0.93)' }}>
        <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: 80 }]}> 
          <Text style={styles.title}>Booking Details</Text>
          {showDetailMsg && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                Booking is confirmed, but payment is still pending. After service completion, customer must release the payment.
              </Text>
            </View>
          )}
            <View style={styles.cardSmall}>
            <View style={styles.rowBetween}>
              <Text selectable style={styles.label}>Booking ID</Text>
              <Text selectable style={styles.value}>{booking._id || booking.id || 'N/A'}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Provider</Text>
              <Text style={styles.value}>{providerName}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Service</Text>
              <Text style={styles.value}>{serviceName}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{formattedTime}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Mode</Text>
              <Text style={styles.value}>{booking.mode === 'HOME' ? 'Home Service' : 'Salon Visit'}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Group Size</Text>
              <Text style={styles.value}>{booking.groupSize || 1}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Total Amount</Text>
              <Text style={[styles.value, { color: '#ec4899' }]}>Rs {booking.total?.toLocaleString() || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Method</Text>
              <Text style={styles.value}>{paymentMethod}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Payment Status</Text>
              <Text style={[styles.value, { color: booking.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b' }]}>{booking.paymentStatus ? booking.paymentStatus : 'N/A'}</Text>
            </View>
            {paymentMethod === 'Card' && cardDetails && (
              <>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Card Number</Text>
                  <Text style={styles.value}>{cardDetails.cardNumber}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Expiry</Text>
                  <Text style={styles.value}>{cardDetails.expiry}</Text>
                </View>
              </>
            )}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Customer Info</Text>
            {address && (
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{address}</Text>
              </View>
            )}
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: booking.status === 'PENDING' ? '#f59e0b' : '#10b981' }]}>{booking.status || 'N/A'}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  container: { backgroundColor: 'transparent' },
  scrollContent: { padding: 24 },
  error: { color: 'red', fontSize: 18, textAlign: 'center', marginTop: 40 },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(236,72,153,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  cardSmall: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
    paddingTop: 3,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  infoBanner: {
    backgroundColor: 'rgba(243,244,246,0.98)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  infoBannerText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 15.5,
    letterSpacing: 0.1,
    textAlign: 'left',
    lineHeight: 21,
  },
  label: { fontSize: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.1 },
  value: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginLeft: 4, letterSpacing: 0.1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ec4899', marginBottom: 12, marginTop: 10, letterSpacing: 0.2 },
  serviceImageVertical: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 8,
    resizeMode: 'cover',
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
});
