# Escopo do Sistema — Sing Viagens e Turismo (SaaS)

> **Propósito da Marca:** "O Elo entre Pessoas e Eventos"  
> **Posicionamento:** Plataforma SaaS e Agência de Viagens e Turismo de alto padrão, combinando segurança e confiabilidade em viagens corporativas/lazer com a paixão por grandes experiências, shows, festivais e eventos exclusivos.

---

## 1. Visão Geral do Produto
O sistema **Sing Viagens e Turismo** é uma plataforma web moderna (SaaS) voltada para conectar o cliente ao seu show, festival ou destino favorito através da **emissão inteligente de passagens aéreas** (Fase 1). A plataforma integra motor de busca de voos, precificação parametrizada por milheiro + spread de lucro e comparação transparente lado a lado com o site oficial das companhias aéreas, além de área de membros (`/conta`) e painel administrativo (`/admin`).

> **Faseamento Estratégico (Roadmap)**:
> - **Fase 1 (Atual — Produção)**: Foco 100% exclusivo na comercialização e emissão de **Passagens Aéreas** conectando passageiros a shows, festivais e destinos nacionais/internacionais, com linguagem 100% voltada ao consumidor final (sem jargões técnicos como "IATA", "Design Tokens" ou badges de versão).
> - **Fase 2 (Futuro)**: Expansão para Pacotes Completos, Hospedagens próximas a arenas, Portfólio de Cases e Mural de Depoimentos/Reviews.

---

## 2. Mapa de Páginas e Módulos do Site

### 2.1. Páginas Principais (Conversão e Apresentação)
1. **Página Inicial (`/`) — Home**:
   - **Hero Section**: Proposta de valor clara no topo ("O Elo entre Pessoas e Eventos"), buscador rápido de passagens/experiências e CTAs de alto impacto.
   - **Resumo de Serviços**: Destaque para Pacotes de Shows & Eventos, Passagens Aéreas Inteligentes, Concierge VIP e Viagens Corporativas.
   - **Provas Sociais**: Números de clientes atendidos, eventos conectados, carrossel de depoimentos e selos de segurança.
   - **Destaques de Eventos & Destinos**: Cards visuais com próximos grandes shows/festivais e destinos em alta.
2. **Página de Serviços — Visão Geral (`/servicos`)**:
   - Catálogo organizado de todas as soluções oferecidas (Viagens para Shows e Festivais, Emissão Inteligente de Passagens com Comparativo, Hospedagens Curadas, Corporativo & Grupos, Assessoria Completa de Viagem).
   - Filtros e comparativo rápido para ajudar o visitante a identificar a modalidade ideal.
3. **Páginas Individuais de Serviço — Landing Pages (`/servicos/[slug]`)**:
   - Páginas exclusivas de alta conversão para cada serviço principal:
     - `/servicos/viagens-para-shows-e-eventos`
     - `/servicos/passagens-aereas-inteligentes`
     - `/servicos/hospedagens-e-pacotes-vip`
     - `/servicos/viagens-corporativas-e-grupos`
   - Estrutura: Como funciona (passo a passo), entregáveis detalhados, benefícios exclusivos Sing, FAQ específico do serviço e botão/formulário de compra ou cotação direta.
4. **Página de Pesquisa de Preços e Comparador (`/pesquisa`)**:
   - Motor de busca completo de Passagens Aéreas e aba de Hospedagens (em estruturação).

### 2.2. Páginas de Confiança e Autoridade
5. **Sobre Nós / Quem Somos (`/sobre`)**:
   - História da Sing Viagens e Turismo, missão de conectar pessoas a momentos inesquecíveis, certificações (Cadastur, IATA/parceiros), experiência e apresentação da equipe de especialistas.
6. **Portfólio, Cases e Resultados (`/portfolio`)**:
   - Projetos e operações realizadas (ex.: grupos em grandes festivais internacionais, economia gerada para clientes corporativos, "antes e depois" da experiência de viagem planejada vs. comum) e métricas alcançadas.
