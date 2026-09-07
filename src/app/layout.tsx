import './globals.css'

export const metadata = {
  title: 'Meu Ritmo de Estudos',
  description: 'Organize suas matérias e planeje a semana de estudos.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
