import Link from 'next/link'

export default function Home() {
  return (
    <main className="landing">
      <div>
        <h1>Meu Ritmo de Estudos</h1>
        <p>
          Cadastre suas matérias, planeje as sessões da semana com dia, horário
          e duração, e marque o que já concluiu.
        </p>
        <Link className="cta" href="/login">
          Entrar
        </Link>
      </div>
    </main>
  )
}
