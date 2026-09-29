const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signOut } = require('firebase/auth');
const { connectFirestoreEmulator, doc, getDoc, getFirestore, query, collection, where, getDocs } = require('firebase/firestore');
const { connectFunctionsEmulator, getFunctions, httpsCallable } = require('firebase/functions');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

const projectId = 'freds-pies-demo-staging';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
let rulesEnvironment;
let app;
let auth;
let firestore;
let functions;

test.before(async () => {
  rulesEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'firestore.rules'), 'utf8') },
  });
  await rulesEnvironment.clearFirestore();
  await rulesEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      db.doc('products/apple-pie').set({
        name: 'Apple Pie', price: 450, category: 'pies', available: true,
        stockStatus: 'available', published: true,
      }),
      db.doc('promotions/fruit20').set({
        title: 'Fruit Pie Discount', code: 'FRUIT20', type: 'percent_off',
        active: true, discountValue: 20, minSpend: 400,
        applicableCategoryIds: ['pies'], startsAt: new Date(Date.now() - 86400000),
        endsAt: new Date(Date.now() + 86400000),
      }),
    ]);
  });

  app = initializeApp({ apiKey: 'demo-api-key', projectId, authDomain: 'localhost' }, 'checkout-emulator-test');
  auth = getAuth(app);
  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
  firestore = getFirestore(app);
  const [firestoreName, firestorePort] = firestoreHost.split(':');
  connectFirestoreEmulator(firestore, firestoreName, Number(firestorePort));
  functions = getFunctions(app, 'asia-east1');
  const [functionsName, functionsPort] = functionsHost.split(':');
  connectFunctionsEmulator(functions, functionsName, Number(functionsPort));
});

test.after(async () => {
  await rulesEnvironment?.cleanup();
  if (app) await deleteApp(app);
});

test('authenticated simulated checkout uses server prices and awards points once on retry', async () => {
  const credential = await createUserWithEmailAndPassword(auth, 'demo-customer@example.com', 'DemoPass123!');
  const checkout = httpsCallable(functions, 'completeDemoCheckout');
  const request = {
    items: [{ productId: 'apple-pie', quantity: 2 }],
    promoCode: 'FRUIT20',
    requestId: 'checkout_request_123456',
  };

  const first = (await checkout(request)).data;
  const retry = (await checkout(request)).data;
  assert.equal(first.orderId, retry.orderId);
  assert.equal(first.paymentMode, 'simulated');
  assert.equal(first.status, 'demo_confirmed');
  assert.equal(first.subtotal, 900);
  assert.equal(first.discount, 180);
  assert.equal(first.total, 720);
  assert.equal(first.pointsAwarded, 7);

  const customer = await getDoc(doc(firestore, 'customers', credential.user.uid));
  assert.equal(customer.data().points, 7);
  const earned = await getDocs(query(
    collection(firestore, 'loyalty_transactions'),
    where('customerId', '==', credential.user.uid),
    where('type', '==', 'earned')
  ));
  assert.equal(earned.size, 1);

  await assert.rejects(checkout({ ...request, requestId: 'checkout_request_223456', total: 1 }), /Only product IDs/);
  await signOut(auth);
  await assert.rejects(checkout({ ...request, requestId: 'checkout_request_323456' }), /Sign in/);
});

test('checkout rejects unavailable products and expired promotions without creating an order', async () => {
  await rulesEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.doc('products/sold-pie').set({
      name: 'Sold Pie', price: 100, category: 'pies', available: false,
      stockStatus: 'sold_out', published: true,
    });
    await db.doc('promotions/expired').set({
      title: 'Expired', code: 'EXPIRED', type: 'amount_off', active: true,
      discountValue: 50, startsAt: new Date(Date.now() - 86400000),
      endsAt: new Date(Date.now() - 1000),
    });
  });

  const credential = await createUserWithEmailAndPassword(auth, 'demo-checkout-invalid@example.com', 'DemoPass123!');
  const checkout = httpsCallable(functions, 'completeDemoCheckout');
  await assert.rejects(checkout({
    items: [{ productId: 'sold-pie', quantity: 1 }], requestId: 'invalid_soldpie_123456',
  }), (error) => /unavailable/i.test(error.message));
  await assert.rejects(checkout({
    items: [{ productId: 'apple-pie', quantity: 1 }], promoCode: 'EXPIRED',
    requestId: 'invalid_expired_123456',
  }), (error) => /expired/i.test(error.message));
  const orders = await getDocs(query(collection(firestore, 'orders'), where('customerId', '==', credential.user.uid)));
  assert.equal(orders.size, 0);
  const customer = await getDoc(doc(firestore, 'customers', credential.user.uid));
  assert.equal(customer.exists(), false);
});
