export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  return {
    success: false,
    message: 'Client-side catalog seeding is disabled. Use the Admin SDK staging seeder from the deployment runbook.',
  };
}
