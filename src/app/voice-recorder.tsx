import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { uploadVoiceNote } from '../services/audioService';

export default function VoiceRecorderScreen() {
  // 1. Initialize the new audio recorder hook
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { employeeId } = useLocalSearchParams<{ employeeId?: string }>();
  const router = useRouter();

  // Clean up if the user leaves the screen while recording
  useEffect(() => {
    return () => {
      if (isRecording) {
        recorder.stop();
      }
    };
  }, [isRecording, recorder]);

  const startRecording = async () => {
    try {
      // Request permission
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required.');
        return;
      }

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      
      // Stop recording and get the file URI
      await recorder.stop();
      const uri = recorder.uri;

      // Upload the file to Spring Boot
      if (uri && employeeId) {
        setIsUploading(true);
        await uploadVoiceNote(Number(employeeId), uri);
        Alert.alert('Success', 'Voice note saved!');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Note</Text>
      <Text style={styles.subtitle}>
        Hold the button below to record a note for this employee.
      </Text>

      <TouchableOpacity
        style={[styles.recordBtn, isRecording && styles.recordingActive]}
        onPressIn={startRecording}
        onPressOut={stopRecording}
        disabled={isUploading}
      >
        <Text style={styles.recordText}>
          {isRecording ? '🔴 Recording...' : '🎤 Hold to Record'}
        </Text>
      </TouchableOpacity>

      {isUploading && (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: '#666', fontWeight: 'bold' }}>
            Uploading...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { color: '#666', marginBottom: 50, textAlign: 'center', fontSize: 14 },
  recordBtn: { backgroundColor: '#007AFF', padding: 30, borderRadius: 100, width: 200, height: 200, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  recordingActive: { backgroundColor: '#dc3545' },
  recordText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
