import { Platform } from 'react-native';

export function triggerLocalNotification(title: string, message: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else {
      console.log(`[Notification Web] ${title}: ${message}`);
    }
  } else {
    console.log(`[Notification Mobile] ${title}: ${message}`);
  }
}
