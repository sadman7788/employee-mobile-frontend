import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { logout } from '../../services/authService';
import { fetchEmployees, Employee, updateEmployeeStatus } from '../../services/employeeService';

export default function HrDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await updateEmployeeStatus(id, newStatus);
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      Alert.alert('Success', 'Status updated');
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.email}>{item.email}</Text>
      
      {/* HR can update status but not delete */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item.id, 'ACTIVE')}>
          <Text style={styles.btnText}>Set Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item.id, 'ON_LEAVE')}>
          <Text style={styles.btnText}>Set On Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HR Portal</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  logout: { color: 'red', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
  email: { color: '#666', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { backgroundColor: '#eee', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  btnText: { fontSize: 12, fontWeight: 'bold', color: '#333' }
});
