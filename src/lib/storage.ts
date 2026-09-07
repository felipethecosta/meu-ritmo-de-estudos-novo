import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Subject, UserData } from './types'

export { WEEKDAYS } from './types'
export type { Weekday, Subject, StudySession, UserData } from './types'

const DATA_DIR = path.join(process.cwd(), '.data')

function fileFor(email: string) {
  const safe = email.toLowerCase().replace(/[^a-z0-9._-]+/g, '_')
  return path.join(DATA_DIR, `${safe}.json`)
}

function seed(): UserData {
  const mat: Subject = { id: randomUUID(), name: 'Matemática', color: '#3b82f6' }
  const hist: Subject = { id: randomUUID(), name: 'História', color: '#f97316' }
  return {
    subjects: [mat, hist],
    sessions: [
      {
        id: randomUUID(),
        subjectId: mat.id,
        day: 'segunda',
        time: '19:00',
        durationMinutes: 60,
        done: false,
      },
      {
        id: randomUUID(),
        subjectId: hist.id,
        day: 'quarta',
        time: '20:00',
        durationMinutes: 45,
        done: false,
      },
    ],
  }
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export async function loadData(email: string): Promise<UserData> {
  await ensureDir()
  const file = fileFor(email)
  try {
    const raw = await fs.readFile(file, 'utf8')
    const parsed = JSON.parse(raw) as UserData
    if (!parsed.subjects || !parsed.sessions) throw new Error('bad shape')
    return parsed
  } catch {
    const initial = seed()
    await fs.writeFile(file, JSON.stringify(initial, null, 2), 'utf8')
    return initial
  }
}

export async function saveData(email: string, data: UserData): Promise<void> {
  await ensureDir()
  await fs.writeFile(fileFor(email), JSON.stringify(data, null, 2), 'utf8')
}

export function newId(): string {
  return randomUUID()
}
