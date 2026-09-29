const requiredKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock';
const isProduction = process.env.NODE_ENV === 'production';
const missing = requiredKeys.filter((key) => {
  const value = process.env[key];
  return !value || value === 'your_api_key_here' || value.includes('your_');
});

if (dataSource === 'firebase' && isProduction && missing.length > 0) {
  console.error(
    '[Env Check] Firebase is required in production, but the following values are missing or invalid: ' +
      missing.join(', ')
  );
  process.exit(1);
}

if (dataSource === 'firebase' && missing.length > 0) {
  console.warn(
    '[Env Check] Firebase is enabled but some values are missing. Using local mock fallback in non-production mode.'
  );
}

console.log(
  `[Env Check] OK: dataSource=${dataSource}, production=${String(isProduction)}, missing=${missing.length}`
);
