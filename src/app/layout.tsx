export const metadata = {
  title: 'meu-ritmo-de-estudos-novo',
  description: 'meu-ritmo-de-estudos-novo - built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}