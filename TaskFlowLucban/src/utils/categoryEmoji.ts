const CATEGORY_EMOJI: Record<string, string> = {
  pies: '🥧',
  cakes: '🎂',
  pastries: '🥐',
  bread: '🥖',
  desserts: '🍮',
  specials: '⭐',
};

/** Placeholder shown when a product has no image (or it fails to load). */
export function categoryEmoji(category?: string): string {
  return (category && CATEGORY_EMOJI[category]) || '🍞';
}