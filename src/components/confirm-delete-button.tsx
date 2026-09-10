'use client'

import { useState } from 'react'
import styles from './study-planner.module.css'

interface ConfirmDeleteButtonProps {
  question: string
  onConfirm: () => void
}

/** Exclusao em duas etapas — evita perder um cadastro com um clique acidental. */
export function ConfirmDeleteButton({ question, onConfirm }: ConfirmDeleteButtonProps) {
  const [armed, setArmed] = useState(false)

  if (!armed) {
    return (
      <button
        type="button"
        className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
        onClick={() => setArmed(true)}
      >
        Excluir
      </button>
    )
  }

  return (
    <span className={styles.confirm}>
      <span>{question}</span>
      <button
        type="button"
        className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
      >
        Confirmar
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.buttonSmall}`}
        onClick={() => setArmed(false)}
      >
        Cancelar
      </button>
    </span>
  )
}
