// app/_layout.tsx (Expo Router root layout)
import { Stack } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Button } from 'react-native';
import { auth } from '../firebaseConfig';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{
        title: 'Dashboard',
        headerRight: () => (
          <Button title="Logout" onPress={() => signOut(auth)} />
        ),
      }} />
      <Stack.Screen name="favorites" options={{
        title: 'Favorites',
        headerRight: () => (
          <Button title="Logout" onPress={() => signOut(auth)} />
        ),
      }} />
      {/* other screens keep defaults */}
    </Stack>
  );
}
