import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE } from '../../config/api';
import { getUserRole, logout } from '../../services/authService';
import {
  deleteEmployee,
  Employee,
  fetchEmployees,
  updateEmployeeStatus,
} from '../../services/employeeService';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
      getUserRole().then(setUserRole);
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

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleLogout = async () => {
    await logout();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/');
  };

  const openStatusModal = (emp: Employee) => {
    setSelected(emp);
    setModalVisible(true);
  };

  const changeStatus = async (newStatus: string) => {
    if (!selected) return;
    try {
      const updated = await updateEmployeeStatus(selected.id, newStatus);
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setModalVisible(false);
      setSelected(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const confirmDelete = (emp: Employee) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${emp.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(emp.id);
              setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: '#28a745' };
      case 'ON_LEAVE':
        return { backgroundColor: '#ffc107' };
      case 'ON_BREAK':
        return { backgroundColor: '#17a2b8' };
      case 'TERMINATED':
        return { backgroundColor: '#dc3545' };
      default:
        return { backgroundColor: '#6c757d' };
    }
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openStatusModal(item)}
      onLongPress={() => userRole === 'ADMIN' && confirmDelete(item)}
    >
      <View style={styles.cardRow}>
        {item.photoUrl ? (
          <Image
            source={{ uri: `${API_BASE}${item.photoUrl}` }}
            style={styles.cardPhoto}
          />
        ) : (
          <View style={styles.cardPhotoPlaceholder}>
            <Text style={styles.cardPhotoPlaceholderText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={[styles.badge, statusColor(item.status)]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.detail}>{item.email}</Text>
          <Text style={styles.detail}>
            {item.department} · {item.rfid || 'No RFID'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const statuses = ['ACTIVE', 'ON_LEAVE', 'ON_BREAK', 'TERMINATED'];
  const filterOptions = ['ALL', 'ACTIVE', 'ON_LEAVE', 'ON_BREAK', 'TERMINATED'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employees</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.attendanceBtn}
            onPress={() => router.push('/camera' as any)}
          >
            <Text style={styles.attendanceBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or department"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.filterRow}>
        {filterOptions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.filterChip,
              statusFilter === s && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(s)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === s && styles.filterChipTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadEmployees} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No employees match your filter.</Text>
        }
      />

      {userRole === 'ADMIN' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-employee' as any)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selected?.name}</Text>

            {selected?.photoUrl ? (
              <Image
                source={{ uri: `${API_BASE}${selected.photoUrl}` }}
                style={styles.modalPhoto}
              />
            ) : (
              <View style={styles.modalPhotoPlaceholder}>
                <Text style={styles.modalPhotoPlaceholderText}>No photo</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => {
                setModalVisible(false);
                router.push(`/camera?employeeId=${selected?.id}` as any);
              }}
            >
              <Text style={styles.primaryActionText}>Take Photo</Text>
            </TouchableOpacity>

            {/* Added Voice Note Button */}
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: '#FF9500', marginTop: -8 }]}
              onPress={() => {
                setModalVisible(false);
                router.push(`/voice-recorder?employeeId=${selected?.id}` as any);
              }}
            >
              <Text style={styles.primaryActionText}>Record Voice Note</Text>
            </TouchableOpacity>

            <Text style={styles.modalSection}>Change Status</Text>

            {statuses.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  selected?.status === s && styles.statusOptionActive,
                ]}
                onPress={() => changeStatus(s)}
              >
                <Text style={styles.statusOptionText}>{s}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendanceBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  attendanceBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  logout: { color: '#FF3B30', fontWeight: '600' },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: { fontSize: 12, color: '#333', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  cardPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPhotoPlaceholderText: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  cardInfo: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '600', flex: 1 },
  detail: { fontSize: 14, color: '#666', marginTop: 4 },
  badge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
    minWidth: 85,
    alignItems: 'center', 
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold',
    textAlign: 'center', 
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalPhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPhotoPlaceholderText: { color: '#999', fontSize: 12 },
  primaryAction: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryActionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalSection: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  statusOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  statusOptionActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  statusOptionText: { textAlign: 'center', fontWeight: '600' },
  cancelBtn: { padding: 14, marginTop: 8 },
  cancelText: { textAlign: 'center', color: '#FF3B30', fontWeight: '600' },
});