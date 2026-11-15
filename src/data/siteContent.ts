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
    title: "Passagens Aéreas para Shows, Festivais e Grandes Eventos",
    subtitle: "O elo entre você e o seu show: chegue no horário certo e economize nas passagens aéreas.",
    badge: "Especialidade Sing",
    shortDescription:
      "Emissão estratégica de passagens aéreas para os maiores shows e festivais do Brasil e do mundo, protegendo você contra as tarifas de pico das companhias.",
    heroDescription:
      "Quando um grande show ou festival é anunciado, os preços das passagens aéreas disparam nas companhias. A Sing Turismo utiliza inteligência de emissão por milhas e tarifas negociadas para conectar você ao seu evento com economia real e horários seguros.",
    priceStartingAt: "Economia comparada em tempo real",
    idealFor:
      "Fãs de música, casais e amigos viajando para assistir grandes shows, festivais nacionais e turnês internacionais.",
    howItWorks: [
      {
        step: "01",
        title: "Escolha a Cidade do Show e as Datas",
        description:
          "Informe sua cidade de origem, o destino do evento e a quantidade de viajantes (adultos e crianças).",
      },
      {
        step: "02",
        title: "Compare o Preço Sing vs. Companhias Aéreas",
        description:
          "Veja na mesma tela o nosso valor final ao lado do preço cobrado diretamente na LATAM, GOL, Azul, TAP ou American no mesmo voo.",
      },
      {
        step: "03",
        title: "Emissão Imediata com Localizador Oficial",
        description:
          "Receba seu bilhete emitido com código localizador oficial da companhia aérea e conte com nosso suporte até o seu retorno.",
      },
    ],
    deliverables: [
      "Passagens aéreas emitidas com código localizador oficial da companhia",
      "Horários planejados com margem segura para você não perder nenhum minuto do show",
      "Comparativo transparente entre o valor Sing e a tarifa direta da companhia aérea",
      "Orientação completa sobre franquia de bagagem e documentos de embarque",
      "Suporte humano ágil pelo WhatsApp em caso de alteração de malha aérea",
    ],
    benefits: [
      {
        title: "Fuga das Tarifas de Pico em Datas de Show",
        description:
          "Enquanto o preço em dinheiro sobe nos dias de festival, nossa emissão inteligente reduz drasticamente o custo do seu voo.",
      },
      {
        title: "Retorno Planejado Pós-Espetáculo",
        description:
          "Selecionamos os melhores horários de volta para que você descanse após o show antes de embarcar.",
      },
      {
        title: "Atendimento de Quem Entende a Emoção do Palco",
        description:
          "Cuidamos do seu voo com a mesma atenção que você dedicou para garantir o seu ingresso.",
      },
    ],
    faqs: [
      {
        question: "A passagem emitida pela Sing funciona direto no aplicativo da companhia aérea?",
        answer:
          "Sim! Assim que sua emissão é concluída, você recebe o código localizador oficial para fazer check-in e acompanhar o voo diretamente no aplicativo da LATAM, GOL, Azul, TAP ou companhia escolhida.",
      },
      {
        question: "E se a companhia aérea alterar o horário do meu voo antes do show?",
        answer:
          "Nossa equipe acompanha sua reserva e atua imediatamente junto à companhia aérea para reacomodar você no melhor horário disponível, sem que você precise perder horas em filas de atendimento.",
      },
    ],
  },
  {
    slug: "passagens-aereas-inteligentes",
    title: "Passagens Aéreas Nacionais e Internacionais com Comparativo",
    subtitle: "Compare nossa proposta lado a lado com o valor direto nas companhias aéreas.",
    badge: "Menor Tarifa Auditada",
    shortDescription:
      "Pesquisa rápida de voos nacionais e internacionais com cálculo automático para adultos e crianças e comparação direta com as principais companhias.",
    heroDescription:
      "Você não precisa abrir dezenas de abas para descobrir onde a passagem está mais vantajosa. Em uma única pesquisa na Sing Turismo, você visualiza nosso preço final ao lado do valor cobrado pelas principais companhias aéreas para o mesmo voo.",
    priceStartingAt: "Comparação instantânea por trecho",
    idealFor:
      "Viajantes individuais, casais e famílias com crianças que buscam economia real e segurança na compra de passagens aéreas.",
    howItWorks: [
      {
        step: "01",
        title: "Informe Origem, Destino e Passageiros",
        description:
          "Digite a cidade de partida e chegada, escolha as datas de ida e volta e informe a idade das crianças, se houver.",
      },
      {
        step: "02",
        title: "Analise o Comparativo Lado a Lado",
        description:
          "Confira o valor de venda da Sing Turismo e compare imediatamente com o valor do mesmo voo nas companhias aéreas.",
      },
      {
        step: "03",
        title: "Finalize com Segurança no Checkout",
        description:
          "Pague via PIX ou cartão de crédito e acompanhe seu pedido e histórico diretamente na sua conta.",
      },
    ],
    deliverables: [
      "Bilhete aéreo nacional ou internacional com localizador oficial",
      "Cálculo automático de tarifas diferenciadas para crianças (2 a 11 anos) e bebês (0 a 1 ano)",
      "Transparência total com taxas de embarque já incluídas no valor final",
      "Histórico de pesquisas salvo na sua conta para retomar quando quiser",
    ],
    benefits: [
      {
        title: "Economia Comprovada na Mesma Tela",
        description:
          "Você enxerga exatamente quanto está economizando em relação à compra tradicional no balcão da companhia.",
      },
      {
        title: "Suporte Humano Dedicado",
        description:
          "Se precisar de ajuda antes do embarque, você fala diretamente com nossos especialistas.",
      },
    ],
    faqs: [
      {
        question: "Como funciona o desconto para crianças e bebês na passagem aérea?",
        answer:
          "Ao informar a idade da criança na data do voo em nosso buscador, o sistema aplica automaticamente a regra oficial das companhias aéreas para bebês de colo (0 a 1 ano) e crianças (2 a 11 anos).",
      },
      {
        question: "As taxas de embarque já estão incluídas no valor apresentado?",
        answer:
          "Sim! Todos os valores exibidos na Sing Turismo já mostram o preço final completo com as taxas aeroportuárias.",
      },
    ],
  },
  {
    slug: "hospedagens-e-pacotes-vip",
    title: "Passagens em Classe Executiva & Cabines Premium",
    subtitle: "Conforto máximo em voos internacionais para seus eventos e viagens especiais.",
    badge: "AltaEconomia em Executiva",
    shortDescription:
      "Emissão especializada em Classe Executiva e Econômica Premium para Europa, Estados Unidos e América do Sul com até 40% de economia.",
    heroDescription:
      "Viajar para um grande concerto internacional ou férias especiais em Classe Executiva não precisa custar o preço cheio cobrado pelas companhias aéreas. Nossa gestão avançada de emissão permite emitir cabines premium por uma fração do valor tradicional.",
    priceStartingAt: "Condições exclusivas em Executiva",
    idealFor:
      "Viajantes em voos de longa distância (EUA e Europa) que desejam poltrona-cama (flat-bed), acesso a Salas VIP e embarque prioritário.",
    howItWorks: [
      {
        step: "01",
        title: "Selecione Classe Executiva ou Econômica Premium",
        description:
          "No buscador de passagens, alterne a cabine para Executiva ou Econômica Premium e escolha sua rota internacional.",
      },
      {
        step: "02",
        title: "Compare com a Tarifa Cheia da Companhia",
        description:
          "Veja a diferença expressiva entre o valor da emissão inteligente Sing e o bilhete comercial direto na companhia.",
      },
      {
        step: "03",
        title: "Embarque com Todos os Benefícios VIP",
        description:
          "Desfrute de franquia ampliada de bagagem, check-in preferencial e acesso às salas VIP oficiais da companhia aérea.",
      },
    ],
    deliverables: [
      "Bilhete oficial em Classe Executiva ou Econômica Premium",
      "Acesso às Salas VIP e franquia de bagagem despachada da categoria",
      "Marcação de assentos preferenciais incluída",
      "Atendimento prioritário Sing antes e durante a viagem",
    ],
    benefits: [
      {
        title: "A Maior Economia Percentual da Aviação",
        description:
          "É justamente na Classe Executiva que a emissão via milhas da Sing gera as maiores diferenças a seu favor frente ao preço da companhia.",
      },
      {
        title: "Chegue Descansado para o Seu Evento",
        description:
          "Durma em poltrona 180° durante o voo noturno e aproveite o destino desde o primeiro dia.",
      },
    ],
    faqs: [
      {
        question: "Tenho direito à Sala VIP mesmo comprando com a economia da Sing?",
        answer:
          "Sim! O bilhete emitido em Classe Executiva pela Sing garante exatamente os mesmos direitos de embarque prioritário, franquia de bagagem e Sala VIP da companhia aérea operadora.",
      },
    ],
  },
  {
    slug: "viagens-corporativas-e-grupos",
    title: "Passagens Aéreas para Grupos, Bandas e Equipes de Eventos",
    subtitle: "Coordenação aérea para amigos indo ao mesmo show, artistas, produtoras e empresas.",
    badge: "Grupos & Corporativo",
    shortDescription:
      "Emissão sincronizada de passagens aéreas para múltiplos passageiros, garantindo que todo o grupo chegue junto pelo melhor custo.",
    heroDescription:
      "Seja um grupo de amigos viajando para o mesmo festival ou uma equipe profissional em turnê pelo Brasil, comprar várias passagens de uma vez no site da companhia costuma elevar o preço de todos os assentos. Nós estruturamos a emissão do seu grupo com inteligência tarifária.",
    priceStartingAt: "Atendimento dedicado para múltiplos viajantes",
    idealFor:
      "Grupos de amigos em festivais, famílias grandes, equipes de produção, artistas e empresas.",
    howItWorks: [
      {
        step: "01",
        title: "Envie os Dados da Rota e Quantidade de Pessoas",
        description:
          "Simule no buscador até 9 passageiros ou solicite atendimento direto para grupos maiores.",
      },
      {
        step: "02",
        title: "Estruturação Inteligente de Assentos",
        description:
          "Evitamos o aumento artificial de preços ao dividir ou combinar lotes tarifários no mesmo voo.",
      },
      {
        step: "03",
        title: "Emissão Centralizada e Controle de Bilhetes",
        description:
          "Todos os localizadores organizados em um único painel com suporte rápido para remarcações.",
      },
    ],
    deliverables: [
      "Emissão coordenada no mesmo voo ou janela de horário",
      "Comparativo claro demonstrando a economia total gerada para o grupo",
      "Gestão de bagagens e marcação de assentos próximos",
      "Canal direto via WhatsApp para alterações de última hora",
    ],
    benefits: [
      {
        title: "Todos no Mesmo Voo Sem Pagar Mais Caro",
        description:
          "Sabemos como emitir múltiplos bilhetes sem acionar o gatilho de alta tarifária automática das companhias.",
      },
      {
        title: "Agilidade para Imprevistos",
        description:
          "Se alguém do grupo precisar alterar o voo, nossa equipe resolve rapidamente.",
      },
    ],
    faqs: [
      {
        question: "Como faço para cotar passagens para mais de 9 pessoas no mesmo show?",
        answer:
          "Para grupos a partir de 10 pessoas, basta clicar no botão de Contato / WhatsApp para que nosso time monte o bloqueio e a emissão combinada na hora para você.",
      },
    ],
  },
];