7. **Depoimentos e Avaliações (`/depoimentos`)**:
   - Mural de avaliações reais de clientes, integração visual estilo Google Reviews (nota 4.9/5.0), relatos por categoria de viagem e seção de vídeos curtos de clientes em eventos.

### 2.3. Páginas de Fechamento e Suporte
8. **Contato e Solicitação de Orçamento (`/contato`)**:
   - Formulário inteligente para roteiros personalizados, botão flutuante e direto para WhatsApp, e-mail oficial, telefone e horário de atendimento VIP.
9. **Agendamento Online e Checkout (`/checkout`)**:
   - Fluxo duplo:
     - **Checkout de Passagens/Pacotes**: Resumo do voo selecionado na pesquisa, dados dos passageiros (adultos/menores), composição transparente do valor e pagamento (PIX, Cartão, Boleto).
     - **Agendamento de Consultoria VIP**: Escolha de data e horário na agenda para atendimento personalizado com especialista Sing.
10. **Perguntas Frequentes — FAQ (`/faq`)**:
    - Central de ajuda categorizada (Passagens e Tarifas, Bagagens, Reembolsos e Cancelamentos, Pacotes de Eventos, Formas de Pagamento).

### 2.4. Páginas de Atração e Legais
11. **Blog / Central de Conteúdo (`/blog` e `/blog/[slug]`)**:
    - Artigos otimizados para SEO (guias de viagem para grandes festivais, dicas de melhor época para comprar passagens, direitos do passageiro, roteiros musicais pelo mundo).
12. **Política de Privacidade e Termos de Uso (`/privacidade` e `/termos`)**:
    - Adequação integral à LGPD, política de cookies, regras claras de intermediação, reembolso, remarcação e cancelamento (normas ANAC e Código de Defesa do Consumidor).

---

## 3. Motor de Pesquisa de Passagens e Comparativo de Cias Aéreas (`/pesquisa`)

### 3.1. Estrutura do Formulário de Busca
- **Modalidade da Viagem**: Ida e Volta (`ROUND_TRIP`), Somente Ida (`ONE_WAY`).
- **Origem e Destino com Autocomplete IATA**:
  - Sugestão instantânea de cidade/país e aeroporto com as siglas padrões internacionais de 3 letras (ex.: `GRU - São Paulo (Guarulhos), Brasil`, `GIG - Rio de Janeiro (Galeão), Brasil`, `LIS - Lisboa (Humberto Delgado), Portugal`, `MIA - Miami International, EUA`, `JFK - Nova York, EUA`, `CDG - Paris, França`, etc.).
- **Datas**: Data de Ida e Data de Volta (quando aplicável), com validação de calendário.
- **Seletor de Viajantes (Padrão Companhias Aéreas)**:
  - **Adultos**: 12+ anos.
  - **Crianças / Menores (2 a 11 anos)** e **Bebês (0 a 23 meses)**: Ao adicionar menores, o sistema exige o preenchimento da **idade exata de cada menor na data do voo** para cálculo tarifário preciso (tarifa CHD / INF).
- **Classe da Cabine**: Econômica, Premium Economy, Executiva (Business), Primeira Classe.

### 3.2. Apresentação dos Resultados e Comparativo Lado a Lado
Para cada voo retornado pela pesquisa, a interface apresenta duas visões integradas lado a lado:
1. **Coluna Principal — Proposta Sing Viagens (Valor de Venda Estruturado)**:
   - Horários de partida/chegada, duração, paradas, franquia de bagagem e número do voo.
   - **Preço de Venda Sing**: Calculado automaticamente com base na tarifa base + regras de lucro/markup parametrizadas no Admin.
   - **Detalhamento / Composição do Preço**: Tarifa aérea + taxas de embarque + assessoria/emissão Sing, destacando a economia ou benefício exclusivo.
   - Botão direto para **Selecionar e Ir para Checkout**.
