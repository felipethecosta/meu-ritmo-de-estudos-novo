export type Weekday =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo'

export const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

export interface Subject {
  id: string
  name: string
  color: string
}

export interface StudySession {
  id: string
  subjectId: string
  day: Weekday
  time: string
  durationMinutes: number
  done: boolean
}

export interface UserData {
  subjects: Subject[]
  sessions: StudySession[]
}
