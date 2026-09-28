import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';

export default function ProfilePlaceholderScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="person-outline"
        title="Customer Profile Coming Soon"
        message="Account management, loyalty points, and preferences will be available in the next phase."
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
