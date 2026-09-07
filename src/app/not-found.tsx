import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="landing">
      <div>
        <h1>Página não encontrada</h1>
        <p>O que você procurou não existe (ou já foi movido).</p>
        <Link href="/" className="cta">Voltar ao início</Link>
      </div>
    </main>
  )
}
