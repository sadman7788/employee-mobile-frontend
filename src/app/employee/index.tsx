import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { checkIn, checkOut } from '../../services/attendanceService';
import { logout } from '../../services/authService';

export default function EmployeeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Note: For this demo, we assume the logged-in employee is linked to Employee ID 1.
  const employeeId = 1; 

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat, lng;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      
      // REAL BACKEND CALL
      await checkIn(employeeId, lat, lng);
      Alert.alert('Success', 'Checked in successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // REAL BACKEND CALL
      const record = await checkOut(employeeId);
      Alert.alert('Success', `Checked out. You worked ${record.workHours?.toFixed(2)} hours.`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee Portal</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.subtitle}>Please clock in for your shift.</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleCheckIn} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Check In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#dc3545', marginTop: 15 }]} onPress={handleCheckOut} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Check Out'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  logout: { color: 'red', fontWeight: 'bold' },
  content: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8, marginBottom: 30 },
  button: { backgroundColor: '#28a745', paddingVertical: 18, width: '100%', alignItems: 'center', borderRadius: 12, elevation: 2 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
