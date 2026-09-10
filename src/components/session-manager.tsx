'use client'

import { useId, useState, type FormEvent } from 'react'
import { WEEK_DAY_LABELS, findSubject, formatDuration, sortSessions } from '@/lib/study-format'
import { WEEK_DAYS, type StudySession, type Subject, type WeekDay } from '@/lib/study-storage'
import { ConfirmDeleteButton } from './confirm-delete-button'
import styles from './study-planner.module.css'

const MIN_DURATION = 5
const MAX_DURATION = 480
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export interface SessionValues {
  subjectId: string
  day: WeekDay
  time: string
  durationMinutes: number
}

interface SessionFormProps {
  subjects: Subject[]
  initialValues?: SessionValues
  submitLabel: string
  onSubmit: (values: SessionValues) => void
  onCancel?: () => void
}

function SessionForm({
  subjects,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: SessionFormProps) {
  const fieldId = useId()
  const [subjectId, setSubjectId] = useState(initialValues?.subjectId ?? '')
  const [day, setDay] = useState<WeekDay>(initialValues?.day ?? 'segunda')
  const [time, setTime] = useState(initialValues?.time ?? '19:00')
  const [duration, setDuration] = useState(String(initialValues?.durationMinutes ?? 60))
  const [error, setError] = useState<string | null>(null)

  // A materia escolhida pode ter sido excluida em outra parte da tela.
  const selectedSubjectId = subjects.some((subject) => subject.id === subjectId)
    ? subjectId
    : (subjects[0]?.id ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSubjectId) {
      setError('Cadastre uma matéria antes de criar a sessão.')
      return
    }
    if (!TIME_PATTERN.test(time)) {
      setError('Informe um horário válido, no formato 19:00.')
      return
    }

    const durationMinutes = Number(duration)
    if (!Number.isInteger(durationMinutes) || durationMinutes < MIN_DURATION || durationMinutes > MAX_DURATION) {
      setError(`A duração deve ficar entre ${MIN_DURATION} e ${MAX_DURATION} minutos.`)
      return
    }

    setError(null)
    onSubmit({ subjectId: selectedSubjectId, day, time, durationMinutes })
  }

  return (
    // noValidate: as mensagens de erro sao as do formulario, em portugues.
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={`${styles.field} ${styles.fieldGrow}`}>
        <label className={styles.label} htmlFor={`${fieldId}-subject`}>
          Matéria
        </label>
        <select
          id={`${fieldId}-subject`}
          className={styles.select}
          value={selectedSubjectId}
          disabled={subjects.length === 0}
          onChange={(event) => setSubjectId(event.target.value)}
        >
          {subjects.length === 0 && <option value="">Nenhuma matéria</option>}
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${fieldId}-day`}>
          Dia
        </label>
        <select
          id={`${fieldId}-day`}
          className={styles.select}
          value={day}
          onChange={(event) => setDay(event.target.value as WeekDay)}
        >
          {WEEK_DAYS.map((option) => (
            <option key={option} value={option}>
              {WEEK_DAY_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${fieldId}-time`}>
          Horário
        </label>
        <input
          id={`${fieldId}-time`}
          type="time"
          className={styles.input}
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${fieldId}-duration`}>
          Duração (min)
        </label>
        <input
          id={`${fieldId}-duration`}
          type="number"
          className={styles.input}
          value={duration}
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={5}
          onChange={(event) => setDuration(event.target.value)}
        />
      </div>

      <button
        type="submit"
        className={`${styles.button} ${styles.buttonPrimary}`}
        disabled={subjects.length === 0}
      >
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" className={styles.button} onClick={onCancel}>
          Cancelar
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </form>
  )
}

interface SessionRowProps {
  session: StudySession
  subject: Subject | undefined
  onEdit: () => void
  onToggleDone: () => void
  onDelete: () => void
}

function SessionRow({ session, subject, onEdit, onToggleDone, onDelete }: SessionRowProps) {
  return (
    <li className={`${styles.row} ${session.done ? styles.rowDone : ''}`}>
      <div className={styles.rowMain}>
        {session.done && (
          <span className={styles.doneMark} aria-label="Concluída">
            ✓
          </span>
        )}
        <span className={styles.day}>{WEEK_DAY_LABELS[session.day]}</span>
        <span className={styles.time}>{session.time}</span>
        <span className={styles.chip}>
          <span className={styles.dot} style={{ background: subject?.color ?? '#64748b' }} />
          <span className={styles.rowTitle}>{subject?.name ?? 'Matéria removida'}</span>
        </span>
        <span className={styles.rowMeta}>{formatDuration(session.durationMinutes)}</span>
      </div>
      <div className={styles.rowActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSmall}`}
          onClick={onToggleDone}
        >
          {session.done ? 'Reabrir' : 'Concluir'}
        </button>
        <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={onEdit}>
          Editar
        </button>
        <ConfirmDeleteButton question="Excluir esta sessão?" onConfirm={onDelete} />
      </div>
    </li>
  )
}

interface SessionManagerProps {
  subjects: Subject[]
  sessions: StudySession[]
  onCreate: (values: SessionValues) => void
  onUpdate: (id: string, values: SessionValues) => void
  onToggleDone: (id: string) => void
  onDelete: (id: string) => void
}

export function SessionManager({
  subjects,
  sessions,
  onCreate,
  onUpdate,
  onToggleDone,
  onDelete,
}: SessionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const ordered = sortSessions(sessions)
  const pending = ordered.filter((session) => !session.done)
  const done = ordered.filter((session) => session.done)

  const renderSession = (session: StudySession) => {
    if (editingId === session.id) {
      return (
        <li key={session.id} className={styles.row}>
          <SessionForm
            subjects={subjects}
            initialValues={{
              subjectId: session.subjectId,
              day: session.day,
              time: session.time,
              durationMinutes: session.durationMinutes,
            }}
            submitLabel="Salvar"
            onSubmit={(values) => {
              onUpdate(session.id, values)
              setEditingId(null)
            }}
            onCancel={() => setEditingId(null)}
          />
        </li>
      )
    }

    return (
      <SessionRow
        key={session.id}
        session={session}
        subject={findSubject(subjects, session.subjectId)}
        onEdit={() => setEditingId(session.id)}
        onToggleDone={() => onToggleDone(session.id)}
        onDelete={() => onDelete(session.id)}
      />
    )
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Sessões da semana</h2>
        <p className={styles.cardHint}>Marque como concluída ao terminar de estudar.</p>
      </div>

      <SessionForm subjects={subjects} submitLabel="Agendar" onSubmit={onCreate} />

      {subjects.length === 0 && (
        <p className={styles.empty}>Cadastre uma matéria para poder agendar sessões.</p>
      )}

      <div className={styles.group}>
        <p className={styles.sectionLabel}>Pendentes ({pending.length})</p>
        {pending.length === 0 ? (
          <p className={styles.empty}>
            {sessions.length === 0
              ? 'Nenhuma sessão agendada.'
              : 'Tudo concluído por aqui. Bom trabalho.'}
          </p>
        ) : (
          <ul className={styles.list}>{pending.map(renderSession)}</ul>
        )}
      </div>

      {done.length > 0 && (
        <div className={styles.doneSection}>
          <p className={styles.sectionLabel}>Concluídas ({done.length})</p>
          <ul className={styles.list}>{done.map(renderSession)}</ul>
        </div>
      )}
    </section>
  )
}
