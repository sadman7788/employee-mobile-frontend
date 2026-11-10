import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="hr" />
      <Stack.Screen name="employee" />
      <Stack.Screen name="add-employee" options={{ headerShown: true, title: 'Add Employee' }} />
      <Stack.Screen name="camera" options={{ headerShown: true, title: 'Camera' }} />
      <Stack.Screen name="voice-recorder" options={{ headerShown: true, title: 'Record Voice Note' }} />
    </Stack>
  );
}
