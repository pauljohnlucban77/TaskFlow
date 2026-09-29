const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const requiredKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const validFirebaseValues = {
  EXPO_PUBLIC_DATA_SOURCE: 'firebase',
  EXPO_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:test',
};

function runCheck({ shellValues = {}, envFile = null } = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'freds-env-check-'));
  const env = {
    ...process.env,
    NODE_ENV: 'development',
  };
  delete env.EXPO_PUBLIC_DATA_SOURCE;
  for (const key of requiredKeys) delete env[key];
  Object.assign(env, shellValues);

  if (envFile) fs.writeFileSync(path.join(cwd, '.env'), envFile);

  try {
    return spawnSync(process.execPath, [path.join(__dirname, 'check-env.js')], {
      cwd,
      env,
      encoding: 'utf8',
    });
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
}

test('loads valid Firebase values from .env when shell variables are absent', () => {
  const envFile = Object.entries(validFirebaseValues)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const result = runCheck({ envFile });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK: dataSource=firebase/);
});

test('accepts valid Firebase values from shell when .env is absent', () => {
  const result = runCheck({ shellValues: validFirebaseValues });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK: dataSource=firebase/);
});

test('lists missing Firebase values and exits non-zero', () => {
  const result = runCheck({
    shellValues: {
      EXPO_PUBLIC_DATA_SOURCE: 'firebase',
      EXPO_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
    },
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN/);
  assert.match(result.stderr, /EXPO_PUBLIC_FIREBASE_APP_ID/);
});

test('requires an explicit supported data-source setting', () => {
  const result = runCheck();

  assert.equal(result.status, 1);
  assert.match(result.stderr, /EXPO_PUBLIC_DATA_SOURCE must be explicitly set/);
});

test('shell values override values from .env, matching Expo precedence', () => {
  const result = runCheck({
    envFile: 'EXPO_PUBLIC_DATA_SOURCE=mock',
    shellValues: validFirebaseValues,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK: dataSource=firebase/);
});

test('demo builds reject Firebase project IDs that are not staging projects', () => {
  const result = runCheck({
    shellValues: {
      ...validFirebaseValues,
      EXPO_PUBLIC_DEMO_MODE: 'true',
    },
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /ending in "-staging"/);
});
