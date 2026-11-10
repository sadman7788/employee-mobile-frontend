import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Attendance, checkIn, checkOut } from '../../services/attendanceService';
import { Employee, fetchEmployees } from '../../services/employeeService';

export default function AttendanceScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayRecords, setTodayRecords] = useState<Attendance[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [])
  );

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selected) {
      Alert.alert('Select Employee', 'Please select an employee first.');
      return;
    }
    setSubmitting(true);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      } else {
        Alert.alert(
          'Location unavailable',
          'Check-in will proceed without GPS coordinates.'
        );
      }

      const record = await checkIn(selected.id, latitude, longitude);
      setTodayRecords((prev) => [record, ...prev]);
      
      const locationMsg = latitude && longitude 
        ? `\nLocation: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
        : '';
        
      Alert.alert(
        'Checked In', 
        `${selected.name} checked in at ${formatTime(record.checkIn)}${locationMsg}`
      );
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selected) {
      Alert.alert('Select Employee', 'Please select an employee first.');
      return;
    }
    setSubmitting(true);
    try {
      const record = await checkOut(selected.id);
      setTodayRecords((prev) =>
        prev.map((r) => (r.id === record.id ? record : r))
      );
      Alert.alert(
        'Checked Out',
        `${selected.name} worked ${record.workHours?.toFixed(2)} hours`
      );
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Check-out failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openMap = (lat: number, lng: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = 'Employee Check-in Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    }
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={[
        styles.employeeChip,
        selected?.id === item.id && styles.employeeChipActive,
      ]}
      onPress={() => setSelected(item)}
    >
      <Text
        style={[
          styles.employeeChipText,
          selected?.id === item.id && styles.employeeChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRecord = ({ item }: { item: Attendance }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordLabel}>Check-in</Text>
        <Text style={styles.recordValue}>{formatTime(item.checkIn)}</Text>
      </View>
      <View style={styles.recordHeader}>
        <Text style={styles.recordLabel}>Check-out</Text>
        <Text style={styles.recordValue}>
          {item.checkOut ? formatTime(item.checkOut) : '—'}
        </Text>
      </View>
      <View style={styles.recordHeader}>
        <Text style={styles.recordLabel}>Hours</Text>
        <Text style={styles.recordValue}>
          {item.workHours !== null ? item.workHours.toFixed(2) : '—'}
        </Text>
      </View>
      
      {/* Display clickable Location if available */}
      {item.latitude != null && item.longitude != null && (
        <TouchableOpacity
          style={styles.recordHeader}
          onPress={() => openMap(item.latitude!, item.longitude!)}
        >
          <Text style={styles.recordLabel}>Location</Text>
          <Text style={[styles.recordValue, styles.mapLink]}>
            View on Map 🗺️
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.sectionTitle}>Select Employee</Text>
      <FlatList
        horizontal
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEmployee}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      <View style={styles.selectedBox}>
        <Text style={styles.selectedLabel}>Selected</Text>
        <Text style={styles.selectedName}>
          {selected ? selected.name : 'None'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.checkInBtn]}
          onPress={handleCheckIn}
          disabled={submitting}
        >
          <Text style={styles.actionText}>
            {submitting ? '...' : 'Check In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.checkOutBtn]}
          onPress={handleCheckOut}
          disabled={submitting}
        >
          <Text style={styles.actionText}>
            {submitting ? '...' : 'Check Out'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Today's Records</Text>
      {todayRecords.length === 0 ? (
        <Text style={styles.emptyText}>
          No check-ins yet. Select an employee and tap Check In.
        </Text>
      ) : (
        <FlatList
          data={todayRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecord}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  employeeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  employeeChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  employeeChipText: { color: '#333', fontWeight: '600' },
  employeeChipTextActive: { color: '#fff' },
  selectedBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  selectedLabel: { fontSize: 12, color: '#666' },
  selectedName: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkInBtn: { backgroundColor: '#28a745' },
  checkOutBtn: { backgroundColor: '#dc3545' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  recordCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  recordLabel: { color: '#666', fontSize: 13 },
  recordValue: { fontWeight: '600', fontSize: 14 },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  mapLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});