export const PORTFOLIO_CASES: any[] = [];
export const TESTIMONIALS: any[] = [];

export const FAQ_ITEMS = [
  {
    category: "Passagens e Economia",
    question: "Por que a passagem aérea na Sing Turismo é mais barata que direto na companhia?",
    answer:
      "Porque utilizamos gestão inteligente de milhas aéreas e acordos tarifários. Quando o custo da emissão por milhas (já somando as taxas) é menor que o valor cobrado em dinheiro no site da companhia aérea, nós repassamos essa economia diretamente para você no preço final.",
  },
  {
    category: "Comparativo de Voos",
    question: "O voo mostrado na Sing é exatamente o mesmo da companhia aérea?",
    answer:
      "Sim! Você viaja no mesmo avião, no mesmo horário e com o mesmo número de voo (LATAM, GOL, Azul, TAP, American Airlines, etc.), recebendo seu código localizador oficial para fazer check-in direto no aplicativo da companhia.",
  },
  {
    category: "Viajantes e Crianças",
    question: "Como funciona a passagem para crianças e bebês de colo?",
    answer:
      "Basta informar no nosso buscador quantos adultos e quantas crianças vão viajar, selecionando a idade de cada criança na data do voo (de 0 a 11 anos). O sistema aplica automaticamente o desconto correspondente de bebê de colo (0 a 1 ano) ou criança (2 a 11 anos).",
  },
  {
    category: "Pagamentos e Emissão",
    question: "Quais são as formas de pagamento e quando recebo meu código localizador?",
    answer:
      "Você pode pagar via PIX ou Cartão de Crédito diretamente no nosso Checkout seguro. Após a confirmação, seu código localizador oficial (PNR) fica disponível na sua conta Sing e é enviado para o seu e-mail e WhatsApp.",
  },
  {
    category: "Garantias e Cancelamento",
    question: "Posso cancelar ou remarcar minha passagem aérea se houver imprevisto?",
    answer:
      "Sim. Seguimos integralmente as normas da ANAC (incluindo o direito de desistência sem custo em até 24h após a emissão para compras feitas com pelo menos 7 dias de antecedência do embarque) e prestamos todo o suporte pelo WhatsApp caso você precise remarcar seu voo.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "como-comprar-passagens-para-grandes-shows-sem-pagar-tarifa-de-pico",
    title: "Como Comprar Passagens Aéreas para Grandes Shows Sem Pagar Tarifa de Pico",
    excerpt:
      "Entenda por que os preços sobem tanto nos sites das companhias quando um show é anunciado e como garantir seu voo pagando menos.",
    category: "Passagens para Shows",
    readTime: "4 min de leitura",
    publishedAt: "10 Nov 2026",
    author: "Especialistas Sing Turismo",
    content: [
      "Assim que um grande artista ou festival divulga as datas de apresentação, milhares de fãs buscam voos para a mesma cidade e no mesmo final de semana.",
      "O sistema automático das companhias aéreas percebe esse aumento de procura e encerra rapidamente os lotes promocionais em dinheiro, deixando apenas as tarifas mais altas no site oficial.",
      "Na Sing Turismo, comparamos o valor comercial da companhia com o nosso custo de emissão via milhas aéreas. Dessa forma, mesmo em finais de semana de estádio lotado, conseguimos oferecer o mesmo voo por um valor muito mais equilibrado.",
    ],
  },
  {
    slug: "dicas-para-viajar-com-criancas-de-aviao-descontos-e-documentos",
    title: "Vai Viajar com Crianças de Avião? Veja Como Funcionam os Descontos por Idade",
    excerpt:
      "Saiba como informar corretamente a idade na data do embarque para aproveitar as tarifas reduzidas de bebês e crianças.",
    category: "Dicas de Embarque",
    readTime: "4 min de leitura",
    publishedAt: "04 Nov 2026",
    author: "Atendimento Sing Turismo",
    content: [
      "Na aviação comercial, a idade que conta para o valor da passagem é sempre a idade que a criança terá no dia do voo.",
      "Bebês de 0 a 1 ano (até 23 meses) viajam no colo de um adulto responsável e contam com desconto expressivo na tarifa. Já crianças de 2 a 11 anos viajam em assento próprio e também possuem desconto especial.",
      "Ao pesquisar na Sing Turismo, basta selecionar a idade de cada criança que o valor total já aparece calculado com precisão.",
    ],
  },
];
