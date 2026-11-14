# Identidade Visual & Design System — Sing Viagens e Turismo

> **Slogan Oficial:** "O Elo entre Pessoas e Eventos"  
> **Conceito Visual:** Elegância contemporânea, confiança corporativa e a energia vibrante da música e grandes eventos de maneira sutil e premium.

---

## 1. Paleta de Cores Oficial

| Nome da Cor | Código Hex | RGB | Papel no Sistema | Significado Psicológico |
| :--- | :--- | :--- | :--- | :--- |
| **Azul-Petróleo Profundo** | `#172C3B` | `rgb(23, 44, 59)` | Cor Primária (Fundo Hero, Headers, Botões Secundários, Textos de Destaque) | Confiança, segurança, estabilidade e profissionalismo em viagens. |
| **Cobre Suave** | `#BD9472` | `rgb(189, 148, 114)` | Cor de Destaque / Acento (CTAs Primários, Ícones, Badges VIP, Detalhes de Luxo) | Experiências especiais, calor humano, palco iluminado e exclusividade. |
| **Areia Clara** | `#E8E2D9` | `rgb(232, 226, 217)` | Cor de Superfície / Background Suave (Seções alternadas, Cards de Confiança, Textos em fundo escuro) | Leveza, equilíbrio, acolhimento e versatilidade. |

### Cores Complementares de Interface (UI Tokens)
- **Azul-Noite Escuro (`#0E1B24`)**: Variação mais profunda do `#172C3B` para rodapés, barras superiores e contraste com o logotipo oficial (`logo.png`).
- **Cobre Iluminado (`#D4AF8E`)**: Estado de *hover* e gradientes metálicos sutis inspirados no arco dourado/cobre do avião no logotipo.
- **Off-White Puro (`#F9F7F4`)**: Fundo de áreas de leitura densa e tabelas comparativas de voos para máxima legibilidade.
- **Verde Economia (`#1E7E5A`)**: Indicador visual de melhor tarifa Sing vs. Cia Aérea direta.
- **Alerta / Urgência (`#C87A28`)**: Indicador de "Últimos assentos nesta tarifa".

---

## 2. Diretrizes de Uso do Logotipo e Evolução para Tamanhos Pequenos

### 2.1. Logotipo Principal (`/public/logo.png`)
- Apresenta a tipografia **"Sing"** com o **"S"** estilizado formando a trilha de um avião em tom cobre (`#BD9472`) envolvendo a silhueta de um público em um show iluminado, e a letra **"g"** abrigando o pin de localização geográfica.
- **Onde usar**: Hero da Home, Página Sobre Nós, Tela de Login/Cadastro e Cabeçalho Desktop ampliado.

### 2.2. Simplificação Responsiva (Ícone / Favicon / Mobile Header)
Conforme a diretriz de design estabelecida no escopo (*"o logotipo ainda possui muitos elementos para funcionar em tamanhos pequenos"*):
- Para **tamanhos reduzidos** (barra de navegação compacta no mobile, favicon, avatares e selos de tabela comparativa), o sistema inclui um **Símbolo Simplificado (Monograma Vetorial SVG)**:
  - Preserva o **arco dinâmico em Cobre Suave (`#BD9472`) conectado ao avião e ao pin/nota musical** sobre fundo Azul-Petróleo (`#172C3B`), removendo a fotografia interna de multidão em miniaturas menores que `40px` para garantir nitidez absoluta em qualquer tela.

---

## 3. Tipografia, Espaçamento e Componentes Visuais (Design System v2.0 — Estilo Linear / Stripe / Vercel)
- **Estética High-Contrast & Minimalismo Clean**:
  - Combinação cirúrgica entre **Dark Mode Sofisticado (`#09090B`)** com bordas translúcidas de `1px` (`border-white/10`), padrão de grid geométrico sutil e brilhos radiais suaves em Cobre (`#BD9472`) e Azul-Petróleo (`#172C3B`) no Hero, contrastando com áreas de leitura e busca em **Fundo Claro (`#FAFAFA`)** de altíssima nitidez.
- **Tríade Tipográfica de Última Geração (`next/font/google`)**:
  - **Títulos (`Plus Jakarta Sans`)**: `tracking-tight`, pesos `600/700/800` para impacto imediato.
  - **Corpo e Interface (`Inter`)**: Leitura fluida e escaneável.
  - **Dados Técnicos, Badges, Siglas IATA e Preços (`JetBrains Mono`)**: Alinhamento tabular perfeito (`tabular-nums`) para comparação lado a lado entre tarifas da Sing e das Companhias Aéreas.
- **Componentes de Alta Conversão**:
  1. **Navbar Flutuante Glassmorphism**: Efeito vidro fosco (`bg-[#09090B]/85 backdrop-blur-xl border-white/10`), links rápidos sem quebra de linha e botão CTA com micro-interação de brilho (`shadow-[0_0_28px_rgba(189,148,114,0.65)]`).
  2. **Hero com Dashboard/Mockup Interativo Simulado**: Apresenta imediatamente uma janela de telemetria tarifária demonstrando a vantagem do preço Sing frente às companhias aéreas.
  3. **Bento Grid Assimétrico (12 colunas)**: Seção de benefícios e arquitetura de valor com cartões em múltiplos tamanhos e profundidades.
  4. **Destaque Automático na Opção Mais Recomendada**: O motor de busca destaca com borda Cobre (`#BD9472`) e badge superior o voo com maior economia auditada, além de contar com toggle para **Hospedagens & Arenas**.
  5. **FAQ Interativo em Acordeão (`FaqAccordion.tsx`)**: Componente expansível limpo e responsivo.
