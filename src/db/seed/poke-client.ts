import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import pLimit from 'p-limit'

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const CACHE_DIR = path.join(process.cwd(), '.seed-cache')

export type PokeListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Array<{ name: string; url: string }>
}

function cachePathForUrl(url: string): string {
  const hash = createHash('sha1').update(url).digest('hex')
  return path.join(CACHE_DIR, `${hash}.json`)
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

export function createPokeClient(options: {
  noCache: boolean
  concurrency: number
}) {
  const limit = pLimit(options.concurrency)

  async function fetchJsonUncached<T>(url: string): Promise<T> {
    const maxAttempts = 8
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      })

      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const retryAfter = res.headers.get('retry-after')
        const waitMs = retryAfter
          ? Math.max(1000, Number(retryAfter) * 1000)
          : Math.min(60_000, 1000 * 2 ** (attempt - 1))
        if (attempt === maxAttempts) {
          throw new Error(
            `HTTP ${res.status} after ${maxAttempts} attempts: ${url}`,
          )
        }
        console.warn(
          `[poke-client] ${res.status} on ${url}, retry in ${waitMs}ms (attempt ${attempt})`,
        )
        await sleep(Number.isFinite(waitMs) ? waitMs : 5000)
        continue
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${url}`)
      }

      return (await res.json()) as T
    }
    throw new Error(`Unreachable: fetch failed for ${url}`)
  }

  async function fetchJson<T>(url: string): Promise<T> {
    if (!options.noCache) {
      await mkdir(CACHE_DIR, { recursive: true })
      const cp = cachePathForUrl(url)
      try {
        const raw = await readFile(cp, 'utf8')
        return JSON.parse(raw) as T
      } catch {
        // miss
      }
    }

    const data = await fetchJsonUncached<T>(url)

    if (!options.noCache) {
      await mkdir(CACHE_DIR, { recursive: true })
      const cp = cachePathForUrl(url)
      await writeFile(cp, JSON.stringify(data), 'utf8')
    }

    return data
  }

  /** Network + cache; respects concurrency limiter */
  function fetchJsonLimited<T>(url: string): Promise<T> {
    return limit(() => fetchJson<T>(url))
  }

  async function listAll(
    endpoint: string,
    listLimit = 20_000,
  ): Promise<PokeListResponse['results']> {
    const url = `${POKEAPI_BASE}/${endpoint.replace(/^\//, '')}?limit=${listLimit}`
    const page = await fetchJsonLimited<PokeListResponse>(url)
    return page.results
  }

  return {
    fetchJson,
    fetchJsonLimited,
    listAll,
    base: POKEAPI_BASE,
  }
}

export type PokeClient = ReturnType<typeof createPokeClient>
