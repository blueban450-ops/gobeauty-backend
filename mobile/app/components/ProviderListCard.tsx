import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Make sure ye install ho

export default function ProviderListCard({ provider }) {
  // Safe Data Handling (Crash se bachne ke liye)
  const avatar = provider?.avatar;
  const name = provider?.name || 'Unknown Provider';
  // Distance ko number mein convert karke fix kiya
  const distance = provider?.distance ? `${Number(provider.distance).toFixed(1)} km` : '';
  
  // Service Name nikalne ka logic
  let serviceName = 'Beauty Services';
  if (provider?.services && Array.isArray(provider.services) && provider.services.length > 0) {
      serviceName = provider.services[0]?.customName || provider.services[0]?.serviceId?.name || 'Service';
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      {/* Avatar Image */}
      {avatar ? (
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </View>
      ) : (
        <View style={[styles.avatarWrap, styles.avatarPlaceholder]}>
          <Feather name="user" size={28} color="#b0b0c3" />
        </View>
      )}
      
      {/* Info Section */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.service} numberOfLines={1}>{serviceName}</Text>
        
        {/* Rating & Distance */}
        <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
                <Feather name="star" size={12} color="#fff" />
                <Text style={styles.ratingText}>4.8</Text>
            </View>
            {distance ? (
                <>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.distance}>{distance}</Text>
                </>
            ) : null}
        </View>
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <Feather name="chevron-right" size={20} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    // Soft Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // Glowing border
    borderWidth: 2.5,
    borderColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
  },
  avatarPlaceholder: {
    backgroundColor: '#f8f0fa',
    justifyContent: 'center',
    alignItems: 'center',
    // Extra glow for placeholder
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  service: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fbbf24',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      gap: 4
  },
  ratingText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#fff',
  },
  dot: {
      marginHorizontal: 8,
      color: '#cbd5e1',
      fontSize: 12,
  },
  distance: {
    color: '#ec4899',
    fontSize: 12,
    fontWeight: '600',
  },
  arrowContainer: {
      paddingLeft: 8,
  }
});