export function shouldForceNumericGuard(text: string): boolean {
  const numbers = text.match(/\b\d+[\d\/.:-]*\b/g);
  return (numbers?.length ?? 0) >= 2;
}

export function selectModelForTurn({ forceNumeric }: { forceNumeric: boolean }): 'gpt-4o' | 'o4-mini' {
  return forceNumeric ? 'gpt-4o' : 'gpt-4o';
}

export function normalizeNumbersIfNeeded(userText: string, draft: string): { text: string; flag: boolean } {
  const userNumeric = shouldForceNumericGuard(userText);
  const draftNumeric = shouldForceNumericGuard(draft);
  if (userNumeric || draftNumeric) {
    // Minimal placeholder: return as-is but flag true. In production, re-ask model to restate quantities.
    return { text: draft, flag: true };
  }
  return { text: draft, flag: false };
}



