import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { createEmployee } from '../services/employeeService';

export default function AddEmployeeScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [rfid, setRfid] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const router = useRouter();

  const statuses = ['ACTIVE', 'ON_LEAVE', 'ON_BREAK', 'TERMINATED'];

  const handleSubmit = async () => {
    if (!name || !email || !department) {
      Alert.alert('Missing fields', 'Name, Email, and Department are required.');
      return;
    }
    try {
      await createEmployee({ name, email, department, rfid, status });
      Alert.alert('Success', 'Employee created');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create employee');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="email@neurosoft.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Department *</Text>
      <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="Engineering" />

      <Text style={styles.label}>RFID</Text>
      <TextInput style={styles.input} value={rfid} onChangeText={setRfid} placeholder="RFID-XXX" />

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusBtn, status === s && styles.statusBtnActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.statusText, status === s && styles.statusTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Create Employee</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statusBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  statusBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  statusText: { fontSize: 12, color: '#333' },
  statusTextActive: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, marginTop: 32 },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});