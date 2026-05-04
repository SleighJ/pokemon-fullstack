export type { Db } from '../types.ts'

const ENGLISH_LANG_NAME = 'en'

export function idFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/')
  const id = Number(parts.at(-1))
  if (!Number.isFinite(id)) {
    throw new Error(`Could not parse id from URL: ${url}`)
  }
  return id
}

type LangEntry = { language: { name: string } }

function pickEnglishString(
  entries: Array<LangEntry & Record<string, unknown>> | undefined,
  field: string,
): string | null {
  if (!entries?.length) return null
  const en = entries.find((e) => e.language.name === ENGLISH_LANG_NAME)
  const entry = en ?? entries[0]
  const v = entry[field]
  return typeof v === 'string'
    ? v.replace(/\f/g, ' ').replace(/\n/g, ' ').trim()
    : null
}

export function pickEnglishFlavorText(
  entries:
    | Array<{ language: { name: string }; flavor_text: string }>
    | undefined,
): string | null {
  return pickEnglishString(entries, 'flavor_text')
}

export function pickEnglishGenus(
  entries: Array<{ language: { name: string }; genus: string }> | undefined,
): string | null {
  return pickEnglishString(entries, 'genus')
}

export function pickEnglishShortEffect(
  entries:
    | Array<{ language: { name: string }; short_effect: string }>
    | undefined,
): string | null {
  return pickEnglishString(entries, 'short_effect')
}

export function pickEnglishEffect(
  entries: Array<{ language: { name: string }; effect: string }> | undefined,
): string | null {
  return pickEnglishString(entries, 'effect')
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

export function parseArgs(argv: string[]): {
  only: Set<string> | null
  noCache: boolean
  limit: number | null
  concurrency: number
} {
  let only: Set<string> | null = null
  let noCache = false
  let limit: number | null = null
  let concurrency = 8

  for (const arg of argv) {
    if (arg.startsWith('--only=')) {
      only = new Set(
        arg
          .slice('--only='.length)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      )
    } else if (arg === '--no-cache') {
      noCache = true
    } else if (arg.startsWith('--limit=')) {
      limit = Number(arg.slice('--limit='.length))
      if (!Number.isFinite(limit) || limit < 1) limit = null
    } else if (arg.startsWith('--concurrency=')) {
      const n = Number(arg.slice('--concurrency='.length))
      if (Number.isFinite(n) && n >= 1 && n <= 32) concurrency = n
    }
  }

  return { only, noCache, limit, concurrency }
}

export function shouldRunStage(
  only: Set<string> | null,
  stage: string,
): boolean {
  if (!only) return true
  return only.has(stage)
}

export function logProgress(
  stage: string,
  done: number,
  total: number,
  every = 50,
): void {
  if (done === total || done % every === 0 || done === 1) {
    const pct = total > 0 ? ((done / total) * 100).toFixed(1) : '100'
    console.log(`[${stage}] ${done} / ${total} (${pct}%)`)
  }
}
