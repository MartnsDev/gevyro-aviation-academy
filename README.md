# Gevyro Aviation Academy

Academia pessoal para estudo de Mecânica de Manutenção Aeronáutica. O repositório contém Next.js App Router, TypeScript strict, Supabase Auth/Postgres/Storage, IndexedDB (Dexie), PDF.js, PDF-lib, OCR com Tesseract.js, PWA, conteúdo de inglês técnico, exercícios, flashcards, simulados, calculadoras, plano de estudos e exportação/recuperação.

## Execução local

Requisitos: Node 22, npm e (para Supabase local) Docker com daemon acessível.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

O modo local funciona sem credenciais e salva os dados apenas no navegador. Use um dispositivo pessoal e mantenha um backup externo. O modo local não sincroniza nem protege os dados com senha.

## Supabase

O projeto foi vinculado ao ref `bcfjhwcsulylodayczkr`. As migrations usam o prefixo `gaa_` e o bucket privado `gaa-documents`, para não colidir com as tabelas do MCELL já presente no projeto.

Confirme em `supabase/config.jsonc` que o projeto é o correto antes de rodar uma migration. Inspecione o diff e aplique:

```bash
npx supabase db query --remote --read-only "select tablename from pg_tables where schemaname='public' order by tablename"
npx supabase db push --help
```

A migration está em `supabase/migrations/20261126192859_academy_schema.sql`. Ela cria 33 tabelas próprias com RLS por `auth.uid()`, sincronização com concorrência otimista, limites e bucket PDF privado. Os originais não são substituídos. Upload TUS é direto para Storage.

Defina em `.env.local` a URL e publishable key deste projeto. A chave publishable fornecida é pública por projeto, mas pode ser rotacionada no dashboard. Não coloque service role ou senha do banco no cliente ou no git. Para disponibilizar conta, crie seu usuário no painel de Auth e mantenha o cadastro público desligado.

O projeto Supabase existente contém outros sistemas. Não renomeie, remova ou altere as respectivas tabelas. As migrations da Gevyro são independentes.

## Backup e armazenamento

Exportação ZIP inclui manifesto versionado, registros pessoais, arquivos PDF e SHA-256. A restauração valida o ZIP antes de gravar e preserva registros existentes por padrão. O navegador pode remover IndexedDB; mantenha uma cópia do ZIP em outro dispositivo.

O Supabase gratuito tem limites de armazenamento, tráfego e inatividade. Consulte os valores atuais no dashboard e nas páginas oficiais. Não configure cobrança automática. Se um projeto for pausado, abra o dashboard, restaure o projeto gratuito, entre novamente na academia e sincronize. Para migração de projeto, exporte um backup, prepare o novo projeto e restaure o ZIP.

## Login Google

A página inicial oferece somente o login com Google via Supabase OAuth e o retorno é tratado em `/auth/callback`. Para ativar o provedor, configure Google OAuth Client ID e Client Secret em Authentication → Sign In / Providers → Google no projeto Supabase. No Google Cloud, autorize `https://gevyro-aviation-academy.vercel.app` como origem e use `https://bcfjhwcsulylodayczkr.supabase.co/auth/v1/callback` como URI de redirecionamento do OAuth client. Na configuração de URLs do Supabase, permita `https://gevyro-aviation-academy.vercel.app/auth/callback` e `http://localhost:3000/auth/callback` para desenvolvimento. Os segredos ficam apenas no painel Supabase; não os coloque no cliente nem no repositório. Consulte [a configuração oficial do Supabase para Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

A foto do hangar é de [Adam Roye no Unsplash](https://unsplash.com/photos/private-jet-parked-in-a-hangar-with-sun-flare-E1oCDZQiIZU) e está indicada como gratuita sob a licença Unsplash.

## Conteúdo e segurança educacional

O app oferece 12 cadernos autorais do MMA Básico com 20 questões cada, relacionados aos PDFs fornecidos e ao currículo mínimo da IS ANAC 141-007D. São exercícios de revisão, não questões oficiais. Os gabaritos são preliminares e o material aguarda revisão técnica de instrutor. Consulte [docs/MMABAS.md](docs/MMABAS.md) para ver os temas e os limites da extração. As 12 apostilas fornecidas estão incluídas como cópias otimizadas em `public/apostilas`; os arquivos originais na pasta de origem não foram alterados. Como os PDFs são arquivos estáticos do repositório público, seus links diretos não exigem login Google. Para restringir os arquivos aos usuários autenticados, será necessário migrá-los para um bucket privado e usar URLs autenticadas.

Questões e vocabulário autorais são identificados como pendentes de revisão. A plataforma não representa simulados como provas oficiais nem inventa gabaritos oficiais.

Links da FAA e ANAC são referências de consulta; o app não copia handbooks de terceiros. Calculadoras, exemplos e glossário são educacionais e não substituem documentação aprovada, aplicável e atualizada ou supervisão profissional.

## Verificações

```bash
npm run lint
npm run typecheck
npm test
PLAYWRIGHT_BROWSERS_PATH=/tmp/gevyro-browsers npm run test:e2e
npm run build
```

Testes de RLS e concorrência: `tests/security.sql`, executado numa transação que é revertida. O script `tests/db-bootstrap.sql` permite testar as políticas com PostgreSQL local.

## Publicação Vercel Hobby

Vincule o projeto Vercel existente ao repositório `MartnsDev/gevyro-aviation-academy`, branch `main`, para publicar novos commits automaticamente. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_STORAGE_LIMIT_BYTES` nas variáveis de ambiente de produção da Vercel. Mantenha a conta no plano Hobby. Não publique `.env.local`, arquivos de backup ou credenciais. Os PDFs em `public/apostilas` são públicos por link direto.
