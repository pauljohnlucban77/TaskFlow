export type CollectionState = 'loading' | 'error' | 'empty' | 'content';

export function getCollectionState<T>(
  items: T[],
  loading: boolean,
  error: string | null
): CollectionState {
  if (loading) return 'loading';
  if (error) return 'error';
  return items.length === 0 ? 'empty' : 'content';
}