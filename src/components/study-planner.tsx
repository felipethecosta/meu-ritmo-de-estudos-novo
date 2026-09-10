'use client'

import { useStudyData } from '@/hooks/use-study-data'
import { formatDuration, totalMinutes } from '@/lib/study-format'
import {
  addSession,
  addSubject,
  removeSession,
  removeSubject,
  toggleSessionDone,
  updateSession,
  updateSubject,
} from '@/lib/study-storage'
import { SessionManager } from './session-manager'
import { SubjectManager } from './subject-manager'
import styles from './study-planner.module.css'

interface StudyPlannerProps {
  userEmail: string
}

export function StudyPlanner({ userEmail }: StudyPlannerProps) {
  const { data, persistence, recovered, update } = useStudyData()

  if (!data) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Carregando seu planejamento…</p>
      </main>
    )
  }

  const { subjects, sessions } = data
  const doneCount = sessions.filter((session) => session.done).length
  const pendingMinutes = totalMinutes(sessions.filter((session) => !session.done))

  const sessionCounts = sessions.reduce<Record<string, number>>((counts, session) => {
    counts[session.subjectId] = (counts[session.subjectId] ?? 0) + 1
    return counts
  }, {})

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Meu ritmo de estudos</h1>
          <p className={styles.subtitle}>{userEmail}</p>
        </div>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{subjects.length}</span>
            <span className={styles.summaryLabel}>Matérias</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {doneCount}/{sessions.length}
            </span>
            <span className={styles.summaryLabel}>Concluídas</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{formatDuration(pendingMinutes)}</span>
            <span className={styles.summaryLabel}>A estudar</span>
          </div>
        </div>
      </header>

      {persistence === 'unavailable' && (
        <p className={`${styles.notice} ${styles.noticeWarning}`}>
          Não foi possível salvar neste navegador. O planejamento vai se perder ao fechar a aba.
        </p>
      )}
      {recovered && persistence !== 'unavailable' && (
        <p className={styles.notice}>
          Os dados salvos estavam ilegíveis e foram descartados. Você pode cadastrar tudo de novo.
        </p>
      )}

      <SubjectManager
        subjects={subjects}
        sessionCounts={sessionCounts}
        onCreate={({ name, color }) => update((current) => addSubject(current, name, color))}
        onUpdate={(id, values) => update((current) => updateSubject(current, id, values))}
        onDelete={(id) => update((current) => removeSubject(current, id))}
      />

      <SessionManager
        subjects={subjects}
        sessions={sessions}
        onCreate={(values) => update((current) => addSession(current, { ...values, done: false }))}
        onUpdate={(id, values) => update((current) => updateSession(current, id, values))}
        onToggleDone={(id) => update((current) => toggleSessionDone(current, id))}
        onDelete={(id) => update((current) => removeSession(current, id))}
      />
    </main>
  )
}
