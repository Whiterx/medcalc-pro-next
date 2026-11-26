import { describe, expect, it } from 'vitest'
import {
  addCalculationHistory,
  addRiskBasketItem,
  CALCULATION_HISTORY_KEY,
  CALCULATION_HISTORY_LIMIT,
  clearCalculationHistory,
  clearRiskBasket,
  readCalculationHistory,
  readRiskBasket,
  RISK_BASKET_KEY,
  RISK_BASKET_LIMIT,
} from './resultCollections'

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

const validPaths = ['/calculators/news2', '/calculators/sofa']

const sample = {
  path: '/calculators/news2',
  name: 'NEWS2',
  score: '5 баллов',
  interpretation: 'Средний риск',
  riskLevel: 'moderate' as const,
}

describe('calculation history and risk basket', () => {
  it('stores only result summaries, not patient input fields', () => {
    const storage = createStorage()
    const history = addCalculationHistory(sample, validPaths, storage)
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject(sample)
    expect(storage.getItem(CALCULATION_HISTORY_KEY)).not.toContain('patient')
    expect(storage.getItem(CALCULATION_HISTORY_KEY)).not.toContain('weight')
  })

  it('keeps history in newest-first order and caps it at 50 entries', () => {
    const storage = createStorage()
    for (let i = 0; i < CALCULATION_HISTORY_LIMIT + 5; i++) {
      addCalculationHistory({ ...sample, score: String(i) }, validPaths, storage)
    }
    const history = readCalculationHistory(validPaths, storage)
    expect(history).toHaveLength(CALCULATION_HISTORY_LIMIT)
    expect(history[0].score).toBe(String(CALCULATION_HISTORY_LIMIT + 4))
  })

  it('stores risk basket separately and caps it at 12 entries', () => {
    const storage = createStorage()
    for (let i = 0; i < RISK_BASKET_LIMIT + 3; i++) {
      addRiskBasketItem({ ...sample, score: String(i) }, validPaths, storage)
    }
    const basket = readRiskBasket(validPaths, storage)
    expect(basket).toHaveLength(RISK_BASKET_LIMIT)
    expect(basket[0].score).toBe(String(RISK_BASKET_LIMIT + 2))
    expect(storage.getItem(RISK_BASKET_KEY)).not.toBeNull()
  })

  it('rejects unregistered routes and malformed records', () => {
    const storage = createStorage()
    addCalculationHistory({ ...sample, path: '/admin' }, validPaths, storage)
    storage.setItem(CALCULATION_HISTORY_KEY, JSON.stringify([{ ...sample, id: 'bad', createdAt: 'today' }]))
    expect(readCalculationHistory(validPaths, storage)).toEqual([])
  })

  it('clears history and risk basket independently', () => {
    const storage = createStorage()
    addCalculationHistory(sample, validPaths, storage)
    addRiskBasketItem(sample, validPaths, storage)
    clearCalculationHistory(storage)
    expect(readCalculationHistory(validPaths, storage)).toEqual([])
    expect(readRiskBasket(validPaths, storage)).toHaveLength(1)
    clearRiskBasket(storage)
    expect(readRiskBasket(validPaths, storage)).toEqual([])
  })

  it('handles invalid JSON and missing storage', () => {
    const storage = createStorage()
    storage.setItem(CALCULATION_HISTORY_KEY, '{broken')
    expect(readCalculationHistory(validPaths, storage)).toEqual([])
    expect(readRiskBasket(validPaths, null)).toEqual([])
    expect(addRiskBasketItem(sample, validPaths, null)).toEqual([])
  })
})
