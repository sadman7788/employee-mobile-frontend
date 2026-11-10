import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { logout } from '../../services/authService';
import { fetchEmployees } from '../../services/employeeService';

export default function DashboardScreen() {
  const router = useRouter();
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchEmployees();
        setEmployeeCount(data.length);
      } catch (e) {
        console.error(e);
      }
    };
    loadStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>Admin</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Employees</Text>
        <Text style={styles.statValue}>
          {employeeCount !== null ? employeeCount : '...'}
        </Text>
      </View>

      {/* Feature Grid */}
      <Text style={styles.sectionTitle}>Management</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push('/employees' as any)}
        >
          <Text style={styles.tileIcon}>👥</Text>
          <Text style={styles.tileText}>Employees</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push('/attendance' as any)}
        >
          <Text style={styles.tileIcon}>⏱️</Text>
          <Text style={styles.tileText}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push('/camera' as any)}
        >
          <Text style={styles.tileIcon}>📸</Text>
          <Text style={styles.tileText}>Quick Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => Alert.alert('Coming Soon', 'Security logs module')}
        >
          <Text style={styles.tileIcon}>🛡️</Text>
          <Text style={styles.tileText}>Security</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: { fontSize: 14, color: '#666' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  logoutBtn: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: { color: '#D32F2F', fontWeight: '600', fontSize: 12 },
  statCard: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  statValue: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  tile: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tileIcon: { fontSize: 32, marginBottom: 8 },
  tileText: { fontSize: 14, fontWeight: '600', color: '#333' },
});