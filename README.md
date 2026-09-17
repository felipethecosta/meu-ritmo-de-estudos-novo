# meu-ritmo-de-estudos-novo

Meu Ritmo de Estudos — Novo — created by Hive

Organizador de estudos: cadastre matérias, planeje as sessões da semana e marque o
que já foi concluído. Tudo fica salvo no navegador.

## Dashboard

`/dashboard` (protegido pelo cookie de sessão) reúne:

- **Matérias** — nome + cor da paleta, com edição inline e exclusão em duas etapas.
  Excluir uma matéria remove também as sessões dela.
- **Sessões** — matéria, dia da semana, horário e duração (5–480 min), ordenadas por
  dia e hora. Podem ser editadas, excluídas e marcadas como concluídas.
- **Pendentes × Concluídas** — as concluídas saem da lista de pendentes e vão para uma
  seção própria, com estilo esmaecido e marca de check, e podem ser reabertas.
- **Resumo** — total de matérias, progresso (concluídas/total) e tempo ainda a estudar.

## Persistência

O estado vive em `localStorage`, sob a chave versionada `meu-ritmo-de-estudos:v1`:

```json
{ "version": 1, "subjects": [{ "id", "name", "color" }],
  "sessions": [{ "id", "subjectId", "day", "time", "durationMinutes", "done" }] }
```

- A leitura acontece em `useEffect` (não no initializer do `useState`) para que o HTML
  do servidor e o primeiro render do cliente sejam iguais — daí o "Carregando…" inicial.
- Cada alteração regrava o payload inteiro. Nada é debounced, então fechar a aba logo
  após uma edição não perde a edição.
- Payload corrompido ou de outra versão de schema é descartado sem quebrar o boot.
  Sessões apontando para uma matéria inexistente, com dia ou horário inválido, ou com
  duração fora da faixa são removidas na carga.
- `localStorage` bloqueado (modo privado) ou quota estourada não quebram a tela: o app
  segue funcionando em memória e avisa que o planejamento não será salvo.
- Na primeira visita o estado é semeado com **Matemática** e **História**, cada uma com
  uma sessão de exemplo.

## Desenvolvimento

O projeto usa pnpm (versão fixada em `packageManager`).

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # node:test sobre a camada de persistência
pnpm build
```

## Verificação automática

`.github/workflows/verify.yml` roda a cada pull request e a cada push na `main`:
instala com `--frozen-lockfile`, roda os testes e o build (que inclui a checagem de
tipos). Os mesmos três comandos acima reproduzem o CI localmente.
