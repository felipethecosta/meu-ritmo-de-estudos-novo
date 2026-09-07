import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { loadData } from '@/lib/storage'
import { WEEKDAYS } from '@/lib/types'
import { addSubject, addSession, logout } from '@/lib/actions'
import { SubjectRow } from './_components/SubjectRow'
import { SessionRow } from './_components/SessionRow'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const data = await loadData(session.email)
  const subjectById = new Map(data.subjects.map((s) => [s.id, s]))
  const totalSessions = data.sessions.length
  const doneSessions = data.sessions.filter((s) => s.done).length
  const pct = totalSessions === 0 ? 0 : Math.round((doneSessions / totalSessions) * 100)
  const totalMinutes = data.sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const doneMinutes = data.sessions
    .filter((s) => s.done)
    .reduce((sum, s) => sum + s.durationMinutes, 0)

  const sessionsByDay = new Map(WEEKDAYS.map((w) => [w.key, [] as typeof data.sessions]))
  for (const s of data.sessions) sessionsByDay.get(s.day)!.push(s)
  for (const list of sessionsByDay.values()) {
    list.sort((a, b) => a.time.localeCompare(b.time))
  }

  const sessionCountBySubject = new Map<string, number>()
  for (const s of data.sessions) {
    sessionCountBySubject.set(s.subjectId, (sessionCountBySubject.get(s.subjectId) ?? 0) + 1)
  }

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Meu Ritmo de Estudos</h1>
          <p className="user">Olá, {session.email}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="ghost">Sair</button>
        </form>
      </header>

      <section className="summary" aria-label="Resumo da semana">
        <div className="stat">
          <div className="label">Matérias</div>
          <div className="value">{data.subjects.length}</div>
        </div>
        <div className="stat">
          <div className="label">Sessões</div>
          <div className="value">{totalSessions}</div>
        </div>
        <div className="stat">
          <div className="label">Concluídas</div>
          <div className="value">{doneSessions}</div>
        </div>
        <div className="stat">
          <div className="label">Minutos concluídos</div>
          <div className="value">{doneMinutes}<span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}> / {totalMinutes}</span></div>
        </div>
        <div className="stat" style={{ gridColumn: 'span 2' }}>
          <div className="label">Progresso da semana · {pct}%</div>
          <div className="progress" aria-hidden><span style={{ width: `${pct}%` }} /></div>
        </div>
      </section>

      <div className="grid-2">
        <section className="card stack">
          <h2>Matérias</h2>
          <form action={addSubject} className="row">
            <input
              name="name"
              placeholder="Nome da matéria (ex: Física)"
              required
              style={{ flex: 1, minWidth: 160 }}
            />
            <button type="submit" className="primary">Adicionar</button>
          </form>

          {data.subjects.length === 0 ? (
            <p className="empty">Nenhuma matéria cadastrada ainda.</p>
          ) : (
            <ul className="subject-list">
              {data.subjects.map((subject) => (
                <SubjectRow
                  key={subject.id}
                  subject={subject}
                  sessionCount={sessionCountBySubject.get(subject.id) ?? 0}
                />
              ))}
            </ul>
          )}

          <div>
            <h3 style={{ marginTop: '1rem' }}>Nova sessão</h3>
            {data.subjects.length === 0 ? (
              <p className="empty">Cadastre uma matéria primeiro.</p>
            ) : (
              <form action={addSession} className="form inline">
                <label>
                  Matéria
                  <select name="subjectId" required defaultValue={data.subjects[0].id}>
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Dia
                  <select name="day" required defaultValue="segunda">
                    {WEEKDAYS.map((w) => (
                      <option key={w.key} value={w.key}>{w.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Horário
                  <input type="time" name="time" required defaultValue="19:00" />
                </label>
                <label>
                  Duração (min)
                  <input
                    type="number"
                    name="durationMinutes"
                    min={5}
                    max={480}
                    step={5}
                    defaultValue={45}
                    required
                  />
                </label>
                <button type="submit" className="primary" style={{ alignSelf: 'end' }}>
                  Agendar
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="card stack">
          <h2>Semana</h2>
          {totalSessions === 0 ? (
            <p className="empty">Nenhuma sessão agendada. Comece pelo formulário ao lado.</p>
          ) : (
            <div className="week">
              {WEEKDAYS.map((w) => {
                const list = sessionsByDay.get(w.key) ?? []
                const doneCount = list.filter((s) => s.done).length
                return (
                  <div key={w.key} className="day">
                    <header>
                      <strong>{w.label}</strong>
                      <span className="count">
                        {list.length === 0
                          ? 'livre'
                          : `${doneCount}/${list.length} concluídas`}
                      </span>
                    </header>
                    {list.length === 0 ? (
                      <p className="empty" style={{ margin: 0 }}>Sem sessões.</p>
                    ) : (
                      list.map((s) => (
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
          )}
        </section>
      </div>
    </main>
  )
}
