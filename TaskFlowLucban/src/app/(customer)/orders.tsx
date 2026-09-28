import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';

export default function OrdersPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="receipt-outline"
        title="Order Tracking Coming Soon"
        message="Order history and real-time tracking will be available in the next phase."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
});
