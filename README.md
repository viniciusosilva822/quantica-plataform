# Vida Quântica — Plataforma do Aluno

Plataforma web (área do aluno) oferecida como bônus exclusivo para quem adquire o curso **Vida Quântica** na Hotmart. Não é uma plataforma de venda — o aluno só acessa após a compra ser confirmada.

## Funcionalidades

### Engajamento diário
- **Check-in quântico** — registra frequência, humor e energia. Histórico em gráfico.
- **Diário guiado** — pergunta do dia diferente, histórico privado.
- **Tracker de hábitos** — heatmap de 7 dias, hábitos personalizáveis.
- **Tracker de meditação** — soma minutos, sessões, streak.
- **Mantra/frase do dia** — rotativa.

### Práticas
- **Player de meditações** com filtros por categoria; logging automático ao tocar.
- **Respiração guiada** visual (4-7-8, coerência cardíaca, quadrada, energização).
- **Roda da Vida** com gráfico radar e histórico mensal.

### Ferramentas simbólicas
- **Carta do dia** (oráculo de 22 cartas) — uma por dia por aluno.
- **Mapa numerológico** — cálculo a partir de nome + data de nascimento.
- **Diagnóstico de chakras** — 21 perguntas, gráfico de 7 chakras + práticas sugeridas.
- **Eneagrama** — 27 perguntas, identifica tipo dominante.

### Conteúdo
- **Biblioteca** — e-books, áudios, vídeos e artigos exclusivos.
- **Lives & encontros** — agendamento + gravações anteriores.
- **Comunidade** — mural de gratidão / conquistas / reflexões com reações.

### Gamificação
- **Badges + XP + nível** — destrava conforme uso real (sem ranking competitivo).

### Admin
- Painel com métricas, liberação manual de acesso, gestão de mantras, meditações, conteúdos da biblioteca e lives.

### Integração Hotmart
- Webhook que cria conta + libera acesso automaticamente após compra aprovada; revoga em reembolso/chargeback.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 14 (App Router) + Tailwind |
| Backend | Fastify 5 + TypeScript |
| ORM | Prisma 5 |
| Banco | PostgreSQL |
| Auth | JWT em cookie httpOnly + bcrypt |
| Validação | Zod (compartilhada via `packages/shared`) |
| Hospedagem | Vercel (web) + Railway (api + db) |

## Estrutura

```
plataforma-quantica/
├── apps/
│   ├── web/              # Next.js → Vercel
│   └── api/              # Fastify → Railway
├── packages/
│   └── shared/           # Schemas Zod e tipos compartilhados
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## Rodando localmente

### Pré-requisitos
- Node.js 20+
- pnpm 9+
- PostgreSQL local (ou Docker)

### Setup

```bash
# 1. Clonar e instalar
pnpm install

# 2. Configurar variáveis
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# edite os arquivos com sua DATABASE_URL e JWT_SECRET

# 3. Subir banco e tabelas
pnpm --filter @plataforma/api prisma migrate dev --name init

# 4. Popular dados (mantras, prompts, meditações, badges, admin, aluno demo)
pnpm db:seed

# 5. Rodar tudo
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3333
- Login demo: `aluno@vidaquantica.com` / `demo1234`
- Admin (se `ADMIN_EMAIL`/`ADMIN_PASSWORD` definidos): aquele do `.env`

## Deploy

A imagem Docker é o caminho mais previsível — Railway detecta os `Dockerfile`s automaticamente e ignora a autodetecção do nixpacks (que falha com `workspace:*` do pnpm).

### 1. Postgres
No Railway, **+ New → Database → PostgreSQL**. Copie a `DATABASE_URL` do serviço.

### 2. API (apps/api)
**+ New → GitHub Repo** → selecione este repositório.
- Em **Settings → Source**:
  - **Root Directory**: `/`
  - **Dockerfile Path**: `apps/api/Dockerfile`
- Em **Variables**: `DATABASE_URL`, `JWT_SECRET`, `WEB_URL` (URL pública do front), `HOTMART_WEBHOOK_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NODE_ENV=production`.
- Em **Settings → Networking → Generate Domain** para obter a URL pública.
- Após o primeiro deploy: **Railway Run** → `pnpm db:seed` (popula mantras, prompts, meditações, badges, admin e aluno demo).

### 3. Web (apps/web)
**+ New → GitHub Repo** → mesmo repositório, novo serviço.
- Em **Settings → Source**:
  - **Root Directory**: `/`
  - **Dockerfile Path**: `apps/web/Dockerfile`
- Em **Variables**: `NEXT_PUBLIC_API_URL` = URL pública da API.
- Em **Settings → Networking → Generate Domain**.
- Volte na API e atualize `WEB_URL` com a URL do front.

> O frontend também pode ir para a Vercel se preferir — `Root Directory: apps/web`, build `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @plataforma/web build`.

## Webhook Hotmart

No painel do produto na Hotmart, configure um webhook para:

- `POST https://SUA-API.railway.app/webhooks/hotmart`
- Header `X-Hotmart-Hottok` = mesmo valor de `HOTMART_WEBHOOK_TOKEN`.
- Eventos: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `PURCHASE_CANCELED`, `PURCHASE_CHARGEBACK`.

Comportamento:
- **Aprovação**: cria usuário (se novo) + ativa Access. Senha temporária retornada no payload — envie ao aluno (ou implemente fluxo de "esqueci a senha").
- **Reembolso/cancelamento**: marca acesso como `REFUNDED`/`CANCELLED` e bloqueia o login.

## Scripts úteis

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | sobe web + api em paralelo |
| `pnpm build` | build de ambas as apps |
| `pnpm db:migrate` | migration interativa |
| `pnpm db:push` | sincroniza schema sem migration |
| `pnpm db:seed` | popula dados de exemplo |
| `pnpm db:studio` | abre Prisma Studio |

## Próximos passos sugeridos
- Fluxo "esqueci minha senha" (envio de e-mail de reset).
- E-mails transacionais (boas-vindas, lembrete de check-in).
- Push notifications via web push.
- Upload direto (R2/S3) para mantras e meditações em vez de URL externa.
- Aulas-bônus em vídeo com player protegido (Mux/Bunny).
