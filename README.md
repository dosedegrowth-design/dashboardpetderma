# Petderma — Painel Comercial

Dashboard comercial da Petderma (clínica de dermatologia veterinária) a partir dos dados do CRM Kommo.

## Arquitetura
```
Webhook Kommo (n8n) → Edge Function petderma-ingest → Supabase (schema petderma) → este painel (Next.js/Vercel)
                       Edge Function petderma-backfill (estado atual, sob demanda) ↗
```
- **Banco**: Supabase projeto DDG `hkjukobqpjezhpxzplpj`, schema **`petderma`** (exposto no PostgREST; acesso só via service role server-side — anon revogado).
- **Dados**: `eventos_raw` (append-only) + `leads`, `stage_history`, `mensagens`, `contatos`, `conversas`, `stages`, `usuarios`.
- **Tempo real**: webhook do Kommo alimenta via `petderma-ingest`. **Backfill**: `petderma-backfill` (POST `{token}`, header `x-ingest-secret`) puxa o estado atual via API Kommo.

## Conversão
- "CONSULTA REALIZADA" = pipeline **13533947** ("Agendamento") status **142**. Campo `leads.ganho`.
- ⚠️ 142/143 se repetem em todos os pipelines → `stages` tem PK composta (pipeline_id, status_id).

## Identidade visual (site petderma.com.br)
- Verde `#55C48B` · Navy/teal `#00345A` · Teal `#0A768F` · Tinta `#180A32` · Muted `#7E7986` · Mint `#F0FFFB` · Fonte Archivo.

## Páginas
- `/` Visão Geral (KPIs, novos leads/mês, funil de atendimento, consultas recentes)
- `/funil` funil por etapa (Atendimento + Agendamento)
- `/leads` lista dos últimos leads
- `/consultas` consultas realizadas + valor/ticket

## Rodar local
```bash
npm install
npm run dev   # porta 3000 (use PORT=3007 se 3000 ocupada)
```
`.env.local`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASH_PASSWORD`.

## Auth
Senha única via `DASH_PASSWORD` (middleware + cookie `ptd_auth`). Tela `/login`.

## Deploy
Vercel projeto `petderma-dashboard` (time dose-de-growths-projects). Env nas 3 envs. `vercel --prod`.

## Pendências / próximos
- Tela de Atendimento (tempo de 1ª resposta, conversas paradas) e Produtividade por atendente (já temos `mensagens`, `usuarios`, `responsavel_id`).
- Timeline do lead (stage_history + mensagens).
- Filtros (período, atendente, tag) na lista de leads.
- Cron de re-backfill (opcional) ou confiar no webhook incremental.
- Domínio próprio (ex: painel.petderma...) se o cliente for acessar.
