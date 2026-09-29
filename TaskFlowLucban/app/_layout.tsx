import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../src/context/CartContext';
import { AnnouncementsProvider } from '../src/context/AnnouncementsContext';
import { AuthProvider } from '../src/context/AuthContext';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <AuthProvider>
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
              name="loyalty/index"
              options={{ title: 'Loyalty & Rewards', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="feedback/index"
              options={{ title: 'My Feedback', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="feedback/new"
              options={{ title: 'Give Feedback', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="feedback/[id]/edit"
              options={{ title: 'Edit Feedback', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="products/[id]"
              options={{ title: 'Product Details', headerBackTitle: 'Back' }}
            />
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
    </AuthProvider>
  );
}
