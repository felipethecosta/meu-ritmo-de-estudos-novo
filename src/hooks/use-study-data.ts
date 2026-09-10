'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  loadStudyDataWithStatus,
  saveStudyData,
  type StudyData,
} from '@/lib/study-storage'

export type PersistenceState = 'loading' | 'saved' | 'unavailable'

export interface UseStudyData {
  /** null enquanto o localStorage ainda nao foi lido (primeiro render no servidor). */
  data: StudyData | null
  persistence: PersistenceState
  /** true quando o payload salvo estava corrompido e foi descartado. */
  recovered: boolean
  update: (updater: (current: StudyData) => StudyData) => void
}

/**
 * Le o planejamento do localStorage na montagem e regrava a cada alteracao.
 * A leitura acontece em efeito (e nao no initializer do useState) para que o
 * HTML do servidor e o primeiro render do cliente sejam iguais.
 */
export function useStudyData(): UseStudyData {
  const [data, setData] = useState<StudyData | null>(null)
  const [persistence, setPersistence] = useState<PersistenceState>('loading')
  const [recovered, setRecovered] = useState(false)

  useEffect(() => {
    const result = loadStudyDataWithStatus()
    setRecovered(result.status === 'corrupted')
    setData(result.data)
  }, [])

  useEffect(() => {
    if (!data) return
    setPersistence(saveStudyData(data) ? 'saved' : 'unavailable')
  }, [data])

  const update = useCallback((updater: (current: StudyData) => StudyData) => {
    setData((current) => (current ? updater(current) : current))
  }, [])

  return { data, persistence, recovered, update }
}
