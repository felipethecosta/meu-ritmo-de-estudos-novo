import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import {
  STORAGE_KEY,
  addSession,
  addSubject,
  createExampleData,
  loadStudyDataWithStatus,
  removeSession,
  removeSubject,
  saveStudyData,
  toggleSessionDone,
  updateSession,
  updateSubject,
  type StorageLike,
  type StudyData,
} from './study-storage.ts'

class MemoryStorage implements StorageLike {
  private items = new Map<string, string>()

  getItem(key: string): string | null {
    return this.items.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value)
  }

  removeItem(key: string): void {
    this.items.delete(key)
  }
}

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
})

describe('loadStudyDataWithStatus', () => {
  it('devolve os exemplos de Matemática e História na primeira visita', () => {
    const { data, status } = loadStudyDataWithStatus(storage)

    assert.equal(status, 'first-visit')
    assert.deepEqual(
      data.subjects.map((subject) => subject.name),
      ['Matemática', 'História'],
    )
    for (const subject of data.subjects) {
      const sessionsOfSubject = data.sessions.filter((s) => s.subjectId === subject.id)
      assert.ok(sessionsOfSubject.length >= 1, `${subject.name} deveria ter uma sessão de exemplo`)
    }
  })

  it('recupera o que foi salvo em vez dos exemplos', () => {
    const saved = addSubject(createExampleData(), 'Biologia', '#22c55e')
    saveStudyData(saved, storage)

    const { data, status } = loadStudyDataWithStatus(storage)

    assert.equal(status, 'loaded')
    assert.deepEqual(
      data.subjects.map((subject) => subject.name),
      ['Matemática', 'História', 'Biologia'],
    )
  })

  it('descarta payload corrompido sem quebrar', () => {
    storage.setItem(STORAGE_KEY, '{ isto nao e json')

    const { data, status } = loadStudyDataWithStatus(storage)

    assert.equal(status, 'corrupted')
    assert.deepEqual(data.subjects, [])
    assert.deepEqual(data.sessions, [])
  })

  it('remove sessões que apontam para uma matéria inexistente', () => {
    const data = createExampleData()
    const orphan = { ...data.sessions[0], id: 'orphan', subjectId: 'sumiu' }
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...data, sessions: [...data.sessions, orphan] }))

    const loaded = loadStudyDataWithStatus(storage)

    assert.equal(loaded.status, 'loaded')
    assert.equal(
      loaded.data.sessions.some((session) => session.id === 'orphan'),
      false,
    )
  })
})

describe('CRUD de matérias', () => {
  it('adiciona, edita e exclui', () => {
    const withSubject = addSubject(createExampleData(), 'Química', '#a855f7')
    const created = withSubject.subjects.at(-1)!
    assert.equal(created.name, 'Química')

    const renamed = updateSubject(withSubject, created.id, { name: 'Química Orgânica' })
    assert.equal(renamed.subjects.at(-1)!.name, 'Química Orgânica')

    const removed = removeSubject(renamed, created.id)
    assert.equal(
      removed.subjects.some((subject) => subject.id === created.id),
      false,
    )
  })

  it('exclui as sessões junto com a matéria', () => {
    const data = createExampleData()
    const target = data.subjects[0]

    const removed = removeSubject(data, target.id)

    assert.equal(
      removed.sessions.some((session) => session.subjectId === target.id),
      false,
    )
    assert.equal(removed.sessions.length, data.sessions.length - 1)
  })
})

describe('CRUD de sessões', () => {
  let data: StudyData

  beforeEach(() => {
    data = createExampleData()
  })

  it('agenda uma sessão nova como pendente', () => {
    const next = addSession(data, {
      subjectId: data.subjects[0].id,
      day: 'sexta',
      time: '08:30',
      durationMinutes: 90,
      done: false,
    })
    const created = next.sessions.at(-1)!

    assert.equal(created.day, 'sexta')
    assert.equal(created.time, '08:30')
    assert.equal(created.durationMinutes, 90)
    assert.equal(created.done, false)
  })

  it('edita horário e duração mantendo o id', () => {
    const target = data.sessions[0]

    const next = updateSession(data, target.id, { time: '07:15', durationMinutes: 30 })
    const edited = next.sessions.find((session) => session.id === target.id)!

    assert.equal(edited.time, '07:15')
    assert.equal(edited.durationMinutes, 30)
  })

  it('alterna entre concluída e pendente', () => {
    const target = data.sessions[0]

    const done = toggleSessionDone(data, target.id)
    assert.equal(done.sessions.find((session) => session.id === target.id)!.done, true)

    const reopened = toggleSessionDone(done, target.id)
    assert.equal(reopened.sessions.find((session) => session.id === target.id)!.done, false)
  })

  it('exclui apenas a sessão pedida', () => {
    const target = data.sessions[0]

    const next = removeSession(data, target.id)

    assert.equal(next.sessions.length, data.sessions.length - 1)
    assert.equal(
      next.sessions.some((session) => session.id === target.id),
      false,
    )
  })
})

describe('saveStudyData', () => {
  it('persiste a alteração para a próxima abertura', () => {
    const data = createExampleData()
    const target = data.sessions[0]

    assert.equal(saveStudyData(toggleSessionDone(data, target.id), storage), true)

    const reopened = loadStudyDataWithStatus(storage)
    assert.equal(reopened.status, 'loaded')
    assert.equal(reopened.data.sessions.find((session) => session.id === target.id)!.done, true)
  })

  it('devolve false quando o navegador bloqueia a escrita', () => {
    const blocked: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    }

    assert.equal(saveStudyData(createExampleData(), blocked), false)
  })
})
