import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { TextInput, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Define the HomeStackParamList for navigation types
export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetails: { service: any };
  Search: undefined;
  ProviderDetail: undefined;
  Booking: { providerId: string; providerName: string; preselectedService?: any };
  BookingConfirm: {
    providerId?: string;
    providerName?: string;
    services?: any[];
    slot?: string;
    date?: string;
    groupSize?: number;
    mode?: string;
    paymentMethod?: string;
    notes?: string;
    price?: number;
    time?: any;
    duration?: any;
    service?: any;
  };
  BookingDetailsScreen: {
    service: any;
    date: string;
    time: { hour: string; minute: string; period: string };
    groupSize: number;
    notes: string;
    mode: string;
    price: number;
    providerId?: string;
    providerName?: string;
  };
};
import api from '../lib/api';
import { WheelPicker } from '../components/WheelPicker';

interface Service {
  _id: string;
  providerServiceId: string;
  providerId: string;
  serviceName: string;
  price: number;
  durationMin: number;
  homeService?: boolean;
  salonVisit?: boolean;
  description?: string;
  thumbnail?: string;
  workingHours?: string;
}

export default function BookingScreen() {
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'Booking'>>();
  const insets = useSafeAreaInsets();
  const params = route.params as any;
  const { providerId, providerName, preselectedService } = params || {};

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['provider-services', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const res = await api.get(`/providers/${providerId}/services`);
      return res.data.map((s: any) => ({
        _id: s._id,
        providerServiceId: s._id,
        providerId: s.providerId || (s.provider && s.provider._id) || '',
        serviceName: s.serviceId?.name || 'Service',
        price: s.price,
        durationMin: s.durationMin,
        homeService: s.homeService,
        salonVisit: s.salonVisit,
        description: s.description,
        thumbnail: s.thumbnail,
        workingHours: s.workingHours
      }));
    },
    enabled: !!providerId,
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [groupSize, setGroupSize] = useState(1);
  const [serviceNotes, setServiceNotes] = useState<{ [serviceId: string]: string }>({});
  // Set default date to today
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mode, setMode] = useState<'HOME' | 'SALON'>('SALON');
  
  const [selectedTime, setSelectedTime] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [dateTimeConfirmed, setDateTimeConfirmed] = useState(false);

  // Fetch provider profile for workingHours fallback
  useEffect(() => {
    if (providerId) {
      api.get(`/providers/${providerId}`).then(res => {
        setProviderProfile(res.data);
      }).catch(() => setProviderProfile(null));
    }
  }, [providerId]);

  useEffect(() => {
    if (preselectedService && services.length > 0) {
      let serviceObj = Array.isArray(preselectedService) ? preselectedService[0] : preselectedService;
      if (serviceObj && typeof serviceObj === 'object') {
         const found = services.find((s: any) => s._id === serviceObj._id || s.providerServiceId === serviceObj._id);
         if (found) setSelectedService(found);
         else setSelectedService(serviceObj);
      }
    }
  }, [preselectedService, services]);

  useEffect(() => {
    if (selectedService) {
      if (selectedService.homeService && !selectedService.salonVisit) setMode('HOME');
      else if (!selectedService.homeService && selectedService.salonVisit) setMode('SALON');
    }
  }, [selectedService]);

  const totalPrice = selectedService ? selectedService.price * groupSize : 0;

  // ✅ ROBUST TIME PARSER (Strict Logic Fixed)
  const parseFlexibleTime = (timeString: string) => {
    if (!timeString) return -1;
    
    // 1. Clean string: Remove spaces, convert to uppercase
    // Example: " 09 : 30  pm " -> "09:30PM"
    const cleanStr = timeString.trim().toUpperCase().replace(/\s+/g, '');

    // 2. Extract Hours, Minutes, Period using Regex
    // Matches: 9:00AM, 09:30PM, 10:00AM
    const match = cleanStr.match(/(\d+):(\d+)(AM|PM)/);

    if (!match) return -1; // Parsing Failed

    let [_, hStr, mStr, period] = match;
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);

    // 3. Convert to 24-Hour Minutes (0 - 1439)
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    return (h * 60) + m;
  };

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Date Required', 'Please select a date first');
      return;
    }

    // 1. Try selectedService workingHours
    let workingHours = selectedService?.workingHours;
    // 2. Fallback: Try to get workingHours from any service of the same provider if missing
    if (!workingHours && providerId) {
      const providerService = services.find(s => s.workingHours);
      if (providerService) {
        workingHours = providerService.workingHours;
      }
    }
    // 3. Fallback: Try to get workingHours from provider profile
    if (!workingHours && providerProfile && providerProfile.workingHours) {
      workingHours = providerProfile.workingHours;
    }
    // 4. If still not found, show error
    if (!workingHours) {
      Alert.alert('Error', 'Provider working hours not found for this service. Please check provider profile.');
      return;
    }

    // --- STEP 2: VALIDATE ---
    // Expected format from DB: "9:00 AM - 9:00 PM"
    // Split by "-" or "to"
    const parts = workingHours.split(/-|to/); 
    
    if (parts.length !== 2) {
      // Cannot parse format (maybe it says "Mon-Fri Only")
      // Allow booking but warn developer
      console.warn("Invalid working hours format:", workingHours);
      navigation.navigate('BookingDetailsScreen', {
        service: { ...selectedService, providerName },
        date: selectedDate,
        time: selectedTime,
        groupSize,
        notes: serviceNotes[selectedService?._id] || '',
        mode,
        price: totalPrice
      });
      return;
    }

    const startMinutes = parseFlexibleTime(parts[0]);
    const endMinutes = parseFlexibleTime(parts[1]);
    
    // User Selected Time
    let selH = parseInt(selectedTime.hour, 10);
    const selM = parseInt(selectedTime.minute, 10);
    if (selectedTime.period === 'PM' && selH !== 12) selH += 12;
    if (selectedTime.period === 'AM' && selH === 12) selH = 0;
    const selectedTotalMinutes = (selH * 60) + selM;

    let isValid = false;

    if (startMinutes !== -1 && endMinutes !== -1) {
      if (startMinutes <= endMinutes) {
        // Day Shift (e.g. 9 AM to 9 PM)
        if (selectedTotalMinutes >= startMinutes && selectedTotalMinutes <= endMinutes) {
          isValid = true;
        }
      } else {
        // Night Shift (e.g. 9 PM to 2 AM)
        if (selectedTotalMinutes >= startMinutes || selectedTotalMinutes <= endMinutes) {
          isValid = true;
        }
      }
    } else {
      // Parsing failed, safe to allow?
      isValid = true; 
    }

    if (!isValid) {
      Alert.alert(
        'Provider Unavailable', 
        `Selected time is outside working hours.\n\nProvider Hours: ${workingHours}\nYour Time: ${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`
      );
      return;
    }

    // Navigate to BookingConfirm screen with all details, including providerId and providerName
    navigation.navigate('BookingConfirm', {
      providerId,
      providerName,
      services: [{
        ...selectedService,
        providerName,
        serviceName: selectedService?.serviceName,
        description: selectedService?.description
      }],
      slot: new Date(selectedDate).toISOString(),
      date: selectedDate,
      time: selectedTime,
      groupSize,
      notes: serviceNotes[selectedService?._id] || '',
      mode,
      price: totalPrice
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          <View style={styles.modeRow}>
            {selectedService && selectedService.salonVisit && (
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'SALON' && styles.modeBtnActive]}
                onPress={() => setMode('SALON')}
                disabled={mode === 'SALON'}
              >
                <Text style={[styles.modeBtnText, mode === 'SALON' && styles.modeBtnTextActive]}>
                  🏪 Salon Visit
                </Text>
              </TouchableOpacity>
            )}
            {selectedService && selectedService.homeService && (
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'HOME' && styles.modeBtnActive]}
                onPress={() => setMode('HOME')}
                disabled={mode === 'HOME'}
              >
                <Text style={[styles.modeBtnText, mode === 'HOME' && styles.modeBtnTextActive]}>
                  🏠 Home Service
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Service</Text>
          {selectedService ? (
            <View style={[styles.serviceCard, styles.serviceCardSelected, { shadowColor: '#ec4899', shadowOpacity: 0.18, shadowRadius: 8, elevation: 6 }]}> 
              {selectedService.thumbnail && (
                <Image source={{ uri: selectedService.thumbnail }} style={styles.serviceThumbnail} />
              )}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{selectedService.serviceName}</Text>
                {/* Provider Name Below Service Name */}
                {providerProfile?.name && (
                  <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 2 }}>Provider: {providerProfile.name}</Text>
                )}
                {selectedService.description && (
                  <Text style={styles.serviceDescription} numberOfLines={2}>{selectedService.description}</Text>
                )}
                <Text style={styles.serviceDuration}>{selectedService.durationMin} min</Text>
                {selectedService.workingHours && (
                  <Text style={{ color: '#ec4899', fontSize: 13, marginTop: 2 }}>🕒 {selectedService.workingHours}</Text>
                )}
              </View>
              <View style={styles.serviceRight}>
                <Text style={styles.servicePrice}>Rs {selectedService.price}</Text>
                <View style={[styles.radio, styles.radioSelected]}>
                  <View style={styles.radioDot} />
                </View>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#ec4899', textAlign: 'center', marginVertical: 16 }}>
              No service selected.
            </Text>
          )}
        </View>

        {selectedService && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details / Notes</Text>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>{selectedService.serviceName}</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, backgroundColor: '#fff', minHeight: 40 }}
                placeholder={'Add any special instructions...'}
                value={serviceNotes[selectedService._id] || ''}
                onChangeText={text => setServiceNotes(prev => ({ ...prev, [selectedService._id]: text }))}
                multiline
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of People</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => setGroupSize(Math.max(1, groupSize - 1))} style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
              <Text style={{ fontSize: 22, color: '#ec4899', fontWeight: 'bold' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', minWidth: 32, textAlign: 'center' }}>{groupSize}</Text>
            <TouchableOpacity onPress={() => setGroupSize(groupSize + 1)} style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
              <Text style={{ fontSize: 22, color: '#ec4899', fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedService && (
          <View style={styles.section}>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              {(selectedDate || selectedTime) && (
                <Text style={{ fontSize: 16, color: '#ec4899', fontWeight: 'bold' }}>
                  Selected: {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
                  {selectedDate && selectedTime ? ' ' : ''}
                  {selectedTime ? `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}` : ''}
                </Text>
              )}
            </View>
            <View style={styles.timePickerRow}>
              <TouchableOpacity
                style={selectedDate ? [styles.timePickerButton, styles.timePickerButtonActive, {shadowColor:'#ec4899',shadowOpacity:0.15,shadowRadius:8,elevation:3}] : styles.timePickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.85}
              >
                <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                  <Feather name="calendar" size={22} color="#fff" style={{backgroundColor:'#ec4899',borderRadius:8,padding:4}} />
                  <Text style={[styles.timePickerText,{fontWeight:'bold',fontSize:17,color:'#ec4899'}]}>
                    {selectedDate
                      ? `${new Date(selectedDate).toLocaleDateString()} ${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`
                      : 'Select Date & Time'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {showDatePicker && (
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContainer}>
            <Text style={styles.customModalTitle}>Select Date & Time</Text>
            <View style={styles.customModalRowHorizontal}>
              <View style={styles.customModalCol}>
                <WheelPicker
                  data={Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))}
                  selectedValue={selectedDate ? new Date(selectedDate).getDate().toString().padStart(2, '0') : new Date().getDate().toString().padStart(2, '0')}
                  onValueChange={day => {
                    const d = new Date(selectedDate || new Date());
                    d.setDate(Number(day));
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  style={{ height: 28, width: 40, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                  itemStyle={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 15, color: '#1e293b' }}
                  selectedItemStyle={{ backgroundColor: 'transparent', color: '#ec4899', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}
                />
                <Text style={styles.customModalLabel}>Day</Text>
              </View>
              <View style={styles.customModalCol}>
                <WheelPicker
                  data={Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))}
                  selectedValue={selectedDate ? (new Date(selectedDate).getMonth() + 1).toString().padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0')}
                  onValueChange={month => {
                    const d = new Date(selectedDate || new Date());
                    d.setMonth(Number(month) - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  style={{ height: 28, width: 40, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                  itemStyle={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 15, color: '#1e293b' }}
                  selectedItemStyle={{ backgroundColor: 'transparent', color: '#ec4899', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}
                />
                <Text style={styles.customModalLabel}>Month</Text>
              </View>
              <View style={styles.customModalCol}>
                <WheelPicker
                  data={['2025', '2026']} 
                  selectedValue={selectedDate ? new Date(selectedDate).getFullYear().toString() : new Date().getFullYear().toString()}
                  onValueChange={year => {
                    const d = new Date(selectedDate || new Date());
                    d.setFullYear(Number(year));
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  style={{ height: 28, width: 56, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                  itemStyle={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 15, color: '#1e293b', alignSelf: 'center' }}
                  selectedItemStyle={{ backgroundColor: 'transparent', color: '#ec4899', fontWeight: 'bold', fontSize: 16, textAlign: 'center', alignSelf: 'center' }}
                />
                <Text style={styles.customModalLabel}>Year</Text>
              </View>
            </View>
            
            <View style={[styles.customModalRowHorizontal, { marginTop: 15 }]}> 
              <View style={styles.customModalCol}>
                <WheelPicker
                  data={Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))}
                  selectedValue={selectedTime.hour}
                  onValueChange={hour => setSelectedTime(t => ({ ...t, hour }))}
                  style={{ height: 28, width: 40, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                  itemStyle={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 15, color: '#1e293b' }}
                  selectedItemStyle={{ backgroundColor: 'transparent', color: '#ec4899', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}
                />
                <Text style={styles.customModalLabel}>Hour</Text>
              </View>
              <View style={styles.customModalCol}>
                <WheelPicker
                  data={Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))}
                  selectedValue={selectedTime.minute}
                  onValueChange={minute => setSelectedTime(t => ({ ...t, minute }))}
                  style={{ height: 28, width: 40, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                  itemStyle={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 15, color: '#1e293b' }}
                  selectedItemStyle={{ backgroundColor: 'transparent', color: '#ec4899', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}
                />
                <Text style={styles.customModalLabel}>Minute</Text>
              </View>
              <View style={styles.customModalCol}>
                <WheelPicker
                  data={['AM', 'PM']}
                  selectedValue={selectedTime.period}
                  onValueChange={period => setSelectedTime(t => ({ ...t, period }))}
                  style={{ height: 28, width: 40, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                  itemStyle={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 15, color: '#1e293b' }}
                  selectedItemStyle={{ backgroundColor: 'transparent', color: '#ec4899', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}
                />
                <Text style={styles.customModalLabel}>AM/PM</Text>
              </View>
            </View>

            <View style={styles.customModalActions}>
              <TouchableOpacity style={styles.customModalCancelSmall} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.customModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.customModalSaveSmall} onPress={() => {
                setShowDatePicker(false);
                if (!selectedDate) {
                  const now = new Date();
                  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  setSelectedDate(d.toISOString().split('T')[0]);
                }
                setDateTimeConfirmed(true);
              }}>
                <Text style={styles.customModalSaveText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {selectedService && (
        <SafeAreaView
          edges={['bottom']}
          style={[styles.bottom, { paddingBottom: (insets.bottom || 16) + 32, marginBottom: 12 }]}
        >
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>1 service</Text>
            <Text style={styles.summaryValue}>Rs {totalPrice}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[styles.continueBtn, !dateTimeConfirmed && styles.continueBtnDisabled]}
              onPress={handleContinue}
              disabled={!dateTimeConfirmed}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f2fe' },
  scroll: { flex: 1 },
  section: { padding: 20, backgroundColor: '#fff', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1e293b' },
  modeRow: { flexDirection: 'row', gap: 12 },
  modeBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  modeBtnActive: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  modeBtnText: { textAlign: 'center', fontWeight: '600', color: '#64748b' },
  modeBtnTextActive: { color: '#ec4899' },
  serviceCard: { flexDirection: 'row', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, backgroundColor: '#fff', gap: 12, alignItems: 'flex-start' },
  serviceCardSelected: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  serviceThumbnail: { width: 80, height: 80, borderRadius: 8 },
  serviceInfo: { flex: 1, justifyContent: 'space-between' },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  serviceDescription: { fontSize: 13, color: '#64748b', marginBottom: 4, lineHeight: 18 },
  serviceDuration: { fontSize: 14, color: '#64748b' },
  serviceRight: { alignItems: 'flex-end', gap: 8 },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#ec4899' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  radioSelected: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ec4899' },
  timePickerRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  timePickerButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, gap: 8 },
  timePickerButtonActive: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  timePickerText: { fontSize: 16, color: '#1e293b' },
  bottom: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: { fontSize: 16, color: '#64748b' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  continueBtn: { backgroundColor: '#ec4899', padding: 16, borderRadius: 12, alignItems: 'center', minWidth: 120 },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  customModalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 99
  },
  customModalContainer: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', width: '85%'
  },
  customModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
  customModalRowHorizontal: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  customModalCol: { alignItems: 'center' },
  customModalLabel: { fontSize: 12, color: '#64748b', marginTop: 8 },
  customModalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  customModalCancelSmall: { flex: 0.7, paddingVertical: 8, paddingHorizontal: 0, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', minWidth: 60 },
  customModalSaveSmall: { flex: 0.7, paddingVertical: 8, paddingHorizontal: 0, borderRadius: 8, backgroundColor: '#ec4899', alignItems: 'center', minWidth: 60 },
  customModalCancelText: { color: '#64748b', fontWeight: '600' },
  customModalSaveText: { color: '#fff', fontWeight: '600' }
});