2. **Coluna Lateral — Comparativo Direto nas Principais Cias Aéreas (Mesmo Voo)**:
   - Exibe quanto o mesmo voo (ou codeshare equivalente) está custando diretamente nos canais oficiais das principais companhias que operam a rota (ex.: **LATAM, GOL, Azul, TAP, American Airlines, Air France**).
   - Mostra indicadores visuais de vantagem (ex.: *"Economize R$ 340 comprando com a Sing"* ou *"Inclui Suporte VIP 24h sem custo extra"*).

---

## 4. Módulo de Pesquisa de Hospedagens (`/pesquisa?tab=hospedagens`)
- Estrutura preparada na página de pesquisa permitindo alternar entre **Passagens Aéreas** e **Hospedagens**.
- Permite buscar por Cidade/Evento, Check-in/Check-out, Quantidade de Quartos e Hóspedes (Adultos e Crianças com idade), apresentando prévia da vitrine de hotéis parceiros e pacotes próximos a arenas de shows.

---

## 5. Painel Administrativo de Precificação e Markup (`/admin`)
- Acesso restrito a administradores para parametrizar o resultado final das pesquisas de passagens:
  - **Margem de Lucro Padrão (%)**: Percentual aplicado sobre a tarifa líquida (net) retornada pela API.
  - **Taxa Fixa de Emissão / Rav (R$)**: Valor fixo adicionado por bilhete ou por passageiro.
  - **Desconto Competitivo sobre Tarifa Pública (%)**: Parametrização para simular/aplicar tarifas negociadas (consolidadora/milhas/acordos) frente ao preço de balcão das Cias Aéreas.
  - **Regras por Companhia Aérea ou Rota**: Possibilidade de ajustar margens específicas para LATAM, GOL, Azul e voos internacionais.
  - **Simulador em Tempo Real**: Mostra imediatamente como uma tarifa de R$ 1.000,00 da API será exibida ao cliente final na página de pesquisa.

---

## 6. Área do Cliente e Administrador: Login Social (Google / Apple ID), Cadastro e Histórico (`/conta` e `/login`)
- **Autenticação Integrada com Supabase (`/conta` e `/login`)**:
  - **Login Social com 1 Clique**: Botões oficiais **"Continuar com Google"** e **"Continuar com ID Apple"**, além de sincronização de token OAuth do Supabase (`#access_token`).
  - **Login e Cadastro por E-mail e Senha com Replicação Automática para Passageiro Frequente**: Ao criar uma conta (`Criar Conta + Passageiro` ou via Google/Apple), o formulário solicita **Nome\***, **Sobrenome\***, **Data de Nascimento\***, **CPF\***, **E-mail\***, **Celular (opcional)** e **Passaporte (opcional)**, replicando automaticamente esses dados no cadastro de **Passageiros Frequentes (`public.frequent_passengers`)** do titular.
  - **Administrador Master Oficial**: O e-mail **`donaldson.nunes@gmail.com`** está configurado no banco PostgreSQL do Supabase (com *trigger* de proteção `trg_enforce_super_admin_role`) como **Administrador Master (`ADMIN`)**, liberando automaticamente o botão **Admin** na barra superior e o acesso ao painel `/admin`.
- **Dashboard do Viajante (`/conta`)**:
  - **Cadastro de Passageiros Frequentes (Sem Limites por Conta)**: Permite cadastrar, editar e remover quantos passageiros desejar com os dados oficiais de emissão aérea: **Nome\***, **Sobrenome\***, **Data de Nascimento\***, **CPF\***, **E-mail (opcional)**, **Celular (opcional)** e **Passaporte (opcional)**. No `/checkout`, cada assento permite selecionar um passageiro já cadastrado com 1 clique ou cadastrar um novo na hora (salvando automaticamente na conta).
  - **Histórico de Pesquisas Recentes**: Salva automaticamente origem, destino, datas, passageiros (incluindo idades dos menores) e menor preço encontrado, com botão **"Repetir Busca"**.
  - **Histórico de Compras e Reservas**: Lista de pedidos realizados no checkout, código localizador (PNR), status do pedido e recibo detalhado.
