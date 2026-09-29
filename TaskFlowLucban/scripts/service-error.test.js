const { test } = require('node:test');
const assert = require('node:assert/strict');

test('a failed Firestore write propagates as a typed service error', async () => {
  const { ServiceError, runFirestore } = await import('../src/services/serviceError.ts');
  const permissionDenied = Object.assign(new Error('Missing or insufficient permissions.'), {
    code: 'permission-denied',
  });

  await assert.rejects(
    runFirestore({}, 'submit feedback', async () => {
      throw permissionDenied;
    }),
    (error) => error instanceof ServiceError
      && error.code === 'permission-denied'
      && error.message.includes('submit feedback')
  );
});

test('an empty collection selects the UI empty state, not mock content or an error', async () => {
  const { getCollectionState } = await import('../src/utils/collectionState.ts');
  assert.equal(getCollectionState([], false, null), 'empty');
  assert.equal(getCollectionState([], true, null), 'loading');
  assert.equal(getCollectionState([], false, 'Firestore unavailable'), 'error');
});