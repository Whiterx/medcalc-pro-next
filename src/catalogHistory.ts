export const RECENT_CALCULATORS_STORAGE_KEY = 'medcalc-pro-recent-calculators'
export const RECENT_CALCULATORS_LIMIT = 6

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function readRecentCalculatorPaths(validPaths: readonly string[], storage: StorageLike | null): string[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(RECENT_CALCULATORS_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const valid = new Set(validPaths)
    return [...new Set(parsed.filter((path): path is string => typeof path === 'string' && valid.has(path)))]
      .slice(0, RECENT_CALCULATORS_LIMIT)
  } catch {
    return []
  }
}

export function recordRecentCalculatorPath(
  path: string,
  validPaths: readonly string[],
  storage: StorageLike | null,
): string[] {
  if (!storage || !validPaths.includes(path)) return []
  const next = [path, ...readRecentCalculatorPaths(validPaths, storage).filter((item) => item !== path)]
    .slice(0, RECENT_CALCULATORS_LIMIT)
  try {
    storage.setItem(RECENT_CALCULATORS_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage may be disabled or full; recent history is a convenience, not a requirement.
  }
  return next
}

export function clearRecentCalculatorPaths(storage: StorageLike | null): void {
  if (!storage) return
  try {
    storage.removeItem(RECENT_CALCULATORS_STORAGE_KEY)
  } catch {
    // Ignore unavailable browser storage.
  }
}
