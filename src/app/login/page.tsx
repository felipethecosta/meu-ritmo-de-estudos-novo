export default function LoginPage() {
  return (
    <main>
      <h1>Entrar</h1>
      <form action="/api/auth/login" method="post">
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Entrar</button>
      </form>
    </main>
  )
}