'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from './session'
import {
  loadData,
  saveData,
  newId,
  WEEKDAYS,
  type Weekday,
} from './storage'

async function requireEmail(): Promise<string> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session.email
}

function normalizeTime(raw: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw)
  if (!match) return '00:00'
  const h = Math.max(0, Math.min(23, Number(match[1])))
  const m = Math.max(0, Math.min(59, Number(match[2])))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function isWeekday(v: string): v is Weekday {
  return WEEKDAYS.some((w) => w.key === v)
}

const PALETTE = [
  '#3b82f6',
  '#f97316',
  '#10b981',
  '#a855f7',
  '#ef4444',
  '#eab308',
  '#06b6d4',
  '#ec4899',
]

export async function addSubject(formData: FormData) {
  const email = await requireEmail()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  const data = await loadData(email)
  const color = PALETTE[data.subjects.length % PALETTE.length]
  data.subjects.push({ id: newId(), name, color })
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function updateSubject(formData: FormData) {
  const email = await requireEmail()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  if (!id || !name) return
  const data = await loadData(email)
  const subject = data.subjects.find((s) => s.id === id)
  if (!subject) return
  subject.name = name
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function deleteSubject(formData: FormData) {
  const email = await requireEmail()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const data = await loadData(email)
  data.subjects = data.subjects.filter((s) => s.id !== id)
  data.sessions = data.sessions.filter((s) => s.subjectId !== id)
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function addSession(formData: FormData) {
  const email = await requireEmail()
  const subjectId = String(formData.get('subjectId') ?? '')
  const day = String(formData.get('day') ?? '')
  const time = normalizeTime(String(formData.get('time') ?? ''))
  const durationMinutes = Math.max(
    5,
    Math.min(480, Number(formData.get('durationMinutes') ?? 30)),
  )
  if (!subjectId || !isWeekday(day)) return
  const data = await loadData(email)
  if (!data.subjects.find((s) => s.id === subjectId)) return
  data.sessions.push({
    id: newId(),
    subjectId,
    day,
    time,
    durationMinutes,
    done: false,
  })
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function updateSession(formData: FormData) {
  const email = await requireEmail()
  const id = String(formData.get('id') ?? '')
  const subjectId = String(formData.get('subjectId') ?? '')
  const day = String(formData.get('day') ?? '')
  const time = normalizeTime(String(formData.get('time') ?? ''))
  const durationMinutes = Math.max(
    5,
    Math.min(480, Number(formData.get('durationMinutes') ?? 30)),
  )
  if (!id || !subjectId || !isWeekday(day)) return
  const data = await loadData(email)
  const session = data.sessions.find((s) => s.id === id)
  if (!session) return
  if (!data.subjects.find((s) => s.id === subjectId)) return
  session.subjectId = subjectId
  session.day = day
  session.time = time
  session.durationMinutes = durationMinutes
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function toggleSession(formData: FormData) {
  const email = await requireEmail()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const data = await loadData(email)
  const session = data.sessions.find((s) => s.id === id)
  if (!session) return
  session.done = !session.done
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function deleteSession(formData: FormData) {
  const email = await requireEmail()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const data = await loadData(email)
  data.sessions = data.sessions.filter((s) => s.id !== id)
  await saveData(email, data)
  revalidatePath('/dashboard')
}

export async function logout() {
  const { cookies } = await import('next/headers')
  const store = await cookies()
  const { SESSION_COOKIE } = await import('./session')
  store.delete(SESSION_COOKIE)
  redirect('/login')
}
