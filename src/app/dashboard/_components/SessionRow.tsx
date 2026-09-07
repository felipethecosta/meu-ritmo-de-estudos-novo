'use client'

import { useState } from 'react'
import { updateSession, deleteSession, toggleSession } from '@/lib/actions'
import { WEEKDAYS, type Subject, type StudySession } from '@/lib/types'

interface Props {
  session: StudySession
  subject: Subject | undefined
  subjects: Subject[]
}

export function SessionRow({ session, subject, subjects }: Props) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="session">
        <span className="dot" style={{ background: subject?.color ?? '#666' }} />
        <form
          action={async (fd) => {
            await updateSession(fd)
            setEditing(false)
          }}
          className="row"
          style={{ flex: 1, gridColumn: '2 / span 2' }}
        >
          <input type="hidden" name="id" value={session.id} />
          <select name="subjectId" defaultValue={session.subjectId} required>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select name="day" defaultValue={session.day} required>
            {WEEKDAYS.map((w) => (
              <option key={w.key} value={w.key}>{w.label}</option>
            ))}
          </select>
          <input type="time" name="time" defaultValue={session.time} required />
          <input
            type="number"
            name="durationMinutes"
            defaultValue={session.durationMinutes}
            min={5}
            max={480}
            step={5}
            required
            style={{ width: 80 }}
          />
          <button type="submit" className="primary">Salvar</button>
          <button type="button" className="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={`session${session.done ? ' done' : ''}`}>
      <form action={toggleSession} title={session.done ? 'Marcar como não concluída' : 'Marcar como concluída'}>
        <input type="hidden" name="id" value={session.id} />
        <button
          type="submit"
          className="ghost"
          aria-label={session.done ? 'Desmarcar' : 'Marcar como concluída'}
          style={{
            width: 28,
            height: 28,
            padding: 0,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            borderColor: session.done ? 'var(--success)' : 'var(--border)',
            background: session.done ? 'var(--success)' : 'transparent',
            color: 'white',
          }}
        >
          {session.done ? '✓' : ''}
        </button>
      </form>
      <div>
        <div className="title">{subject?.name ?? 'Matéria removida'}</div>
        <div className="meta">
          {session.time} · {session.durationMinutes} min
          {session.done && <> · <span className="pill done">Concluído</span></>}
        </div>
      </div>
      <div className="actions">
        <button type="button" className="ghost" onClick={() => setEditing(true)}>
          Editar
        </button>
        <form
          action={deleteSession}
          onSubmit={(e) => {
            if (!confirm('Excluir esta sessão?')) e.preventDefault()
          }}
        >
          <input type="hidden" name="id" value={session.id} />
          <button type="submit" className="danger">Excluir</button>
        </form>
      </div>
    </div>
  )
}
