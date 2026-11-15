# Changelog Oficial — Sing Viagens e Turismo (SaaS)

Todas as alterações sistêmicas, evoluções de escopo, regras de negócio e atualizações visuais são registradas neste documento.

---

## [2.9.3] — 2026-11-15
### Adicionado (Validação e Confirmação Obrigatória de E-mail no Cadastro de Usuário)
- **Fluxo de Confirmação de E-mail na Criação de Conta (`src/app/conta/page.tsx`, `src/app/api/account/route.ts`, `src/lib/db.ts`, `supabase/migrations/20261115060500_add_email_verification_to_users.sql`)**:
  - Adicionadas as colunas `email_verified`, `verification_code` e `verified_at` em `public.users`.
  - Ao se cadastrar por e-mail/senha, o sistema dispara o e-mail de confirmação via Supabase Auth (`/auth/v1/signup`), gera um código de 6 dígitos e direciona o usuário para a etapa **"Confirme seu E-mail para Ativar a Conta"** (permitindo confirmar pelo link recebido no e-mail ou digitando o código de 6 dígitos, além de botão para reenviar o e-mail).
  - Tentativas de login em contas ainda não confirmadas são bloqueadas e direcionadas para a tela de confirmação de e-mail.

---

## [2.9.2] — 2026-11-15
### Corrigido (Isolamento de Dados e Ocultação de Dashboards, Passageiros e Históricos antes do Login e após Logout)
- **Proteção de Dados Vinculados à Conta em `/conta`, `/login`, `/checkout` e `/admin` (`src/app/conta/page.tsx`, `src/app/api/account/route.ts`, `src/app/checkout/page.tsx`, `src/app/admin/page.tsx`)**:
  - Antes do login ou ao clicar em **"Sair"**, todos os estados de sessão (`user`, `searchHistory`, `orders`, `frequentPassengers`) são limpos e **nenhuma informação de dashboard, lista de passageiros frequentes, histórico de pesquisas ou compras é exibida**.
  - Na API `GET /api/account`, removidos os *fallbacks* de demonstração que exibiam dados de outros usuários quando a conta não possuía buscas ou pedidos: cada usuário visualiza estritamente os seus próprios registros.
  - No `/checkout`, os dados de titular e passageiros frequentes só são pré-carregados quando o usuário está autenticado.
  - No `/admin`, a página bloqueia a exibição do dashboard gerencial caso o usuário não esteja autenticado como Administrador.

---

## [2.9.1] — 2026-11-15
### Adicionado (Replicação Automática dos Dados do Cadastro de Usuário para Passageiro Frequente)
- **Formulário Unificado de Cadastro de Conta + Perfil de Passageiro (`src/app/conta/page.tsx`, `src/app/api/account/route.ts`, `src/lib/db.ts`, `supabase/migrations/20261115055800_add_passenger_fields_to_users_and_replicate.sql`)**:
  - Ao cadastrar uma nova conta (tanto na aba **"Criar Conta + Passageiro"** quanto no modal **Google / ID Apple**), o sistema solicita os mesmos dados de passageiro aéreo (**Nome\***, **Sobrenome\***, **Data de Nascimento\***, **CPF\***, **E-mail\***, **Celular opcional** e **Passaporte opcional**) e replica automaticamente o titular em `public.frequent_passengers` para seleção imediata com 1 clique nas compras de passagens.

---

## [2.9.0] — 2026-11-15
### Adicionado (Cadastro Ilimitado de Passageiros Frequentes na Conta e Seletor / Cadastro na Hora no Checkout)
- **Tabela `public.frequent_passengers` no Supabase PostgreSQL (`supabase/migrations/20261115054600_add_frequent_passengers_table.sql`, `src/lib/db.ts`, `src/app/api/account/route.ts`)**:
  - Criada a estrutura de persistência ilimitada por conta (`user_email`) armazenando **Nome** (`first_name` — obrigatório), **Sobrenome** (`last_name` — obrigatório), **Data de Nascimento** (`birth_date` — obrigatório), **CPF** (`cpf` — obrigatório), **E-mail** (`email` — opcional), **Celular** (`phone` — opcional) e **Passaporte** (`passport` — opcional).
- **Gestão Completa de Passageiros Frequentes em Minha Conta (`src/app/conta/page.tsx`)**:
  - Nova seção **"Cadastro de Passageiros Frequentes (Sem Limites por Conta)"** no painel do usuário permitindo visualizar, adicionar, editar e excluir passageiros salvos a qualquer momento.
