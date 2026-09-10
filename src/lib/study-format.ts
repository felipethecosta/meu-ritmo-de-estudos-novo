import { WEEK_DAYS, type StudySession, type Subject, type WeekDay } from './study-storage'

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

/** Paleta fixa para identificar as matérias sem depender do color picker nativo. */
export const SUBJECT_COLORS = [
  '#3b82f6',
  '#f97316',
  '#22c55e',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
  '#eab308',
  '#ec4899',
] as const

const DAY_ORDER = new Map<WeekDay, number>(WEEK_DAYS.map((day, index) => [day, index]))

export function sortSessions(sessions: StudySession[]): StudySession[] {
  return [...sessions].sort((a, b) => {
    const dayDiff = (DAY_ORDER.get(a.day) ?? 0) - (DAY_ORDER.get(b.day) ?? 0)
    if (dayDiff !== 0) return dayDiff
    return a.time.localeCompare(b.time)
  })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const hoursLabel = `${hours}h`
  return rest === 0 ? hoursLabel : `${hoursLabel}${String(rest).padStart(2, '0')}`
}

export function findSubject(subjects: Subject[], id: string): Subject | undefined {
  return subjects.find((subject) => subject.id === id)
}

/** Duração total planejada, usada no resumo do topo. */
export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, session) => sum + session.durationMinutes, 0)
}
