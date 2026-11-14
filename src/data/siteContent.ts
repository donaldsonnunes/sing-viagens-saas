export interface ServicePackage {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  shortDescription: string;
  heroDescription: string;
  priceStartingAt: string;
  idealFor: string;
  howItWorks: { step: string; title: string; description: string }[];
  deliverables: string[];
  benefits: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const SERVICES: ServicePackage[] = [
  {
    slug: "viagens-para-shows-e-eventos",
    title: "Viagens para Shows, Festivais e Grandes Eventos",
    subtitle: "O DNA da Sing: você foca na emoção do palco, nós cuidamos de cada detalhe da sua jornada.",
    badge: "Mais Procurado",
    shortDescription:
      "Logística aérea estratégica, hospedagem próxima à arena, transfers privativos e suporte 24h durante os maiores festivais do Brasil e do mundo.",
    heroDescription:
      "Sabemos que viajar para um show único na vida ou um grande festival internacional exige precisão. Atrasos de voo ou hotéis mal localizados não podem comprometer o momento que você esperou o ano inteiro.",
    priceStartingAt: "Sob medida ou Pacotes a partir de R$ 1.890",
    idealFor: "Fãs de música, casais e grupos de amigos indo para Rock in Rio, The Town, Lollapalooza, Tomorrowland, Coachella, The Sphere (Vegas) ou turnês mundiais.",
    howItWorks: [
      {
        step: "01",
        title: "Mapeamento do Evento e Datas Críticas",
        description: "Identificamos o local exato do show/festival e bloqueamos os voos com margem segura de chegada e saída.",
      },
      {
        step: "02",
        title: "Curadoria de Hospedagem e Mobilidade",
        description: "Selecionamos hotéis com acesso rápido aos portões do evento e estruturamos o transporte de ida e volta com segurança.",
      },
      {
        step: "03",
        title: "Emissão Otimizada com Comparativo de Tarifas",
        description: "Aplicamos nossas tarifas negociadas de consolidadora/milhas comparadas em tempo real com as cias aéreas.",
      },
      {
        step: "04",
        title: "Plantão VIP Sing até seu Retorno",
        description: "Monitoramento ativo do seu voo, check-in assistido e suporte imediato via WhatsApp durante toda a viagem.",
      },
    ],
    deliverables: [
      "Passagens aéreas emitidas com horários protegidos contra imprevistos",
      "Reserva de hospedagem verificada em zonas seguras e estratégicas para o evento",
      "Guia exclusivo do viajante Sing (mapa de acesso ao estádio/arena, clima e dicas locais)",
      "Gestão de bagagens, marcação de assentos e check-in antecipado",
      "Canal direto com concierge Sing 24/7 para qualquer alteração de voo",
    ],
    benefits: [
      {
        title: "Economia Real Frente à Alta Demanda",
        description: "Em datas de grandes shows os preços das cias aéreas disparam. Nossas tarifas estruturadas reduzem o impacto do pico tarifário.",
      },
      {
        title: "Zero Estresse Pós-Show",
        description: "Planejamos voos de retorno respeitando o descanso após grandes espetáculos noturnos.",
      },
      {
        title: "Atendimento Humano Apaixonado por Música",
        description: "Falamos a sua língua e entendemos a importância de estar na grade no horário certo.",
      },
    ],
    faqs: [
      {
        question: "A Sing também vende o ingresso do show ou apenas a viagem?",
        answer: "Nosso foco principal é toda a engenharia de viagem (passagens aéreas, hospedagem selecionada, seguro viagem e receptivo/transfer). Em eventos parceiros selecionados, também orientamos sobre canais oficiais ou pacotes VIP integrados.",
      },
      {
        question: "E se o show mudar de data ou meu voo sofrer alteração da cia aérea?",
        answer: "Nossa equipe monitora os voos em tempo real e atua diretamente junto às companhias aéreas para reacomodação imediata conforme as regras da ANAC, sem que você precise enfrentar filas de call center.",
      },
    ],
  },
  {
    slug: "passagens-aereas-inteligentes",
    title: "Emissão Inteligente de Passagens Aéreas (Nacional & Internacional)",
    subtitle: "Transparência total: compare nossa tarifa exclusiva lado a lado com o preço direto nas companhias aéreas.",
    badge: "Motor Comparativo Exclusivo",
    shortDescription:
      "Pesquisa em tempo real com siglas IATA internacionais, cálculo preciso por idade de passageiros e comparativo direto com LATAM, GOL, Azul e cias internacionais.",
    heroDescription:
      "Chega de abrir 10 abas no navegador para descobrir se uma passagem está cara ou barata. Na Sing Viagens, você visualiza a composição real do preço e compara o mesmo voo com as principais companhias aéreas.",
    priceStartingAt: "Tarifas Net + Markup Transparente",
    idealFor: "Viajantes exigentes, famílias com crianças e executivos que buscam o melhor custo-benefício em classe Econômica, Premium Economy ou Executiva.",
    howItWorks: [
      {
        step: "01",
        title: "Pesquisa Padronizada IATA",
        description: "Escolha cidade/aeroporto de origem e destino, datas e adicione adultos e menores com suas respectivas idades.",
      },
      {
        step: "02",
        title: "Comparação Lado a Lado em Tempo Real",
        description: "Veja na mesma tela o valor de venda Sing (já estruturado) ao lado do valor praticado diretamente na LATAM, GOL, Azul, TAP ou American.",
      },
      {
        step: "03",
        title: "Emissão Segura e Localizador Imediato",
        description: "Finalize pelo Checkout Online ou com um consultor, recebendo seu e-ticket e código localizador (PNR) na sua conta Sing.",
      },
    ],
    deliverables: [
      "Bilhete aéreo emitido com código localizador oficial da companhia aérea",
      "Detalhamento completo da composição tarifária (Tarifa + Taxas + Franquia de Bagagem)",
      "Cálculo exato de tarifas diferenciadas para crianças (2 a 11 anos) e bebês (0 a 23 meses)",
      "Histórico salvo automaticamente no painel do cliente para futuras viagens",
    ],
    benefits: [
      {
        title: "Comparativo Honesto no Mesmo Voo",
        description: "Mostramos exatamente quanto custa na companhia titular do voo e nas concorrentes da rota.",
      },
      {
        title: "Acesso a Tarifas Acordo & Consolidação",
        description: "Conseguimos condições diferenciadas especialmente em emissões antecipadas, classe executiva e trechos internacionais.",
      },
      {
        title: "Suporte Pós-Venda Inclusivo",
        description: "Diferente dos grandes buscadores automatizados sem suporte, na Sing você tem especialistas reais cuidando do seu bilhete.",
      },
    ],
    faqs: [
      {
        question: "O bilhete emitido pela Sing dá direito a check-in no aplicativo oficial da companhia aérea?",
        answer: "Sim! Toda emissão gera um código localizador (PNR) oficial de 6 dígitos que pode ser consultado diretamente no site ou app da LATAM, GOL, Azul, TAP, etc.",
      },
      {
        question: "Como funciona a tarifa para menores de idade?",
        answer: "Seguimos rigorosamente o padrão das companhias aéreas: bebês de colo (0 a 1 ano) possuem desconto expressivo na tarifa base, e crianças de 2 a 11 anos contam com tarifa CHD dedicada e assento próprio.",
      },
    ],
  },
  {
    slug: "hospedagens-e-pacotes-vip",
    title: "Curadoria de Hospedagens & Experiências VIP",
    subtitle: "Hotéis boutique, resorts e estadias estrategicamente posicionadas para lazer de alto padrão e eventos.",
    badge: "Curadoria Premium",
    shortDescription:
      "Seleção rigorosa de hotéis no Brasil e no exterior com foco em conforto acústico, localização privilegiada e benefícios exclusivos de check-in.",
    heroDescription:
      "Uma excelente viagem depende de onde você descansa. Nossa curadoria avalia não apenas a classificação por estrelas, mas a logística real de deslocamento, segurança do bairro e qualidade do atendimento.",
    priceStartingAt: "Diárias e Pacotes Personalizados",
    idealFor: "Casais em viagens comemorativas, famílias e viajantes que valorizam conforto, design e localização estratégica.",
    howItWorks: [
      {
        step: "01",
        title: "Briefing de Perfil e Expectativa",
        description: "Entendemos seu estilo de viagem, necessidade de quartos conjugados para filhos ou proximidade a eventos.",
      },
      {
        step: "02",
        title: "Seleção Comparativa de 3 Opções Ideais",
        description: "Apresentamos uma proposta enxuta e certeira com os melhores hotéis da região escolhida.",
      },
      {
        step: "03",
        title: "Reserva Garantida e Mimos Sing",
        description: "Confirmamos sua reserva diretamente com a rede hoteleira e alinhamos pedidos especiais de boas-vindas.",
      },
    ],
    deliverables: [
      "Voucher oficial de hospedagem confirmado com café da manhã e taxas detalhadas",
      "Solicitação prioritária de Early Check-in / Late Check-out (conforme disponibilidade)",
      "Roteiro gastronômico e cultural do entorno do hotel",
      "Seguro viagem internacional com cobertura médica ampliada",
    ],
    benefits: [
      {
        title: "Hotéis Testados e Aprovados",
        description: "Zero surpresas desagradáveis: trabalhamos apenas com redes e propriedades de reputação comprovada.",
      },
      {
        title: "Tarifas de Operadora",
        description: "Condições especiais ao combinar passagem aérea + hospedagem na Sing.",
      },
    ],
    faqs: [
      {
        question: "Posso reservar apenas o hotel com a Sing?",
        answer: "Sim! Embora o pacote completo (Aéreo + Hotel) gere maior economia tarifária, realizamos reservas avulsas de hospedagem nacional e internacional.",
      },
    ],
  },
  {
    slug: "viagens-corporativas-e-grupos",
    title: "Gestão de Viagens Corporativas, Artistas & Grupos",
    subtitle: "Logística de precisão para empresas, equipes de produção, artistas e grupos de incentivo.",
    badge: "B2B & Grupos",
    shortDescription:
      "Controle de centro de custo, emissão ágil multi-passageiros, gestão de alterações de última hora e relatórios transparentes.",
    heroDescription:
      "Para empresas e produtoras de eventos, tempo é dinheiro. Oferecemos uma operação ágil com faturamento estruturado, relatórios de economia gerada e atendimento imediato para remarcações.",
    priceStartingAt: "Planos Corporativos Sob Consulta",
    idealFor: "Empresas, produtoras de shows, comitivas de congressos, equipes técnicas e grupos acima de 10 passageiros.",
    howItWorks: [
      {
        step: "01",
        title: "Cadastro Corporativo e Política de Viagens",
        description: "Definimos tetos de tarifa, antecedência de compra e aprovadores da sua empresa.",
      },
      {
        step: "02",
        title: "Cotação Expressa Multi-Cia",
        description: "Enviamos comparativos claros demonstrando o menor custo logístico e melhor malha aérea.",
      },
      {
        step: "03",
        title: "Gestão Contínua e Relatórios",
        description: "Acompanhamento de bilhetes em aberto (créditos de voos não voados) e relatórios mensais.",
      },
    ],
    deliverables: [
      "Atendimento executivo dedicado sem robôs de espera",
      "Bloqueios de grupo com condições especiais de pagamento e nomeação flexível",
      "Controle de créditos de passagens canceladas para reaproveitamento",
      "Relatório de Saving (economia obtida frente às tarifas públicas das cias)",
    ],
    benefits: [
      {
        title: "Redução de Custos Operacionais",
        description: "Nossa tecnologia compara todas as cias instantaneamente para garantir a melhor compra corporativa.",
      },
      {
        title: "Especialistas em Logística de Eventos",
        description: "Experiência real em movimentar equipes e grupos em datas de alta ocupação.",
      },
    ],
    faqs: [
      {
        question: "A partir de quantas pessoas consigo tarifa de grupo?",
        answer: "As companhias aéreas trabalham com bloqueios de grupo a partir de 10 passageiros viajando no mesmo voo, mas para grupos menores (4 a 9 pessoas) já aplicamos nossa inteligência de emissão combinada.",
      },
    ],
  },
];

export const PORTFOLIO_CASES = [
  {
    id: "case-the-town-vip",
    category: "Festivais & Música",
    title: "Operação Especial: 140 Viajantes para Festival Internacional em São Paulo",
    clientProfile: "Grupos de 6 capitais brasileiras (POA, REC, SSA, BSB, FOR, CWB)",
    metrics: [
      { label: "Economia Média no Aéreo", value: "24,8%" },
      { label: "Pontualidade / Sem Perda de Voo", value: "100%" },
      { label: "Nota de Satisfação (NPS)", value: "98/100" },
    ],
    before:
      "Viajantes comprando separadamente em cima da hora, pagando tarifas de pico acima de R$ 2.800 por trecho e hospedados a mais de 1h30 de distância do autódromo.",
    after:
      "Emissão coordenada com antecedência estratégica pela Sing Viagens (média de R$ 1.490 ida e volta), hospedagem na região da Berrini/Morumbi a 15 minutos da linha expressa e suporte 24h via WhatsApp.",
  },
  {
    id: "case-europa-shows",
    category: "Turnê Internacional",
    title: "Roteiro Musical Europa: Lisboa, Madri e Londres em Classe Executiva & Econômica Premium",
    clientProfile: "Casais e executivos acompanhando turnê mundial de verão europeu",
    metrics: [
      { label: "Economia em Executiva vs. Cia Direta", value: "R$ 4.320 / pax" },
      { label: "Cidades Conectadas", value: "3 Países" },
      { label: "Conexões Otimizadas", value: "Voos Diretos" },
    ],
    before:
      "Cotação direta nos sites das cias aéreas ultrapassava R$ 36.000 por casal devido a bilhetes múltiplos trechos comprados de forma avulsa.",
    after:
      "Estruturação inteligente Multi-City (Stopover em Lisboa sem custo adicional de tarifa aérea) reduzindo o investimento total em mais de R$ 8.600 por casal, com hotéis 5 estrelas selecionados.",
  },
  {
    id: "case-corporativo-produtora",
    category: "Viagens Corporativas",
    title: "Logística Aérea de Equipe Técnica e Artística em Turnê Nacional (8 Capitais)",
    clientProfile: "Produtora de Eventos & Entretenimento (28 profissionais)",
    metrics: [
      { label: "Bilhetes Emitidos em 30 dias", value: "224 trechos" },
      { label: "Saving Gerado no Trimestre", value: "R$ 68.400" },
      { label: "Tempo Médio de Remarcação", value: "8 minutos" },
    ],
    before:
      "Perda frequente de créditos de passagens não utilizadas, taxas abusivas de última hora e horas perdidas em call centers de companhias aéreas.",
    after:
      "Centralização na plataforma Sing com controle integral de bagagens técnicas, despacho prioritário e reacomodação imediata pelo plantão VIP.",
  },
];

export const TESTIMONIALS = [
  {
    id: "dep-1",
    name: "Mariana Alencar & Rodrigo",
    role: "Viajaram para Londres e Lisboa (Show no Wembley + Férias)",
    location: "Belo Horizonte, MG",
    rating: 5,
    date: "Há 2 semanas",
    source: "Google Reviews Verificado",
    highlight: "Economizamos R$ 3.100 nas passagens e tivemos a viagem mais tranquila da nossa vida!",
    comment:
      "Sempre comprávamos tudo sozinhos pela internet, mas para ir ao show em Londres queríamos segurança. Na página de pesquisa da Sing vimos na hora que o mesmo voo da British/LATAM estava bem mais vantajoso com eles. O atendimento em cobre e azul já mostra o capricho da marca!",
    videoDuration: "0:48",
    eventTag: "Wembley Stadium Tour",
  },
  {
    id: "dep-2",
    name: "Carlos Eduardo Fontes",
    role: "Diretor de Operações — Eventos Corporativos",
    location: "São Paulo, SP",
    rating: 5,
    date: "Há 1 mês",
    source: "Google Reviews Verificado",
    highlight: "O comparativo transparente com as cias aéreas ganhou nossa confiança imediata.",
    comment:
      "Como gestor, preciso justificar cada centavo de viagem da equipe. O sistema da Sing mostra o preço deles e, na coluna ao lado, quanto está na LATAM, GOL e Azul no mesmo voo. Além de mais barato em 90% das buscas, quando precisei mudar um voo às 23h de domingo, resolveram em 5 minutos.",
    videoDuration: "1:12",
    eventTag: "Logística Corporativa",
  },
  {
    id: "dep-3",
    name: "Fernanda & Família (2 adultos e 2 crianças)",
    role: "Viagem em Família para Orlando e Miami",
    location: "Curitiba, PR",
    rating: 5,
    date: "Há 1 mês",
    source: "Google Reviews Verificado",
    highlight: "Cálculo certinho das tarifas das crianças e assentos juntos sem dor de cabeça.",
    comment:
      "Viajar com duas crianças (de 4 e 9 anos) exige cuidado. Colocamos as idades no buscador da Sing, o preço já veio detalhado com o desconto infantil e eles cuidaram de toda a marcação de assentos para irmos juntos na ida e na volta.",
    videoDuration: "0:55",
    eventTag: "Férias em Família EUA",
  },
  {
    id: "dep-4",
    name: "Gabriel Martins",
    role: "Viajou para o Rock in Rio e Lollapalooza",
    location: "Recife, PE",
    rating: 5,
    date: "Há 2 meses",
    source: "Google Reviews Verificado",
    highlight: "A Sing realmente é o elo entre pessoas e eventos!",
    comment:
      "Fui de Recife para o Rio e depois para SP com a Sing. Peguei um voo excelente que na companhia aérea estava quase o dobro por causa da semana do festival. Já deixei salvo no meu histórico de conta para o próximo ano.",
    eventTag: "Festivais no Brasil",
  },
];

export const FAQ_ITEMS = [
  {
    category: "Pesquisa de Passagens e Preços",
    question: "Por que o preço da Sing Viagens consegue ser menor que direto na Companhia Aérea?",
    answer:
      "A Sing Viagens opera com acordos comerciais de consolidação, tarifas negociadas para pacotes/eventos e inteligência de emissão. Em nosso motor de pesquisa, aplicamos uma margem justa e parametrizada sobre nossa tarifa líquida (Net), permitindo que em grande parte das rotas nosso valor final fique abaixo da tarifa pública de balcão das companhias aéreas.",
  },
  {
    category: "Pesquisa de Passagens e Preços",
    question: "Como funciona a comparação lado a lado com as principais Cias Aéreas?",
    answer:
      "Ao pesquisar um trecho (ex.: GRU para GIG ou GRU para LIS), exibimos na coluna principal a nossa proposta completa com a composição transparente do valor e, na coluna ao lado, apresentamos os valores praticados pelas principais companhias aéreas que operam aquele destino e o mesmo voo, facilitando sua tomada de decisão sem precisar abrir vários sites.",
  },
  {
    category: "Passageiros e Menores de Idade",
    question: "Como são calculadas as passagens para crianças e bebês?",
    answer:
      "Seguimos a estrutura oficial da aviação comercial (IATA/ANAC): Adultos (12 anos ou mais), Crianças/CHD (2 a 11 anos incompletos na data do voo, com desconto na tarifa base e assento próprio) e Bebês/INF (0 a 23 meses no colo do responsável, pagando apenas percentual reduzido da tarifa e taxas aplicáveis). Ao informar a idade do menor no buscador, o sistema calcula automaticamente.",
  },
  {
    category: "Pagamentos e Segurança",
    question: "Quais são as formas de pagamento aceitas no Checkout?",
    answer:
      "Aceitamos pagamento via PIX (com confirmação imediata e emissão prioritária), Cartão de Crédito (em até 10x conforme regras da tarifa) e Faturamento Corporativo mediante análise prévia para empresas cadastradas.",
  },
  {
    category: "Prazos, Garantias e Cancelamentos",
    question: "Em quanto tempo recebo meu bilhete aéreo (e-ticket) e localizador?",
    answer:
      "Para pagamentos aprovados via PIX ou Cartão de Crédito no checkout, o processamento é imediato e o código localizador oficial (PNR) fica disponível em sua Área do Cliente (/conta) e no seu e-mail em poucos minutos.",
  },
  {
    category: "Prazos, Garantias e Cancelamentos",
    question: "Qual é a política de cancelamento e reembolso?",
    answer:
      "Cumprimos integralmente a Resolução nº 400 da ANAC e o Código de Defesa do Consumidor. Desistências em até 24 horas após o recebimento do comprovante (para compras feitas com 7 dias ou mais de antecedência do voo) têm reembolso integral de 100%. Após esse prazo, aplicam-se as regras tarifárias da família do bilhete adquirido, sempre com o suporte da equipe Sing para minimizar custos.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "como-comprar-passagens-para-grandes-shows-sem-pagar-tarifa-de-pico",
    title: "Como Comprar Passagens para Grandes Shows e Festivais Sem Pagar Tarifa de Pico",
    excerpt:
      "Descubra a janela ideal de antecedência e como os algoritmos das companhias aéreas reagem quando um grande artista anuncia turnê no Brasil ou no exterior.",
    category: "Inteligência Tarifária",
    readTime: "6 min de leitura",
    publishedAt: "10 Nov 2026",
    author: "Equipe de Especialistas Sing",
    content: [
      "Quando um megashow ou festival como Rock in Rio, The Town, Lollapalooza ou uma turnê mundial em estádio é anunciado, o sistema de Yield Management (gerenciamento dinâmico de tarifas) das companhias aéreas detecta o aumento súbito de buscas para aquela cidade e data específica.",
      "Em questão de horas, as classes tarifárias promocionais (Y, B, M mais baixas) são fechadas e restam apenas tarifas cheias no balcão direto das companhias.",
      "Na Sing Viagens, utilizamos três estratégias para proteger o bolso do viajante: 1) Acesso a inventário consolidado e acordos tarifários; 2) Mapeamento de aeroportos alternativos inteligentes (como combinar CGH/GRU/VCP ou SDU/GIG); e 3) Monitoramento de janelas de reabertura de lotes entre 60 e 45 dias antes do evento.",
      "Antes de emitir qualquer bilhete em data de alta demanda, utilize nosso Comparador de Preços Sing para visualizar lado a lado nossa tarifa estruturada contra o valor direto nas companhias aéreas.",
    ],
  },
  {
    slug: "guia-definitivo-siglas-iata-aeroportos-e-regras-para-viajar-com-menores",
    title: "Guia Definitivo: Siglas IATA de Aeroportos e Regras Atualizadas para Viajar com Crianças",
    excerpt:
      "Entenda por que escolher o aeroporto certo pela sigla de 3 letras faz toda a diferença na logística e quais documentos e descontos valem para menores de idade.",
    category: "Guia do Viajante",
    readTime: "5 min de leitura",
    publishedAt: "04 Nov 2026",
    author: "Concierge Sing Viagens",
    content: [
      "Toda cidade com múltiplos aeroportos possui códigos internacionais de três letras definidos pela IATA (International Air Transport Association). Em São Paulo, por exemplo, escolher entre GRU (Guarulhos), CGH (Congonhas) ou VCP (Viracopos) pode significar economizar 2 horas de trânsito até o local do seu evento ou reunião.",
      "Da mesma forma, ao viajar com crianças e adolescentes, é fundamental informar a idade exata que o menor terá na data do embarque. Bebês de 0 a 23 meses (INF) viajam no colo com desconto de até 90% na tarifa base, enquanto crianças de 2 a 11 anos (CHD) possuem assento próprio e desconto tarifário dedicado.",
      "Lembre-se também das normas do CNJ (Conselho Nacional de Justiça) para autorização de viagem de menores desacompanhados ou acompanhados de apenas um dos genitores em voos nacionais e internacionais.",
    ],
  },
  {
    slug: "turismo-musical-2026-2027-destinos-mais-procurados-do-mundo",
    title: "Turismo Musical em Alta: Os 7 Destinos Mais Procurados do Mundo para Combinar Viagem e Experiência",
    excerpt:
      "De Las Vegas (The Sphere) a Lisboa, Madri e São Paulo: veja como planejar uma viagem inesquecível unindo alta gastronomia, cultura e grandes espetáculos.",
    category: "Experiências & Eventos",
    readTime: "7 min de leitura",
    publishedAt: "28 Out 2026",
    author: "Diretoria Sing Viagens",
    content: [
      "O chamado 'Gig Tripping' (viajar especificamente para viver um grande concerto ou festival) consolidou-se como uma das maiores tendências do turismo mundial de alto padrão.",
      "Destinos como Las Vegas (impulsionada pelas experiências imersivas do The Sphere), Lisboa e Madri (com festivais de verão europeu e excelente conectividade aérea a partir do Brasil) e grandes capitais sul-americanas lideram os pedidos na Sing Viagens.",
      "Nosso papel como 'O Elo entre Pessoas e Eventos' é transformar o ingresso que você comprou em uma jornada impecável do momento em que você sai de casa até o retorno com memórias para a vida inteira.",
    ],
  },
];
