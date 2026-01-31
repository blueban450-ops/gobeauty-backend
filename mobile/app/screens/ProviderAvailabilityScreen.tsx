import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function ProviderAvailabilityScreen() {
  const queryClient = useQueryClient();
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotSizeMin, setSlotSizeMin] = useState('30');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['availability-rules'],
    queryFn: async () => (await api.get('/providers/me/availability')).data
  });

  const { data: blocked = [] } = useQuery({
    queryKey: ['blocked-times'],
    queryFn: async () => (await api.get('/providers/me/blocked-times')).data
  });

  const createRule = useMutation({
    mutationFn: async () => (await api.post('/providers/me/availability', {
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      slotSizeMin: parseInt(slotSizeMin)
    })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability-rules'] })
  });

  const createBlocked = useMutation({
    mutationFn: async () => (await api.post('/providers/me/blocked-times', {
      startAt: blockStart,
      endAt: blockEnd,
      reason: blockReason || undefined
    })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-times'] })
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/providers/me/availability/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability-rules'] })
  });

  const deleteBlocked = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/providers/me/blocked-times/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-times'] })
  });

  const handleAddRule = () => {
    if (!startTime || !endTime) return Alert.alert('Error', 'Please enter start and end time');
    createRule.mutate();
  };

  const handleAddBlock = () => {
    if (!blockStart || !blockEnd) return Alert.alert('Error', 'Please enter start and end datetime');
    createBlocked.mutate();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Availability</Text>
        <Text style={styles.muted}>Set weekly schedule and blocked times</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Rule</Text>
        <View style={styles.row}>
          <TextInput style={styles.input} value={dayOfWeek} onChangeText={setDayOfWeek} placeholder="Day (0-6)" keyboardType="numeric" />
          <TextInput style={styles.input} value={slotSizeMin} onChangeText={setSlotSizeMin} placeholder="Slot (min)" keyboardType="numeric" />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="Start (HH:MM)" />
          <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="End (HH:MM)" />
        </View>
        <TouchableOpacity style={styles.primary} onPress={handleAddRule} disabled={createRule.isPending}>
          {createRule.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Add Rule</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Blocked Times</Text>
        <TextInput style={styles.inputFull} value={blockStart} onChangeText={setBlockStart} placeholder="Start ISO (e.g. 2026-01-20T09:00:00Z)" />
        <TextInput style={styles.inputFull} value={blockEnd} onChangeText={setBlockEnd} placeholder="End ISO (e.g. 2026-01-20T11:00:00Z)" />
        <TextInput style={styles.inputFull} value={blockReason} onChangeText={setBlockReason} placeholder="Reason (optional)" />
        <TouchableOpacity style={styles.primary} onPress={handleAddBlock} disabled={createBlocked.isPending}>
          {createBlocked.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Add Block</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Rules</Text>
        {isLoading ? <ActivityIndicator color="#ec4899" /> : rules.map((r: any) => (
          <View key={r._id} style={styles.listItem}>
            <Text style={styles.listText}>Day {r.dayOfWeek} | {r.startTime}-{r.endTime} | {r.slotSizeMin} min</Text>
            <TouchableOpacity onPress={() => deleteRule.mutate(r._id)}><Text style={styles.delete}>✕</Text></TouchableOpacity>
          </View>
        ))}
        {rules.length === 0 && !isLoading && <Text style={styles.muted}>No rules yet</Text>}
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Blocked</Text>
        {blocked.map((b: any) => (
          <View key={b._id} style={styles.listItem}>
            <Text style={styles.listText}>{new Date(b.startAt).toLocaleString()} - {new Date(b.endAt).toLocaleString()}</Text>
            <TouchableOpacity onPress={() => deleteBlocked.mutate(b._id)}><Text style={styles.delete}>✕</Text></TouchableOpacity>
          </View>
        ))}
        {blocked.length === 0 && <Text style={styles.muted}>No blocked times</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  muted: { color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: '#fff', margin: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, backgroundColor: '#fff' },
  inputFull: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, backgroundColor: '#fff', marginTop: 8 },
  primary: { backgroundColor: '#ec4899', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '700' },
  listCard: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  listTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  listText: { color: '#111827' },
  delete: { color: '#ef4444', fontSize: 16 }
});
