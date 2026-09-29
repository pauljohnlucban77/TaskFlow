const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function runCheck(envOverrides = {}) {
  const env = {
    ...process.env,
    EXPO_PUBLIC_DATA_SOURCE: 'mock',
    NODE_ENV: 'development',
    ...envOverrides,
  };

  return spawnSync(process.execPath, [path.join(__dirname, 'check-env.js')], {
    env,
    encoding: 'utf8',
  });
}

test('passes in development mode when Firebase is not configured yet', () => {
  const result = runCheck({
    EXPO_PUBLIC_DATA_SOURCE: 'mock',
    NODE_ENV: 'development',
    EXPO_PUBLIC_FIREBASE_API_KEY: '',
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: '',
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: '',
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: '',
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '',
    EXPO_PUBLIC_FIREBASE_APP_ID: '',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK: dataSource=mock/);
});

test('fails in production when Firebase is required but missing', () => {
  const result = runCheck({
    EXPO_PUBLIC_DATA_SOURCE: 'firebase',
    NODE_ENV: 'production',
    EXPO_PUBLIC_FIREBASE_API_KEY: '',
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: '',
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: '',
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: '',
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '',
    EXPO_PUBLIC_FIREBASE_APP_ID: '',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr || result.stdout, /Firebase is required in production/i);
});

test('allows production Firebase config when values are valid', () => {
  const result = runCheck({
    EXPO_PUBLIC_DATA_SOURCE: 'firebase',
    NODE_ENV: 'production',
    EXPO_PUBLIC_FIREBASE_API_KEY: 'valid-api-key',
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'demo-project',
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-project.appspot.com',
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    EXPO_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:abc',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK: dataSource=firebase/);
});
