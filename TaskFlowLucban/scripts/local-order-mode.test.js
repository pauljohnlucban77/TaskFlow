const test = require('node:test');
const assert = require('node:assert/strict');
const { isLocalOrderPreviewEnabled } = require('../src/utils/localOrderPreview.ts');

test('Firebase development builds never route orders into local device storage', () => {
  const previousSource = process.env.EXPO_PUBLIC_DATA_SOURCE;
  const previousDemo = process.env.EXPO_PUBLIC_DEMO_MODE;
  const previousProject = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  try {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'firebase';
    process.env.EXPO_PUBLIC_DEMO_MODE = 'true';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'freds-pies-staging';
    assert.equal(isLocalOrderPreviewEnabled(), false);
  } finally {
    if (previousSource === undefined) delete process.env.EXPO_PUBLIC_DATA_SOURCE; else process.env.EXPO_PUBLIC_DATA_SOURCE = previousSource;
    if (previousDemo === undefined) delete process.env.EXPO_PUBLIC_DEMO_MODE; else process.env.EXPO_PUBLIC_DEMO_MODE = previousDemo;
    if (previousProject === undefined) delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID; else process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = previousProject;
  }
});

test('mock mode is visibly device-only', () => {
  const previous = process.env.EXPO_PUBLIC_DATA_SOURCE;
  try {
    process.env.EXPO_PUBLIC_DATA_SOURCE = 'mock';
    assert.equal(isLocalOrderPreviewEnabled(), true);
  } finally {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_DATA_SOURCE; else process.env.EXPO_PUBLIC_DATA_SOURCE = previous;
  }
});
