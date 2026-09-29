const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} = require('firebase/firestore');

const projectId = 'demo-freds-pies-rules';
let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'customers/alice'), {
        name: 'Alice', email: 'alice@example.com', points: 120, createdAt: new Date(),
      }),
      setDoc(doc(db, 'customers/bob'), {
        name: 'Bob', email: 'bob@example.com', points: 40, createdAt: new Date(),
      }),
      setDoc(doc(db, 'rewards/pie-slice'), {
        name: 'Free Slice of Pie', description: 'One slice', pointsRequired: 50, active: true,
      }),
      setDoc(doc(db, 'products/apple-pie'), { name: 'Apple Pie', published: true }),
    ]);
  });
});

after(async () => {
  await testEnvironment.cleanup();
});

test('unauthenticated clients cannot read customer data', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'customers/alice')));
});

test('users can read only their own customer profile', async () => {
  const db = testEnvironment.authenticatedContext('alice', {
    email: 'alice@example.com',
  }).firestore();
  await assertSucceeds(getDoc(doc(db, 'customers/alice')));
  await assertFails(getDoc(doc(db, 'customers/bob')));
});

test('users cannot raise their own points or modify role', async () => {
  const db = testEnvironment.authenticatedContext('alice', {
    email: 'alice@example.com',
  }).firestore();
  await assertFails(updateDoc(doc(db, 'customers/alice'), { points: 10000 }));
  await assertFails(updateDoc(doc(db, 'customers/alice'), { role: 'admin' }));
});

test('client point-award transactions are denied', async () => {
  const db = testEnvironment.authenticatedContext('alice', {
    email: 'alice@example.com',
  }).firestore();
  const customerRef = doc(db, 'customers/alice');
  const transactionRef = doc(collection(db, 'loyalty_transactions'));
  await assertFails(runTransaction(db, async (transaction) => {
    transaction.update(customerRef, { points: 100120 });
    transaction.set(transactionRef, {
      customerId: 'alice', type: 'earned', points: 100000,
      purchaseAmount: 10000000, createdAt: serverTimestamp(),
    });
  }));
});

test('catalog writes are denied to authenticated clients', async () => {
  const db = testEnvironment.authenticatedContext('alice', {
    email: 'alice@example.com',
  }).firestore();
  await assertFails(setDoc(doc(db, 'products/attacker-product'), {
    name: 'Fake Product', price: 0,
  }));
});

test('users can create their feedback but cannot delete another user\'s', async () => {
  const db = testEnvironment.authenticatedContext('alice', {
    email: 'alice@example.com',
  }).firestore();
  await assertSucceeds(setDoc(doc(db, 'feedback/alice-review'), {
    customerId: 'alice', customerName: 'Alice', rating: 5,
    comment: 'Fresh and delicious.', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'feedback/bob-review'), {
      customerId: 'bob', customerName: 'Bob', rating: 4,
      comment: 'Good.', createdAt: new Date(), updatedAt: new Date(),
    });
  });
  await assertFails(deleteDoc(doc(db, 'feedback/bob-review')));
});

test('valid redemption atomically debits points and creates its transaction', async () => {
  const db = testEnvironment.authenticatedContext('alice', {
    email: 'alice@example.com',
  }).firestore();
  const customerRef = doc(db, 'customers/alice');
  const rewardRef = doc(db, 'rewards/pie-slice');
  const transactionRef = doc(collection(db, 'loyalty_transactions'));

  await assertSucceeds(runTransaction(db, async (transaction) => {
    const customer = await transaction.get(customerRef);
    const reward = await transaction.get(rewardRef);
    assert.equal(customer.data().points, 120);
    assert.equal(reward.data().active, true);
    transaction.update(customerRef, {
      points: 70, lastRedemptionId: transactionRef.id,
    });
    transaction.set(transactionRef, {
      customerId: 'alice', type: 'redeemed', points: 50,
      rewardId: 'pie-slice', rewardName: 'Free Slice of Pie', createdAt: serverTimestamp(),
    });
  }));

  const updatedCustomer = await getDoc(customerRef);
  assert.equal(updatedCustomer.data().points, 70);
});