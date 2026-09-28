import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../context/CartContext';
import { AnnouncementsProvider } from '../context/AnnouncementsContext';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <CartProvider>
      <AnnouncementsProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen
            name="promotions/index"
            options={{ title: 'Promotions & Deals', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="promotions/[id]"
            options={{ title: 'Promotion Details', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="announcements/index"
            options={{ title: 'Bakery Announcements', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="announcements/[id]"
            options={{ title: 'Announcement', headerBackTitle: 'Back' }}
          />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>
      </AnnouncementsProvider>
    </CartProvider>
  );
}
