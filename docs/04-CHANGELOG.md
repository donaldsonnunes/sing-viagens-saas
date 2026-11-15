# Changelog Oficial — Sing Viagens e Turismo (SaaS)

Todas as alterações sistêmicas, evoluções de escopo, regras de negócio e atualizações visuais são registradas neste documento.

---

## [2.4.1] — 2026-11-14
### Adicionado (Visualização Clara de Conexões: Local, Horários e Tempo de Espera)
- **Detalhamento Visual de Conexões nos Resultados de Busca (`src/lib/flightEngine.ts` e `src/components/FlightSearchExperience.tsx`)**:
  - Na linha do tempo de cada voo, voos diretos recebem o selo verde *"Voo Direto • Sem paradas"* e voos com conexão exibem na própria linha a sigla do aeroporto de parada (ex.: `VCP`, `BSB`, `LIS`).
  - Adicionado um card de destaque imediato abaixo do horário nos voos com conexão mostrando:
    - **Onde é a parada**: Cidade e sigla do aeroporto (ex.: *Parada em Campinas (VCP)* ou *Brasília (BSB)*).
    - **Horário de chegada e saída na conexão** (ex.: *Chega às 17:35 e sai às 18:45*).
    - **Tempo de conexão em solo** destacado em badge (`Tempo de conexão: 01h 10m`) e indicação se há **troca de avião** ou **mesma aeronave**.

---

## [2.4.0] — 2026-11-14
### Adicionado (Integração Oficial com Banco de Dados Supabase PostgreSQL — Região São Paulo `sa-east-1`)
- **Criação e Provisionamento do Projeto Supabase (`sing-viagens-saas` / `lbbjgxvbjbsoaglsccun`)**:
  - Banco PostgreSQL provisionado na região `sa-east-1` (São Paulo, Brasil) para latência mínima junto à Vercel (`gru1`).
  - Migration inicial aplicada (`supabase/migrations/20261114225600_init_sing_viagens_schema.sql`) criando as tabelas:
    - `public.pricing_rules` (precificação por milheiro e spread por companhia aérea)
    - `public.users` (clientes e administradores)
    - `public.search_history` (histórico de pesquisas de passagens)
    - `public.orders` (reservas e localizadores PNR)
    - `public.external_api_logs` (tabela dedicada para armazenar payloads de requisição/resposta, status HTTP e tempo de resposta em milissegundos durante os testes de APIs externas de voos e milhas).
- **Persistência em Nuvem nas Rotas da Aplicação (`src/lib/db.ts`, `/api/admin/pricing`, `/api/flights/search`, `/api/account`)**:
  - Todas as pesquisas de voos, alterações de preço do milheiro no `/admin`, cadastros de clientes e reservas no `/checkout` agora gravam e consultam diretamente o banco PostgreSQL do Supabase em tempo real.

---

## [2.3.0] — 2026-11-14
### Alterado (Foco Comercial 100% em Passagens Aéreas para Shows & Limpeza de Jargões Técnicos)
- **Foco Exclusivo em Passagens Aéreas na Fase 1 (`src/data/siteContent.ts`, `src/components/FlightSearchExperience.tsx`, `src/app/page.tsx`, `src/app/servicos/*`)**:
  - Todas as páginas e Landing Pages de serviços (`/servicos` e `/servicos/[slug]`) foram revisadas para focar exclusivamente na conexão entre o cliente e seu show/evento/destino por meio de **passagens aéreas** (Shows e Festivais, Emissão Nacional e Internacional Comparada, Executiva & Cabines Premium, e Grupos/Equipes de Eventos).
  - Módulos de Hospedagens, Pacotes, Portfólio/Cases e Depoimentos/Reviews foram removidos da navegação e da vitrine ativa, ficando planejados para um segundo momento (Fase 2).
- **Remoção de Informações Técnicas e Jargões Internos (`Navbar.tsx`, `Footer.tsx`, `sobre/page.tsx`, `FlightSearchExperience.tsx`, `page.tsx`)**:
  - Removidos blocos técnicos de exibição de *Design Tokens / Paleta de Cores Hex* do rodapé e da página Sobre.
  - Removido o badge técnico `v2.0` ao lado da logomarca na barra de navegação e janelas de código/URL técnica na Home.
  - Removido o termo técnico `IATA` dos rótulos visíveis ao usuário no buscador e nos cards (substituído por *"De onde você vai sair?"* e *"Para onde você vai?"*, mantendo a busca inteligente por cidade ou código de 3 letras do aeroporto).

---

## [2.2.0] — 2026-11-14
### Adicionado
- **Preparação para Deploy em Produção & Documentação (`docs/05-GUIA-DE-DEPLOY-PRODUCAO.md` e `.gitignore`)**:
  - Inicialização do repositório Git local e criação do guia passo a passo para publicação via GitHub + Railway/Vercel com apontamento DNS no domínio da HostGator.

---

## [2.1.0] — 2026-11-14
### Alterado (Nomenclatura em Português & Motor de Precificação por Milheiro e Spread)
- **Nomenclatura 100% em Português (`src/components/FlightSearchExperience.tsx` e `src/app/page.tsx`)**:
  - Substituídas todas as abreviações em inglês (`Adt`, `Chd`, `ADT`, `CHD`) por **"Adulto / Adultos"**, **"Criança / Crianças"** e **"Bebê de colo"** em todo o seletor de viajantes, cards de resultados e simuladores.
