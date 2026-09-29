export class ServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export function toServiceError(error: unknown, operation: string): Error {
  if (error instanceof ServiceError) return error;
  if (error instanceof Error && error.name === 'InsufficientPointsError') return error;

  const firebaseError = error as { code?: unknown; message?: unknown } | null;
  const code = typeof firebaseError?.code === 'string' ? firebaseError.code : 'service/unknown';
  const detail = typeof firebaseError?.message === 'string'
    ? firebaseError.message
    : 'An unexpected service error occurred.';
  return new ServiceError(code, `Unable to ${operation}. ${detail}`);
}

export async function runFirestore<T>(
  database: unknown,
  operation: string,
  request: (firestore: any) => Promise<T>
): Promise<T> {
  if (!database) {
    throw new ServiceError(
      'firebase/unavailable',
      `Unable to ${operation}. Firebase is not initialized; check the configured Firebase environment.`
    );
  }

  try {
    return await request(database);
  } catch (error) {
    throw toServiceError(error, operation);
  }
}