- **Seleção com 1 Clique ou Cadastro na Hora no Checkout (`src/app/checkout/page.tsx`, `src/components/TicketVoucherModal.tsx`)**:
  - Em cada slot de passageiro (`Passageiro #1`, `Passageiro #2`, etc.), o cliente pode escolher um **Passageiro Frequente já cadastrado** (preenchendo automaticamente Nome, Sobrenome, Data de Nascimento, CPF, E-mail, Celular e Passaporte) ou escolher **"➕ Cadastrar novo passageiro na hora"**, salvando-o com 1 clique ou automaticamente ao emitir o bilhete.

---

## [2.8.0] — 2026-11-15
### Adicionado (Gateway de Otimização de Custos APIVIAGENS, Cache Negativo e Indexação Mensal por Interseção)
- **Gateway Inteligente APIVIAGENS (`src/lib/apiViagensService.ts`, `docs/06-OTIMIZACAO-APIVIAGENS-E-INDEXACAO-MENSAL.md`)**:
  - Integração completa com `https://api.apiviagens.com.br` (`/v1/account`, `/v1/flights`, `/v1/airfares`, `/v1/airfares/book`, `/v1/airfares/booking/{locator}`) calibrada com os limites reais da conta (`credits_per_search: 25`, `max_concurrent: 5`).
  - **Roteador Inteligente de Malha Aérea (`selectOptimalProvidersForRoute`)**: Bloqueia automaticamente chamadas para programas que não operam a rota pesquisada (ex.: bloqueia `tap`, `aadvantage` e `azulpelomundo` em voos domésticos brasileiros, economizando de 75 a 100 créditos por busca).
  - **Cache Ativo de 50 Minutos + Coalescing + Cache Negativo de 15 Minutos**: Preserva o `offer_id` dentro da validade de ~1h para reserva gratuita em `/v1/airfares/book`, desduplica requisições concorrentes e memoriza por 15 minutos provedores que retornaram `"Sem resultado"` / `"timeout"` (custo zero na API, mas poupando 15s de espera e slots de concorrência).
  - **Parser Real Calibrado (`normalizeLiveApiViagensToOffers`)**: Desempacota `payload.providers[provider].list_flights.departure`, horários ISO `main_path`, trechos `complete_path` (`LA3378`), `duration` e `raw_pricing` (`miles` + `tax_amount`).
- **Estrutura de Dados de Inventário Atômico & Indexação por Interseção Mensal (`supabase/migrations/20261115012000_flight_inventory_intersection_index.sql`)**:
  - Criadas as tabelas `public.flight_leg_inventory` (com índices B-Tree compostos por rota/data/mês e índice GIN em `path_airports` para conexões) e `public.monthly_fare_calendar` (armazenando os 30/31 dias do mês `YYYY-MM` para cada par `Origem -> Destino`), além da função SQL `public.query_flight_intersection`.
- **Painel Visual de Consumo e Faixa de Datas Pré-Busca na UI (`src/components/FlightSearchExperience.tsx`, `src/app/api/flights/search/route.ts`, `src/app/api/apiviagens/book/route.ts`, `src/app/api/apiviagens/account/route.ts`)**:
  - Exibe na tela de pesquisa o status do Cache/Gateway, os programas consultados vs. poupados, seletor de Modo de Consumo (`1 Créd. / Smart / Completo`) e calendário interativo de pré-busca.

---

## [2.7.0] — 2026-11-15
### Adicionado (4 Módulos Operacionais do Portal Geral: Passageiros ANAC no Checkout, Voucher PDF, Vitrine de Shows no Admin e Central de Alertas/Leads)
- **1. Checkout Completo com Dados Individuais de Passageiros (`src/app/checkout/page.tsx`, `src/app/api/account/route.ts`)**:
  - Geração dinâmica de campos para cada passageiro da busca (Adultos, Crianças e Bebês) coletando **Nome Completo conforme documento**, **CPF/Passaporte** e **Data de Nascimento**, além do **CPF do Pagador**, salvando tudo em `public.orders.passengers_details` no Supabase.
- **2. Voucher / E-Ticket Oficial para Impressão e PDF (`src/components/TicketVoucherModal.tsx`, `src/app/conta/page.tsx`, `src/app/checkout/page.tsx`)**:
  - Modal de **Bilhete Eletrônico Oficial Sing Viagens** com emblema da marca, Código Localizador (`PNR`), resumo do voo, tabela nominal de passageiros com documento, recibo financeiro com economia gerada e botão **"Imprimir / Salvar Voucher em PDF"** (`window.print()`).
- **3. Vitrine Dinâmica de "Próximos Shows & Festivais" Gerenciada pelo Admin (`src/components/PortalShowsAndAlertSection.tsx`, `src/app/api/portal/route.ts`, `src/app/admin/page.tsx`)**:
  - Nova tabela `public.featured_shows` no Supabase exibindo na Home os grandes shows/festivais do momento com botão direto **"Buscar Voo para este Show"**, e painel no `/admin` para cadastrar novos shows ou ocultar/ativar eventos na vitrine.
