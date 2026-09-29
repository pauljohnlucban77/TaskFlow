const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const requiredKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

function loadEnvironment(env = process.env, envPath = path.resolve(process.cwd(), '.env')) {
  if (!fs.existsSync(envPath)) return env;

  const fileValues = dotenv.parse(fs.readFileSync(envPath));
  for (const [key, value] of Object.entries(fileValues)) {
    if (env[key] === undefined) env[key] = value;
  }
  return env;
}

function validateEnvironment(env) {
  const errors = [];
  const dataSource = env.EXPO_PUBLIC_DATA_SOURCE;

  if (dataSource !== 'mock' && dataSource !== 'firebase') {
    errors.push('EXPO_PUBLIC_DATA_SOURCE must be explicitly set to "mock" or "firebase"');
  }

  if (env.NODE_ENV === 'production' && dataSource !== 'firebase') {
    errors.push('EXPO_PUBLIC_DATA_SOURCE must be "firebase" in production');
  }

  const missing = dataSource === 'firebase'
    ? requiredKeys.filter((key) => {
        const value = env[key]?.trim();
        return !value || value.includes('your_');
      })
    : [];

  if (missing.length > 0) {
    errors.push(`Firebase values are missing or placeholders: ${missing.join(', ')}`);
  }

  return { dataSource, missing, errors };
}

function main(env = process.env, envPath = path.resolve(process.cwd(), '.env')) {
  loadEnvironment(env, envPath);
  const result = validateEnvironment(env);

  if (result.errors.length > 0) {
    console.error(`[Env Check] Invalid environment: ${result.errors.join('; ')}`);
    process.exitCode = 1;
    return result;
  }

  console.log(`[Env Check] OK: dataSource=${result.dataSource}`);
  return result;
}

if (require.main === module) main();

module.exports = { requiredKeys, loadEnvironment, validateEnvironment, main };
