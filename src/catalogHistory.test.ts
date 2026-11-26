import { describe, expect, it } from 'vitest'
import {
  clearRecentCalculatorPaths,
  readRecentCalculatorPaths,
  recordRecentCalculatorPath,
  RECENT_CALCULATORS_STORAGE_KEY,
} from './catalogHistory'

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

const validPaths = ['/calculators/news2', '/calculators/sofa', '/calculators/gcs']

describe('recent calculator history', () => {
  it('stores only calculator paths, never entered values or results', () => {
    const storage = createStorage()
    recordRecentCalculatorPath('/calculators/news2', validPaths, storage)
    expect(storage.getItem(RECENT_CALCULATORS_STORAGE_KEY)).toBe('["/calculators/news2"]')
  })

  it('moves a reopened calculator to the top without duplicates', () => {
    const storage = createStorage()
    recordRecentCalculatorPath('/calculators/news2', validPaths, storage)
    recordRecentCalculatorPath('/calculators/sofa', validPaths, storage)
    recordRecentCalculatorPath('/calculators/news2', validPaths, storage)
    expect(readRecentCalculatorPaths(validPaths, storage)).toEqual(['/calculators/news2', '/calculators/sofa'])
  })

  it('ignores paths that are not registered calculators', () => {
    const storage = createStorage()
    recordRecentCalculatorPath('/admin', validPaths, storage)
    expect(readRecentCalculatorPaths(validPaths, storage)).toEqual([])
  })

  it('filters stale and malformed entries from storage', () => {
    const storage = createStorage({ [RECENT_CALCULATORS_STORAGE_KEY]: JSON.stringify(['/calculators/news2', '/unknown', 42]) })
    expect(readRecentCalculatorPaths(validPaths, storage)).toEqual(['/calculators/news2'])
  })

  it('handles invalid JSON and unavailable storage safely', () => {
    const broken = createStorage({ [RECENT_CALCULATORS_STORAGE_KEY]: '{broken' })
    expect(readRecentCalculatorPaths(validPaths, broken)).toEqual([])
    expect(readRecentCalculatorPaths(validPaths, null)).toEqual([])
    expect(recordRecentCalculatorPath('/calculators/news2', validPaths, null)).toEqual([])
  })

  it('clears recent history', () => {
    const storage = createStorage({ [RECENT_CALCULATORS_STORAGE_KEY]: '["/calculators/news2"]' })
    clearRecentCalculatorPaths(storage)
    expect(readRecentCalculatorPaths(validPaths, storage)).toEqual([])
  })
})