- **4. Captação de Leads / "Alerta de Passagem para o Meu Show" + Botão WhatsApp Flutuante (`src/components/WhatsAppFloatingButton.tsx`, `src/app/admin/page.tsx`)**:
  - Nova tabela `public.price_alerts` no Supabase onde fãs cadastram alertas de queda de preço para seus shows e a equipe Sing visualiza no `/admin` com botão de 1 clique **"Chamar no WhatsApp"** já com a mensagem personalizada preenchida.

---

## [2.6.0] — 2026-11-15
### Adicionado (Dashboard do Usuário e Dashboard Gerencial do Admin por Período)
- **Dashboard do Usuário (`src/app/conta/page.tsx`)**:
  - Exibe no topo da área logada os 4 indicadores consolidados do cliente: **Pesquisas Realizadas**, **Passagens Adquiridas**, **Custo via Companhias Aéreas vs. Custo via Sing Viagens** (com barra comparativa visual proporcional) e **Valor Total Economizado (`R$` e `%`)**.
  - Adicionado botão para cancelar ou reativar reserva diretamente no histórico de compras, refletindo os cálculos em tempo real no Supabase.
- **Dashboard do Administrador por Período Informado (`src/app/admin/page.tsx`, `src/app/api/admin/pricing/route.ts`, `supabase/migrations/20261115003100_add_dashboard_metrics_and_cancellation_support.sql`)**:
  - Adicionado filtro de período (`Data Inicial` até `Data Final` + atalhos de `7 dias`, `30 dias` e `Todo o Período`).
  - Exibe os 4 indicadores gerenciais do período: **1. Quantidade de Pesquisas e Taxa de Conversão (`%`)**, **2. Passagens Compradas e Faturamento Sing (`R$`)**, **3. Lucro Líquido Realizado (`R$`), Margem de Lucro (`%`) e Custo Total de Milhas (`R$`)**, e **4. Cancelamentos no Período (Quantidade, `%` e Volume Cancelado em `R$`)**, acompanhados da tabela auditável de pedidos com ação de cancelamento/reativação em tempo real.

---

## [2.5.0] — 2026-11-15
### Adicionado (Login e Cadastro com Google, ID Apple e Administrador Master `donaldson.nunes@gmail.com`)
- **Login e Cadastro com Google, ID Apple e E-mail/Senha (`src/app/conta/page.tsx`, `src/app/login/page.tsx`, `src/app/api/account/route.ts`)**:
  - Implementados os fluxos de **"Continuar com Google"**, **"Continuar com ID Apple"** e cadastro/login por e-mail e senha integrados ao banco `public.users` e Supabase Auth (`lbbjgxvbjbsoaglsccun`).
- **Permissão de Administrador Master para `donaldson.nunes@gmail.com` (`supabase/migrations/20261115000200_add_oauth_and_admin_donaldson.sql`, `src/lib/db.ts`, `src/components/Navbar.tsx`)**:
  - O e-mail **`donaldson.nunes@gmail.com`** foi cadastrado e protegido via *trigger* no PostgreSQL do Supabase com a role **`ADMIN`**.
  - O botão **Admin** na barra de navegação superior agora fica visível exclusivamente quando logado como Administrador (`donaldson.nunes@gmail.com`), ocultando-o para visitantes comuns.

---

## [2.4.4] — 2026-11-14
### Corrigido (Alinhamento e Contenção da Barra de Navegação Superior)
- **Ajuste de Espaçamento e Remoção de Botão Duplicado na Navbar (`src/components/Navbar.tsx`)**:
  - Unificado o link repetido (*"Buscar Passagens"* / *"Pesquisar Voos"*) no botão principal em cobre à direita (**"Buscar Passagens"**) e compactado o rótulo de *"Passagens para Shows & Destinos"* para **"Shows & Destinos"**, garantindo que todos os itens fiquem 100% contidos dentro da moldura escura do cabeçalho sem transbordar na direita.

---

## [2.4.2] — 2026-11-14
### Adicionado (Ícone Oficial da Página / Favicon Baseado no Logo Sing)
- **Favicon e Símbolo Vetorial Fiel ao Logo (`src/app/icon.svg`, `public/icon.svg`, `src/app/layout.tsx`, `src/components/Navbar.tsx`)**:
  - Criado o ícone oficial da página (`icon.svg` e configuração `metadata.icons` no `layout.tsx`) reproduzindo fielmente o símbolo da marca Sing enviado (`logo.png`): fundo azul-petróleo escuro (`#172C3B` / `#0E1B24`), a fita dupla do **"S"** em cobre suave (`#BD9472`) e areia clara (`#E8E2D9`) subindo até o **avião dourado** no topo direito, acompanhado do **pin de localização** em cobre.

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
