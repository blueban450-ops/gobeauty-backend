import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProviderMoreScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>More</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ProviderProfileManage')}>
        <Ionicons name="person-circle-outline" size={24} color="#64748b" style={styles.icon} />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="wallet-outline" size={24} color="#64748b" style={styles.icon} />
        <Text style={styles.label}>My Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="card-outline" size={24} color="#64748b" style={styles.icon} />
        <Text style={styles.label}>Payment Methods</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="star-outline" size={24} color="#64748b" style={styles.icon} />
        <Text style={styles.label}>Membership</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="language-outline" size={24} color="#64748b" style={styles.icon} />
        <Text style={styles.label}>Language</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="help-circle-outline" size={24} color="#64748b" style={styles.icon} />
        <Text style={styles.label}>Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#1e293b' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  icon: { marginRight: 16 },
  label: { fontSize: 16, color: '#334155' },
});
