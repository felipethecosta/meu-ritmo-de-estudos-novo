import './globals.css'

export const metadata = {
  title: 'Meu Ritmo de Estudos',
  description: 'Organize suas matérias e sessões de estudo da semana.',
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