- **Motor de Precificação por Milheiro + Margem sobre a Diferença (`src/lib/db.ts`, `src/lib/flightEngine.ts` e `src/app/admin/page.tsx`)**:
  - O retorno da API de voos agora processa simultaneamente o **preço em milhas** e o **valor comercial direto na Cia Aérea**.
  - Adicionado no Painel Admin (`/admin`) o cadastro do **Valor de Compra por Milheiro (`R$ / 1.000 milhas`)** individualizado para cada companhia aérea (`LATAM`, `GOL`, `AZUL`, `TAP`, `AMERICAN`, `AIRFRANCE`).
  - Implementada a fórmula oficial de **Margem de Lucro (`%`) sobre a Diferença (Spread)** entre o custo em milhas com taxas e o valor na companhia aérea (Exemplo: Custo Milhas c/ taxas = `R$ 1.000,00`, Preço na Cia = `R$ 1.500,00`, Margem Admin = `50%` da diferença → **Preço Final Sing = `R$ 1.250,00`**).

---

## [2.0.1] — 2026-11-14
### Corrigido
- **Hidratação React / Compatibilidade com Extensões de Navegador (`src/app/layout.tsx`)**:
  - Adicionado `suppressHydrationWarning` nas tags `<html>` e `<body>` para evitar alertas de *hydration mismatch* causados por extensões do navegador (como Scribe, Grammarly, tradutores, etc.) que injetam atributos (`data-scribe-recorder-ready="true"`) no DOM antes do carregamento do React.

---

## [2.0.0] — 2026-11-14
### Alterado (Evolução Principal Product Design — Estilo Linear, Stripe & Vercel)
- **Tipografia Oficial (`src/app/layout.tsx` & `tailwind.config.ts`)**:
  - Configuração das fontes **Plus Jakarta Sans** (headings com `tracking-tight`), **Inter** (corpo) e **JetBrains Mono** (siglas IATA, localizadores PNR, badges e tabelas de preço).
- **Navbar Flutuante com Glassmorphism (`src/components/Navbar.tsx`)**:
  - Barra flutuante em vidro fosco (`#09090B/85` + `backdrop-blur-xl` + `border-white/10`) e CTA com brilho em cobre no hover.
- **Hero de Alto Impacto + Mockup Interativo + Bento Grid + FAQ Accordion (`src/app/page.tsx` & `src/components/FaqAccordion.tsx`)**:
  - Hero com brilho radial sutil, badge em pílula, botões primário/fantasma, janela de dashboard simulado abaixo do Hero, barra de prova social em escala de cinza, Bento Grid assimétrico de 12 colunas e FAQ em acordeão interativo.
- **Motor de Pesquisa Passagens & Hospedagens (`src/components/FlightSearchExperience.tsx`)**:
  - Destaque visual automático para a **Opção Mais Recomendada Sing** (maior economia vs. Cia Aérea) e alternância interativa (toggle) entre Passagens Aéreas e vitrine de Hospedagens próximas a arenas de eventos.

---

## [1.2.0] — 2026-11-14
### Alterado (Refatoração UI/UX Clean & Minimalista)
- **Redesign do Cabeçalho (`src/components/Navbar.tsx`)**:
  - Fundo claro translúcido (`bg-white/90 backdrop-blur`), remoção da top-bar escura que sobrecarregava o topo, aplicação do **Símbolo Simplificado Sing** em miniatura (seguindo a diretriz de design do logo para tamanhos pequenos) e organização dos links em linha única (`whitespace-nowrap`) com menu dropdown *"Mais"* para evitar quebra de texto ou corte de botões.
- **Redesign da Home e do Buscador (`src/app/page.tsx` e `src/components/FlightSearchExperience.tsx`)**:
  - Hero centralizado e elegante com respiro visual, eliminando caixas duplicadas de logotipo.
  - Motor de pesquisa transformado em um card flutuante branco de bordas arredondadas (`rounded-3xl`) com controles em formato *pill*.
  - Resultados de voos refatorados com **Revelação Progressiva**: o comparativo com as cias aéreas fica limpo à direita e a composição detalhada do preço abre sob demanda ao clicar em *"Ver composição do preço"*.

---

## [1.1.0] — 2026-11-14
### Adicionado
- **Infraestrutura Docker & Containerização Completa**:
  - `Dockerfile`: Multi-stage build otimizado com `node:22-alpine` e Next.js `output: "standalone"`.
  - `docker-compose.yml`: Orquestração da aplicação (`singviagens-app` na porta `3000`) + banco de dados relacional (`singviagens-postgres` com PostgreSQL 16 Alpine na porta `5432`, healthcheck e volume persistente `singviagens_pgdata`).
  - `.dockerignore` e `.env.example`: Padronização de variáveis de ambiente para banco de dados e futuras chaves de APIs de cias aéreas/hotéis.
  - Atualização de `docs/03-ARQUITETURA-E-PRECIFICACAO.md` com a seção de arquitetura e comandos Docker.

---

## [1.0.0] — 2026-11-14
### Adicionado
- **Documentação Oficial (`/docs`)**:
  - `01-ESCOPO-DO-SISTEMA.md`: Mapeamento completo das páginas de conversão, confiança, fechamento, atração/legais, motor de pesquisa IATA, comparativo de cias aéreas, área do cliente e painel admin.
  - `02-IDENTIDADE-VISUAL-DESIGN-SYSTEM.md`: Definição oficial da paleta de cores (`#172C3B` Azul-petróleo profundo, `#BD9472` Cobre suave, `#E8E2D9` Areia clara) e diretriz de simplificação do símbolo para tamanhos pequenos.
  - `03-ARQUITETURA-E-PRECIFICACAO.md`: Arquitetura Next.js + TypeScript + Tailwind CSS e regras matemáticas de composição tarifária (ADT/CHD/INF) e markup parametrizado.
- **Inicialização da Plataforma SaaS**:
  - Estruturação completa das páginas principais, páginas de serviço individuais, buscador avançado de passagens e hospedagens, comparador lado a lado com cias aéreas, painel `/admin` de precificação e área `/conta` com login e histórico.
