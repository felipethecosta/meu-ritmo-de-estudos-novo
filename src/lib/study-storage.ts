/**
 * Local persistence for the study organizer.
 *
 * Everything lives under a single versioned localStorage key so that a future
 * schema change can migrate (or discard) old payloads instead of crashing the
 * app with data written by a previous release.
 */

export const STORAGE_KEY = 'meu-ritmo-de-estudos:v1'
export const SCHEMA_VERSION = 1

export const WEEK_DAYS = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo',
] as const

export type WeekDay = (typeof WEEK_DAYS)[number]

export interface Subject {
  id: string
  name: string
  color: string
}

export interface StudySession {
  id: string
  subjectId: string
  day: WeekDay
  time: string
  durationMinutes: number
  done: boolean
}

export interface StudyData {
  version: number
  subjects: Subject[]
  sessions: StudySession[]
}

/** Minimal surface of the Web Storage API actually used here. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const MAX_DURATION_MINUTES = 24 * 60

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** Seed shown on the first visit so the organizer is never an empty screen. */
export function createExampleData(): StudyData {
  const math: Subject = { id: createId(), name: 'Matemática', color: '#3b82f6' }
  const history: Subject = { id: createId(), name: 'História', color: '#f97316' }

  return {
    version: SCHEMA_VERSION,
    subjects: [math, history],
    sessions: [
      {
        id: createId(),
        subjectId: math.id,
        day: 'segunda',
        time: '19:00',
        durationMinutes: 60,
        done: false,
      },
      {
        id: createId(),
        subjectId: history.id,
        day: 'quarta',
        time: '20:00',
        durationMinutes: 45,
        done: false,
      },
    ],
  }
}

export function createEmptyData(): StudyData {
  return { version: SCHEMA_VERSION, subjects: [], sessions: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWeekDay(value: unknown): value is WeekDay {
  return typeof value === 'string' && (WEEK_DAYS as readonly string[]).includes(value)
}

function sanitizeSubject(raw: unknown): Subject | null {
  if (!isRecord(raw)) return null
  const { id, name, color } = raw
  if (typeof id !== 'string' || id.length === 0) return null
  if (typeof name !== 'string' || name.trim().length === 0) return null

  return {
    id,
    name: name.trim(),
    color: typeof color === 'string' && color.length > 0 ? color : '#64748b',
  }
}

function sanitizeSession(raw: unknown, subjectIds: Set<string>): StudySession | null {
  if (!isRecord(raw)) return null
  const { id, subjectId, day, time, durationMinutes, done } = raw
  if (typeof id !== 'string' || id.length === 0) return null
  // A session pointing at a deleted subject would render as a ghost row.
  if (typeof subjectId !== 'string' || !subjectIds.has(subjectId)) return null
  if (!isWeekDay(day)) return null
  if (typeof time !== 'string' || !TIME_PATTERN.test(time)) return null
  if (typeof durationMinutes !== 'number' || !Number.isFinite(durationMinutes)) return null
  if (durationMinutes <= 0 || durationMinutes > MAX_DURATION_MINUTES) return null

  return {
    id,
    subjectId,
    day,
    time,
    durationMinutes: Math.round(durationMinutes),
    done: done === true,
  }
}

/**
 * Turns an untrusted payload into valid data, dropping only the broken parts.
 * Returns null when the payload is not recognizable at all.
 */
export function sanitizeStudyData(raw: unknown): StudyData | null {
  if (!isRecord(raw)) return null
  if (!Array.isArray(raw.subjects) || !Array.isArray(raw.sessions)) return null
  if (raw.version !== undefined && raw.version !== SCHEMA_VERSION) return null

  const subjects: Subject[] = []
  const seenSubjectIds = new Set<string>()
  for (const item of raw.subjects) {
    const subject = sanitizeSubject(item)
    if (!subject || seenSubjectIds.has(subject.id)) continue
    seenSubjectIds.add(subject.id)
    subjects.push(subject)
  }

  const sessions: StudySession[] = []
  const seenSessionIds = new Set<string>()
  for (const item of raw.sessions) {
    const session = sanitizeSession(item, seenSubjectIds)
    if (!session || seenSessionIds.has(session.id)) continue
    seenSessionIds.add(session.id)
    sessions.push(session)
  }

  return { version: SCHEMA_VERSION, subjects, sessions }
}

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    // Private mode / blocked cookies throw on access instead of returning null.
    return null
  }
}

export interface LoadResult {
  data: StudyData
  /** Why the caller may be looking at seed data instead of what was saved. */
  status: 'loaded' | 'first-visit' | 'corrupted' | 'unavailable'
}

export function loadStudyDataWithStatus(storage?: StorageLike): LoadResult {
  const target = resolveStorage(storage)
  if (!target) return { data: createExampleData(), status: 'unavailable' }

  let raw: string | null
  try {
    raw = target.getItem(STORAGE_KEY)
  } catch {
    return { data: createExampleData(), status: 'unavailable' }
  }

  if (raw === null) return { data: createExampleData(), status: 'first-visit' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { data: createEmptyData(), status: 'corrupted' }
  }

  const data = sanitizeStudyData(parsed)
  if (!data) return { data: createEmptyData(), status: 'corrupted' }

  return { data, status: 'loaded' }
}

export function loadStudyData(storage?: StorageLike): StudyData {
  return loadStudyDataWithStatus(storage).data
}

/** Returns false when the write failed (quota exceeded, storage blocked). */
export function saveStudyData(data: StudyData, storage?: StorageLike): boolean {
  const target = resolveStorage(storage)
  if (!target) return false

  try {
    target.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: SCHEMA_VERSION }))
    return true
  } catch {
    return false
  }
}

export function clearStudyData(storage?: StorageLike): void {
  const target = resolveStorage(storage)
  if (!target) return
  try {
    target.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do: the data was never persisted in the first place.
  }
}

export function addSubject(data: StudyData, name: string, color: string): StudyData {
  return {
    ...data,
    subjects: [...data.subjects, { id: createId(), name: name.trim(), color }],
  }
}

export function updateSubject(
  data: StudyData,
  id: string,
  patch: Partial<Omit<Subject, 'id'>>,
): StudyData {
  return {
    ...data,
    subjects: data.subjects.map((subject) =>
      subject.id === id ? { ...subject, ...patch, id: subject.id } : subject,
    ),
  }
}

/** Removing a subject also removes its sessions — no orphan rows. */
export function removeSubject(data: StudyData, id: string): StudyData {
  return {
    subjects: data.subjects.filter((subject) => subject.id !== id),
    sessions: data.sessions.filter((session) => session.subjectId !== id),
    version: data.version,
  }
}

export function addSession(data: StudyData, session: Omit<StudySession, 'id'>): StudyData {
  return { ...data, sessions: [...data.sessions, { ...session, id: createId() }] }
}

export function updateSession(
  data: StudyData,
  id: string,
  patch: Partial<Omit<StudySession, 'id'>>,
): StudyData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === id ? { ...session, ...patch, id: session.id } : session,
    ),
  }
}

export function removeSession(data: StudyData, id: string): StudyData {
  return { ...data, sessions: data.sessions.filter((session) => session.id !== id) }
}

export function toggleSessionDone(data: StudyData, id: string): StudyData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === id ? { ...session, done: !session.done } : session,
    ),
  }
}
