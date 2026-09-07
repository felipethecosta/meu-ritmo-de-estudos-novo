'use client'

import { useState } from 'react'
import { updateSubject, deleteSubject } from '@/lib/actions'
import type { Subject } from '@/lib/types'

export function SubjectRow({ subject, sessionCount }: { subject: Subject; sessionCount: number }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="subject-item">
        <span className="dot" style={{ background: subject.color }} />
        <form
          action={async (fd) => {
            await updateSubject(fd)
            setEditing(false)
          }}
          className="row"
          style={{ flex: 1 }}
        >
          <input type="hidden" name="id" value={subject.id} />
          <input
            name="name"
            defaultValue={subject.name}
            required
            style={{ flex: 1, minWidth: 120 }}
            autoFocus
          />
          <button type="submit" className="primary">Salvar</button>
          <button type="button" className="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </form>
      </li>
    )
  }

  return (
    <li className="subject-item">
      <span className="dot" style={{ background: subject.color }} />
      <span style={{ flex: 1 }}>
        <strong>{subject.name}</strong>{' '}
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
          · {sessionCount} sess{sessionCount === 1 ? 'ão' : 'ões'}
        </span>
      </span>
      <div className="actions">
        <button type="button" className="ghost" onClick={() => setEditing(true)}>
          Editar
        </button>
        <form
          action={deleteSubject}
          onSubmit={(e) => {
            if (!confirm(`Excluir "${subject.name}" e todas as suas sessões?`)) {
              e.preventDefault()
            }
          }}
        >
          <input type="hidden" name="id" value={subject.id} />
          <button type="submit" className="danger">Excluir</button>
        </form>
      </div>
    </li>
  )
}
