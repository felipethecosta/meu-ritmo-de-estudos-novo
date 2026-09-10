'use client'

import { useId, useState, type FormEvent } from 'react'
import { SUBJECT_COLORS } from '@/lib/study-format'
import type { Subject } from '@/lib/study-storage'
import { ConfirmDeleteButton } from './confirm-delete-button'
import styles from './study-planner.module.css'

export interface SubjectValues {
  name: string
  color: string
}

interface SubjectFormProps {
  initialValues?: SubjectValues
  submitLabel: string
  /** Nomes ja usados, em minusculas, sem o da propria materia em edicao. */
  takenNames: string[]
  onSubmit: (values: SubjectValues) => void
  onCancel?: () => void
}

function SubjectForm({
  initialValues,
  submitLabel,
  takenNames,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  const nameId = useId()
  const [name, setName] = useState(initialValues?.name ?? '')
  const [color, setColor] = useState(initialValues?.color ?? SUBJECT_COLORS[0])
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError('Dê um nome para a matéria.')
      return
    }
    if (takenNames.includes(trimmed.toLowerCase())) {
      setError('Você já tem uma matéria com esse nome.')
      return
    }

    setError(null)
    onSubmit({ name: trimmed, color })
    if (!initialValues) {
      setName('')
      setColor(SUBJECT_COLORS[0])
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={`${styles.field} ${styles.fieldGrow}`}>
        <label className={styles.label} htmlFor={nameId}>
          Matéria
        </label>
        <input
          id={nameId}
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Geografia"
          maxLength={60}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Cor</span>
        <div className={styles.swatches}>
          {SUBJECT_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.swatch} ${option === color ? styles.swatchSelected : ''}`}
              style={{ background: option }}
              aria-label={`Usar a cor ${option}`}
              aria-pressed={option === color}
              onClick={() => setColor(option)}
            />
          ))}
        </div>
      </div>

      <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
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

interface SubjectManagerProps {
  subjects: Subject[]
  sessionCounts: Record<string, number>
  onCreate: (values: SubjectValues) => void
  onUpdate: (id: string, values: SubjectValues) => void
  onDelete: (id: string) => void
}

export function SubjectManager({
  subjects,
  sessionCounts,
  onCreate,
  onUpdate,
  onDelete,
}: SubjectManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const takenNames = (exceptId?: string) =>
    subjects
      .filter((subject) => subject.id !== exceptId)
      .map((subject) => subject.name.toLowerCase())

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Matérias</h2>
        <p className={styles.cardHint}>A cor ajuda a reconhecer a matéria na agenda.</p>
      </div>

      <SubjectForm submitLabel="Adicionar" takenNames={takenNames()} onSubmit={onCreate} />

      {subjects.length === 0 ? (
        <p className={styles.empty}>Nenhuma matéria cadastrada ainda.</p>
      ) : (
        <ul className={styles.list}>
          {subjects.map((subject) => {
            const count = sessionCounts[subject.id] ?? 0

            if (editingId === subject.id) {
              return (
                <li key={subject.id} className={styles.row}>
                  <SubjectForm
                    initialValues={{ name: subject.name, color: subject.color }}
                    submitLabel="Salvar"
                    takenNames={takenNames(subject.id)}
                    onSubmit={(values) => {
                      onUpdate(subject.id, values)
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              )
            }

            return (
              <li key={subject.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.dot} style={{ background: subject.color }} />
                  <span className={styles.rowTitle}>{subject.name}</span>
                  <span className={styles.rowMeta}>
                    {count === 1 ? '1 sessão' : `${count} sessões`}
                  </span>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSmall}`}
                    onClick={() => setEditingId(subject.id)}
                  >
                    Editar
                  </button>
                  <ConfirmDeleteButton
                    question={
                      count > 0
                        ? `Excluir ${subject.name} e ${count === 1 ? 'sua sessão' : `suas ${count} sessões`}?`
                        : `Excluir ${subject.name}?`
                    }
                    onConfirm={() => onDelete(subject.id)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
