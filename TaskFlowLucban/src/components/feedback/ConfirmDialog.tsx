import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!visible) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!loading) onCancel();
      return true;
    });

    return () => subscription.remove();
  }, [loading, onCancel, visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={onCancel}
            disabled={loading}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelText}>{cancelText}</Text>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            disabled={loading}
            style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.confirmText}>{confirmText}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    zIndex: 10,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
    elevation: 5,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    marginRight: Spacing.sm,
  },
  confirmButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusSm,
  },
  pressed: {
    opacity: 0.8,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  confirmText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});
