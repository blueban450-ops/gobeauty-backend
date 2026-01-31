import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Helper to get full avatar URL
const getAvatarUrl = (avatar: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  // join baseURL and avatar path
  return `${api.defaults.baseURL?.replace('/api','')}${avatar}`;
};

interface User {
  name: string;
  email: string;
  phone?: string;
}

interface ProfileScreenProps {
  navigation: any;
  user?: User;
}


export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, user: propUser }) => {
  const { user: contextUser, logout } = useAuth();
  // Prefer propUser if passed, otherwise contextUser
  const user = propUser || contextUser || {};
  // Always prefer fullName if present
  const displayName = user.fullName || user.name || '';

  const handleLogout = async () => {
    Alert.alert(
      'Logout Confirm',
      'Kya aap logout karna chahte ho?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive'
        }
      ]
    );
  };

  const menuItems = [
    { icon: '👤', label: 'Edit Profile', screen: 'EditProfile', active: true },
    { icon: '💳', label: 'Payment Methods', screen: 'PaymentMethods', active: false },
    { icon: '📍', label: 'Saved Addresses', screen: 'Addresses', active: false },
    { icon: '❤️', label: 'Favorites', screen: 'Favorites', active: false },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications', active: false },
    { icon: '💰', label: 'Wallet', screen: 'Wallet', active: false },
    { icon: '🎫', label: 'My Coupons', screen: 'MyCoupons', active: false },
    { icon: '⚙️', label: 'Settings', screen: 'Settings', active: false }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 64 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {user?.avatar ? (
            <Image source={{ uri: getAvatarUrl(user.avatar) }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{displayName || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Customer Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Profile Details</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Name:</Text><Text style={styles.detailValue}>{displayName || 'Not set'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue}>{user?.email || 'Not set'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone:</Text><Text style={styles.detailValue}>{user?.phone || 'Not set'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Address:</Text><Text style={styles.detailValue}>{user?.address || user?.location || 'Not set'}</Text></View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, !item.active && { opacity: 0.5 }]}
            onPress={() => item.active && navigation.navigate(item.screen)}
            disabled={!item.active}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  detailsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#222',
    width: 80,
  },
  detailValue: {
    color: '#444',
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  avatarText: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  editPicText: {
    color: '#ec4899',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280' },
  menu: { marginTop: 16 },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: { fontSize: 24, marginRight: 12, width: 32 },
  menuLabel: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  menuArrow: { fontSize: 24, color: '#9ca3af' },
  logoutButton: {
    backgroundColor: '#fee2e2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: 'bold' },
  footer: { padding: 20, alignItems: 'center' },
  version: { fontSize: 12, color: '#9ca3af' }
});
