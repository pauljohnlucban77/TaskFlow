import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from '../ui/IconButton';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AnnouncementBellProps {
  unreadCount: number;
  onPress: () => void;
}

export function AnnouncementBell({ unreadCount, onPress }: AnnouncementBellProps) {
  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <View style={styles.container}>
      <IconButton
        icon="notifications-outline"
        onPress={onPress}
        accessibilityLabel={`Announcements, ${unreadCount} unread`}
      />
      {unreadCount > 0 && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>{displayCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
});
