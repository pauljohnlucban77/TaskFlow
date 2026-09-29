const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore, Timestamp } = require('firebase-admin/firestore');

function getProjectId(args) {
  const value = args.find((arg) => arg.startsWith('--project-id='))?.slice('--project-id='.length);
  if (!value || !value.endsWith('-staging')) {
    throw new Error('Pass --project-id=<your-firebase-project-id-ending-in-staging>.');
  }
  return value;
}

async function main() {
  const projectId = getProjectId(process.argv.slice(2));
  initializeApp({ credential: applicationDefault(), projectId });
  const db = getFirestore();
  const now = Date.now();
  const inDays = (days) => Timestamp.fromMillis(now + days * 86400000);

  const seed = {
    categories: {
      pies: { name: 'Pies', icon: '🥧', sortOrder: 1 },
      cakes: { name: 'Cakes', icon: '🍰', sortOrder: 2 },
      pastries: { name: 'Pastries', icon: '🥐', sortOrder: 3 },
    },
    products: {
      'apple-pie': { name: 'Classic Apple Pie', description: 'A buttery crust filled with cinnamon apples.', price: 450, category: 'pies', available: true, stockStatus: 'available', featured: true, popular: true, published: true },
      'blueberry-pie': { name: 'Wild Blueberry Pie', description: 'Blueberries baked in a golden lattice crust.', price: 480, category: 'pies', available: true, stockStatus: 'available', featured: true, popular: true, published: true },
      'chocolate-pie': { name: 'Chocolate Cream Pie', description: 'Chocolate custard with whipped cream.', price: 520, category: 'pies', available: true, stockStatus: 'low_stock', featured: true, popular: false, published: true },
      'cheesecake-slice': { name: 'Cheesecake Slice', description: 'A classic creamy cheesecake slice.', price: 180, category: 'cakes', available: true, stockStatus: 'available', featured: false, popular: true, published: true },
      croissant: { name: 'Buttery Croissant', description: 'A flaky, golden butter croissant.', price: 120, category: 'pastries', available: true, stockStatus: 'available', featured: false, popular: true, published: true },
    },
    rewards: {
      'reward-1': { name: 'Free Croissant', description: 'Redeem for one buttery croissant.', pointsRequired: 50, active: true },
      'reward-2': { name: 'Free Pie Slice', description: 'Redeem for a slice of pie.', pointsRequired: 100, active: true },
    },
    promotions: {
      'fruit20': { title: '20% Off Fruit Pies', subtitle: 'A demo offer for pie orders.', type: 'percent_off', code: 'FRUIT20', discountValue: 20, minSpend: 400, applicableCategoryIds: ['pies'], applicableProductIds: [], startsAt: inDays(-1), endsAt: inDays(30), terms: ['Demo promotion.'], active: true },
      'bakery100': { title: '₱100 Off Orders Over ₱1,000', subtitle: 'A demo offer for larger orders.', type: 'amount_off', code: 'BAKERY100', discountValue: 100, minSpend: 1000, applicableCategoryIds: [], applicableProductIds: [], startsAt: inDays(-1), endsAt: inDays(30), terms: ['Demo promotion.'], active: true },
    },
    announcements: {
      'demo-welcome': { title: 'Welcome to the Demo', message: 'Browse products and try a simulated pickup order.', body: 'This staging app does not take payment or send real orders to the bakery.', type: 'info', publishedAt: FieldValue.serverTimestamp(), pinned: true, ctaLabel: 'Browse products', ctaRoute: '/(customer)/products' },
    },
  };

  const batch = db.batch();
  for (const [collectionName, documents] of Object.entries(seed)) {
    for (const [documentId, data] of Object.entries(documents)) {
      batch.set(db.collection(collectionName).doc(documentId), data);
    }
  }
  await batch.commit();
  console.log(`Seeded synthetic demo catalog into ${projectId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
