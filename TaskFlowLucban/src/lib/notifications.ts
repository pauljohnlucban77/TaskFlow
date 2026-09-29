export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = require('expo-notifications');
    if (!Notifications?.requestPermissionsAsync) {
      return false;
    }

    const status = await Notifications.requestPermissionsAsync();
    return status?.granted === true;
  } catch {
    return false;
  }
}

export async function getNotificationToken(): Promise<string | null> {
  try {
    const Notifications = require('expo-notifications');
    if (!Notifications?.getExpoPushTokenAsync) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token?.data ?? null;
  } catch {
    return null;
  }
}

export function configureNotificationHandlers() {
  try {
    const Notifications = require('expo-notifications');
    if (!Notifications?.setNotificationHandler) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // expo-notifications is optional in Expo Go and is no-op here when unavailable.
  }
}
