'use client'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h1>Algo deu errado</h1>
        <p>{error.message}</p>
        <a href="/">Voltar ao início</a>
      </body>
    </html>
  )
}
