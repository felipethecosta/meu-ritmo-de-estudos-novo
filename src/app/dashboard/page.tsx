import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { loadData } from '@/lib/storage'
import { WEEKDAYS, type StudySession } from '@/lib/types'
import { addSession, addSubject, logout } from '@/lib/actions'
import { SubjectRow } from './_components/SubjectRow'
import { SessionRow } from './_components/SessionRow'

export const dynamic = 'force-dynamic'

function compareSessions(a: StudySession, b: StudySession) {
  return a.time.localeCompare(b.time)
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const data = await loadData(session.email)
  const subjectById = new Map(data.subjects.map((s) => [s.id, s]))
  const sessionsByDay = WEEKDAYS.map((day) => ({
    ...day,
    sessions: data.sessions
      .filter((s) => s.day === day.key)
      .sort(compareSessions),
  }))

  const total = data.sessions.length
  const done = data.sessions.filter((s) => s.done).length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  const defaultSubjectId = data.subjects[0]?.id ?? ''

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Meu Ritmo de Estudos</h1>
          <span className="user">{session.email}</span>
        </div>
        <form action={logout}>
          <button type="submit" className="ghost">
            Sair
          </button>
        </form>
      </header>

      <section className="summary">
        <div className="stat">
          <div className="label">Matérias</div>
          <div className="value">{data.subjects.length}</div>
        </div>
        <div className="stat">
          <div className="label">Sessões</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat">
          <div className="label">Concluídas</div>
          <div className="value">
            {done}
            <span
              style={{
                fontSize: '0.9rem',
                color: 'var(--muted)',
                marginLeft: 6,
                fontWeight: 500,
              }}
            >
              / {total}
            </span>
          </div>
          <div className="progress" aria-hidden>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <div className="grid-2">
        <div className="stack">
          <section className="card">
            <h2>Matérias</h2>
            <form action={addSubject} className="row" style={{ marginTop: 8 }}>
              <input
                name="name"
                placeholder="Nova matéria (ex: Química)"
                required
                style={{ flex: 1, minWidth: 160 }}
              />
              <button type="submit" className="primary">
                Adicionar
              </button>
            </form>

            {data.subjects.length === 0 ? (
              <p className="empty" style={{ marginTop: 12 }}>
                Você ainda não cadastrou nenhuma matéria.
              </p>
            ) : (
              <ul className="subject-list" style={{ marginTop: 12 }}>
                {data.subjects.map((subject) => (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    sessionCount={
                      data.sessions.filter((s) => s.subjectId === subject.id)
                        .length
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2>Nova sessão</h2>
            {data.subjects.length === 0 ? (
              <p className="empty">
                Cadastre uma matéria primeiro para criar uma sessão.
              </p>
            ) : (
              <form action={addSession} className="form inline">
                <label>
                  Matéria
                  <select name="subjectId" defaultValue={defaultSubjectId} required>
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Dia
                  <select name="day" defaultValue="segunda" required>
                    {WEEKDAYS.map((w) => (
                      <option key={w.key} value={w.key}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Horário
                  <input type="time" name="time" defaultValue="19:00" required />
                </label>
                <label>
                  Duração (min)
                  <input
                    type="number"
                    name="durationMinutes"
                    defaultValue={60}
                    min={5}
                    max={480}
                    step={5}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="primary"
                  style={{ alignSelf: 'end' }}
                >
                  Adicionar sessão
                </button>
              </form>
            )}
          </section>
        </div>

        <section className="card">
          <h2>Semana</h2>
          <div className="week" style={{ marginTop: 8 }}>
            {sessionsByDay.map((day) => {
              const doneCount = day.sessions.filter((s) => s.done).length
              return (
                <div key={day.key} className="day">
                  <header>
                    <strong>{day.label}</strong>
                    <span className="count">
                      {day.sessions.length === 0
                        ? 'Sem sessões'
                        : `${doneCount} / ${day.sessions.length} concluídas`}
                    </span>
                  </header>
                  {day.sessions.length === 0 ? (
                    <p className="empty" style={{ margin: 0 }}>
                      Nada agendado.
                    </p>
                  ) : (
                    day.sessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        subject={subjectById.get(s.subjectId)}
                        subjects={data.subjects}
                      />
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
