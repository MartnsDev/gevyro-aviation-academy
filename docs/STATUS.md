# Estado da implementação

## Implementado

- Biblioteca pessoal com importação PDF, hash, pesquisa, coleções, favoritos, lixeira e controles de PDF original.
- Leitor PDF.js de página, dupla página, rolagem, miniaturas, sumário e pesquisa; progresso, destaques, desenhos, OCR local e notas.
- Exercícios: importação com revisão, gabarito com fonte, respostas, exercícios autorais, simulados, erros e exportação A4.
- MMA Básico: 12 cadernos autorais com 20 questões cada, temas ligados aos PDFs do aluno e à IS ANAC 141-007D; mapeamento, fontes e limite de OCR em `docs/MMABAS.md`.
- Inglês técnico, glossário editável, exercícios, síntese do navegador e SM-2.
- Calendário, rotina 12×36 aproximada, cronômetro, calculadoras, PWA, offline local e sync Supabase.
- Backup/restauração ZIP com manifesto, SHA-256 e confirmação de conflitos.
- Migration remota com 33 tabelas `gaa_`, RLS e storage privado `gaa-documents`, aplicada ao projeto identificado como MCELL.

## Revisão pendente

- Os PDFs originais não foram copiados para o repositório nem para o Supabase. A maior parte dos capítulos é digitalizada; o mapeamento atual usa sumários legíveis e currículo ANAC, sem OCR exaustivo das páginas.
- Questões do MMA Básico são autorais, não oficiais e aguardam revisão técnica; gabaritos são preliminares.
- Permissões de voz e disponibilidade offline variam pelo navegador.
- Corrigir sessões temporárias dos testes antes de publicação; executar rodada final E2E completa.
- Produção publicada na Vercel Hobby: https://gevyro-aviation-academy.vercel.app. O deploy está com Vercel Authentication ativada; acesso requer conta autorizada.
- Verificação autenticada Vercel retornou HTML do Next.js e status Ready. A verificação pública sem autenticação retorna 404 esperado pela proteção de deployment.

## Testado

- TypeScript strict, ESLint e build Vercel de produção concluídos com sucesso.
- 12 testes Vitest: hash/PDF, persistência, soft-delete, importação, CSV, SM-2, cálculos, conteúdo inicial, exportação e backup.
- Teste SQL em PostgreSQL temporário: isolamento SELECT/INSERT/UPDATE/DELETE, propriedade imutável e conflito de versão.
- RLS remota verificada com usuários temporários no Supabase; transação revertida.
- E2E da importação passou anteriormente em desktop e mobile. A repetição após mudanças falhou por navegação/armazenamento local em contexto mobile e foi interrompida; fluxos de backup/leitura completos ainda precisam de rodada estável.
