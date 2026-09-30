/** Whether orders should be stored on this device for a local demo. */
export function isLocalOrderPreviewEnabled(): boolean {
  if (process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock') return true;

  const isStagingProject = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.endsWith('-staging') ?? false;
  return __DEV__ && (process.env.EXPO_PUBLIC_DEMO_MODE !== 'true' || !isStagingProject);
}
