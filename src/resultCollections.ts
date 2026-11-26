export const CALCULATION_HISTORY_KEY = 'medcalc-pro-calculation-history'
export const RISK_BASKET_KEY = 'medcalc-pro-risk-basket'
export const CALCULATION_HISTORY_LIMIT = 50
export const RISK_BASKET_LIMIT = 12

export type ResultRiskLevel = 'low' | 'moderate' | 'high'

export interface SavedCalculationResult {
  id: string
  path: string
  name: string
  score: string
  interpretation: string
  riskLevel: ResultRiskLevel
  createdAt: number
}

export type NewCalculationResult = Omit<SavedCalculationResult, 'id' | 'createdAt'>

export interface ResultStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function isRiskLevel(value: unknown): value is ResultRiskLevel {
  return value === 'low' || value === 'moderate' || value === 'high'
}

function readCollection(
  key: string,
  validPaths: readonly string[],
  storage: ResultStorage | null,
  limit: number,
): SavedCalculationResult[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const valid = new Set(validPaths)
    return parsed.filter((item): item is SavedCalculationResult => {
      if (!item || typeof item !== 'object') return false
      const entry = item as Partial<SavedCalculationResult>
      return typeof entry.id === 'string'
        && typeof entry.path === 'string' && valid.has(entry.path)
        && typeof entry.name === 'string'
        && typeof entry.score === 'string'
        && typeof entry.interpretation === 'string'
        && isRiskLevel(entry.riskLevel)
        && typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt)
    }).slice(0, limit)
  } catch {
    return []
  }
}

function addToCollection(
  key: string,
  entry: NewCalculationResult,
  validPaths: readonly string[],
  storage: ResultStorage | null,
  limit: number,
): SavedCalculationResult[] {
  if (!storage || !validPaths.includes(entry.path)) return []
  const existing = readCollection(key, validPaths, storage, limit)
  const nextEntry: SavedCalculationResult = {
    ...entry,
    id: String(Date.now()),
    createdAt: Date.now(),
  }
  const next = [nextEntry, ...existing].slice(0, limit)
  try {
    storage.setItem(key, JSON.stringify(next))
  } catch {
    // Persistence is optional; a storage failure must not break calculator use.
  }
  return next
}

export function readCalculationHistory(validPaths: readonly string[], storage: ResultStorage | null) {
  return readCollection(CALCULATION_HISTORY_KEY, validPaths, storage, CALCULATION_HISTORY_LIMIT)
}

export function addCalculationHistory(entry: NewCalculationResult, validPaths: readonly string[], storage: ResultStorage | null) {
  return addToCollection(CALCULATION_HISTORY_KEY, entry, validPaths, storage, CALCULATION_HISTORY_LIMIT)
}

export function clearCalculationHistory(storage: ResultStorage | null) {
  try { storage?.removeItem(CALCULATION_HISTORY_KEY) } catch { /* Ignore unavailable storage. */ }
}

export function readRiskBasket(validPaths: readonly string[], storage: ResultStorage | null) {
  return readCollection(RISK_BASKET_KEY, validPaths, storage, RISK_BASKET_LIMIT)
}

export function addRiskBasketItem(entry: NewCalculationResult, validPaths: readonly string[], storage: ResultStorage | null) {
  return addToCollection(RISK_BASKET_KEY, entry, validPaths, storage, RISK_BASKET_LIMIT)
}

export function clearRiskBasket(storage: ResultStorage | null) {
  try { storage?.removeItem(RISK_BASKET_KEY) } catch { /* Ignore unavailable storage. */ }
}
