import { Tags, Question, QuestionPackage } from './types';

// ─────────────────────────────────────────────
// TAGS — alinhadas ao Edital PC-BA 2026
// ─────────────────────────────────────────────
export const INITIAL_TAGS: Tags = {
  institutions: ['PC-BA (Polícia Civil da Bahia)'],

  positions: [
    'Investigador de Polícia PC-BA',
    'Escrivão de Polícia PC-BA',
    'Delegado de Polícia PC-BA',
    'Perito Criminal PC-BA',
  ],

  boards: ['IBFC', 'FGV', 'Cebraspe', 'Vunesp', 'AOCP'],

  // ── Matérias Comuns (todos os cargos) ──
  // ── + Específicas por cargo ──
  disciplines: [
    // Comuns
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Informática',
    'Atualidades',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Penal',
    'Direito Processual Penal',
    'Legislação Penal Especial',
    'Promoção da Igualdade Racial e de Gênero',
    'Medicina Legal',
    // Específicas — Investigador
    'Contabilidade Geral',
    'Matemática Financeira',
    // Específicas — Escrivão
    'Arquivologia',
    'Estatística',
  ],

  topics: {
    // ── Língua Portuguesa ──
    'Língua Portuguesa': [
      'Compreensão e Interpretação de Textos',
      'Tipologia e Gêneros Textuais',
      'Ortografia e Acentuação',
      'Morfologia',
      'Sintaxe',
      'Concordância Nominal e Verbal',
      'Regência Nominal e Verbal',
      'Crase',
      'Pontuação',
      'Semântica e Estilística',
      'Coesão e Coerência Textual',
      'Figuras de Linguagem',
      'Redação Oficial',
    ],

    // ── Raciocínio Lógico ──
    'Raciocínio Lógico': [
      'Lógica Proposicional',
      'Tabela-Verdade',
      'Equivalências Lógicas',
      'Silogismo e Inferências',
      'Conjuntos e Diagramas',
      'Sequências e Progressões',
      'Raciocínio Analítico',
      'Problemas de Contagem',
      'Probabilidade Básica',
    ],

    // ── Informática ──
    'Informática': [
      'Conceitos Básicos de Hardware e Software',
      'Sistemas Operacionais (Windows e Linux)',
      'Pacote Office (Word, Excel, PowerPoint)',
      'Internet e Navegadores',
      'Segurança da Informação',
      'Malwares e Proteção',
      'Redes de Computadores',
      'Backup e Armazenamento em Nuvem',
      'Noções de Banco de Dados',
    ],

    // ── Atualidades ──
    'Atualidades': [
      'Política Nacional e Internacional',
      'Economia e Mercado de Trabalho',
      'Segurança Pública no Brasil',
      'Meio Ambiente e Sustentabilidade',
      'Saúde Pública',
      'Ciência e Tecnologia',
      'Cultura e Sociedade',
      'Bahia em Foco',
    ],

    // ── Direito Constitucional ──
    'Direito Constitucional': [
      'Princípios Fundamentais da CF/88',
      'Direitos e Garantias Fundamentais',
      'Direitos Individuais e Coletivos',
      'Direitos Sociais',
      'Remédios Constitucionais',
      'Organização do Estado',
      'Organização dos Poderes',
      'Administração Pública — Princípios',
      'Servidores Públicos',
      'Controle de Constitucionalidade',
      'Ordem Social e Econômica',
      'Segurança Pública na CF/88',
    ],

    // ── Direito Administrativo ──
    'Direito Administrativo': [
      'Princípios do Direito Administrativo',
      'Atos Administrativos',
      'Poderes Administrativos',
      'Organização da Administração Pública',
      'Agentes Públicos e Servidores',
      'Responsabilidade Civil do Estado',
      'Controle da Administração',
      'Licitações e Contratos (Lei 14.133/21)',
      'Bens Públicos',
      'Serviços Públicos',
      'Improbidade Administrativa',
      'Processo Administrativo',
      'Legislação PC-BA e Lei Orgânica',
    ],

    // ── Direito Penal ──
    'Direito Penal': [
      'Aplicação da Lei Penal',
      'Teoria do Crime',
      'Tipicidade, Ilicitude e Culpabilidade',
      'Excludentes de Ilicitude',
      'Excludentes de Culpabilidade',
      'Concurso de Pessoas',
      'Concurso de Crimes',
      'Penas e Aplicação',
      'Crimes contra a Vida',
      'Crimes contra a Integridade Física',
      'Crimes contra a Honra',
      'Crimes contra a Liberdade Individual',
      'Crimes contra o Patrimônio',
      'Crimes contra a Administração Pública',
      'Crimes contra a Fé Pública',
      'Crimes de Trânsito',
    ],

    // ── Direito Processual Penal ──
    'Direito Processual Penal': [
      'Inquérito Policial',
      'Ação Penal',
      'Competência',
      'Provas',
      'Cadeia de Custódia',
      'Prisão em Flagrante',
      'Prisão Preventiva e Temporária',
      'Medidas Cautelares',
      'Liberdade Provisória',
      'Procedimentos Penais',
      'Recursos',
      'Execução Penal',
      'Tribunal do Júri',
    ],

    // ── Legislação Penal Especial ──
    'Legislação Penal Especial': [
      'Lei de Drogas (Lei 11.343/06)',
      'Lei Maria da Penha (Lei 11.340/06)',
      'Estatuto do Desarmamento (Lei 10.826/03)',
      'Lei de Tortura (Lei 9.455/97)',
      'Lei de Crimes Hediondos (Lei 8.072/90)',
      'Abuso de Autoridade (Lei 13.869/19)',
      'ECA — Estatuto da Criança e do Adolescente',
      'Estatuto do Idoso',
      'Crimes Ambientais (Lei 9.605/98)',
      'Lei Antiterrorismo (Lei 13.260/16)',
      'Lavagem de Dinheiro (Lei 9.613/98)',
      'Lei de Interceptação Telefônica (Lei 9.296/96)',
      'Organizações Criminosas (Lei 12.850/13)',
    ],

    // ── Promoção da Igualdade Racial e de Gênero ──
    'Promoção da Igualdade Racial e de Gênero': [
      'Estatuto da Igualdade Racial (Lei 12.288/10)',
      'Lei Caó — Racismo (Lei 7.716/89)',
      'Lei Evaristo de Moraes (Injúria Racial)',
      'Lei Maria da Penha — Aspectos Sociológicos',
      'Feminicídio (Art. 121, §2º, VI, CP)',
      'Convenção sobre Eliminação da Discriminação Racial',
      'Convenção de Belém do Pará',
      'Legislação Baiana — Lei 13.182/14',
      'Política Nacional de Enfrentamento à Violência contra Mulher',
      'Comunidades Quilombolas e Proteção Constitucional',
    ],

    // ── Medicina Legal ──
    'Medicina Legal': [
      'Conceitos e Divisão da Medicina Legal',
      'Tanatologia Forense',
      'Fenômenos Cadavéricos',
      'Traumatologia Forense',
      'Lesões por Instrumento Contundente',
      'Lesões por Instrumento Cortante e Perfurante',
      'Lesões por Arma de Fogo',
      'Asfixiologia Forense',
      'Toxicologia Forense',
      'Sexologia Forense',
      'Infortunística',
      'Perícia e Documentos Médico-Legais',
    ],

    // ── Contabilidade Geral (Investigador) ──
    'Contabilidade Geral': [
      'Conceitos e Princípios Contábeis',
      'Patrimônio e suas Variações',
      'Plano de Contas',
      'Escrituração Contábil',
      'Balanço Patrimonial',
      'Demonstração do Resultado do Exercício (DRE)',
      'Receitas e Despesas',
      'Depreciação, Amortização e Exaustão',
      'Estoques',
      'Conciliação Bancária',
    ],

    // ── Matemática Financeira (Investigador) ──
    'Matemática Financeira': [
      'Razão, Proporção e Regra de Três',
      'Porcentagem e Variação Percentual',
      'Juros Simples',
      'Juros Compostos',
      'Desconto Simples e Composto',
      'Séries Uniformes (Anuidades)',
      'Sistemas de Amortização',
      'Taxa Nominal e Taxa Efetiva',
    ],

    // ── Arquivologia (Escrivão) ──
    'Arquivologia': [
      'Conceito e Funções do Arquivo',
      'Tipos de Arquivo',
      'Teoria das Três Idades (Ciclo Vital)',
      'Gestão de Documentos',
      'Classificação e Arranjo',
      'Avaliação e Destinação de Documentos',
      'Tabela de Temporalidade',
      'Arquivamento e Protocolo',
      'Preservação e Conservação',
      'Arquivos Digitais e Gestão Eletrônica',
      'Lei de Acesso à Informação (Lei 12.527/11)',
    ],

    // ── Estatística (Escrivão) ──
    'Estatística': [
      'Conceitos Básicos de Estatística',
      'Coleta e Organização de Dados',
      'Tabelas e Gráficos',
      'Medidas de Tendência Central (Média, Mediana, Moda)',
      'Medidas de Dispersão (Variância, Desvio Padrão)',
      'Distribuição de Frequências',
      'Probabilidade',
      'Distribuições de Probabilidade (Binomial, Normal)',
      'Amostragem',
      'Correlação e Regressão Linear',
    ],
  },

  contestClasses: ['Investigador', 'Escrivão', 'Delegado', 'Perito'],

  years: ['2026', '2025', '2024', '2023', '2022', '2021'],
};

// ─────────────────────────────────────────────
// QUESTÕES DE SEED — cobrindo todas as disciplinas
// ─────────────────────────────────────────────
const NOW = Date.now();

export const INITIAL_QUESTIONS: Question[] = [

  // ── Língua Portuguesa ──
  {
    id: 'lp-001',
    text: 'Assinale a alternativa em que a concordância verbal está CORRETA de acordo com a norma culta da língua portuguesa:',
    options: [
      { id: 'a', label: 'A', text: 'Fazem dois anos que ele ingressou na corporação.' },
      { id: 'b', label: 'B', text: 'Houveram muitas irregularidades no processo seletivo.' },
      { id: 'c', label: 'C', text: 'Cerca de metade dos investigadores foram aprovados no curso de atualização.' },
      { id: 'd', label: 'D', text: 'Mais de um delegado assinou o relatório e se arrependeu.' },
      { id: 'e', label: 'E', text: 'A maioria dos peritos compareceram à reunião técnica.' },
    ],
    correctOptionId: 'd',
    comment: 'A expressão "mais de um" em sujeito simples leva o verbo para o singular quando os verbos são coordenados (assinou e se arrependeu). As demais alternativas: "faz" é impessoal (A), "houve" é impessoal (B), "metade" admite concordância com o especificador plural (C está errada por exigir "foram" após "metade dos investigadores", que é correto — leia com atenção), e "maioria" é sujeito coletivo que pode ir para o plural, mas o erro está em "compareceram" após "maioria" singular quando não há especificador.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Língua Portuguesa',
    topic: 'Concordância Nominal e Verbal',
    difficulty: 'Médio',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Raciocínio Lógico ──
  {
    id: 'rl-001',
    text: 'Considere a proposição: "Se o suspeito estava no local, então deixou vestígios". Sabendo-se que o suspeito NÃO deixou vestígios, qual conclusão é logicamente válida?',
    options: [
      { id: 'a', label: 'A', text: 'O suspeito estava no local.' },
      { id: 'b', label: 'B', text: 'O suspeito não estava no local.' },
      { id: 'c', label: 'C', text: 'Outro suspeito estava no local.' },
      { id: 'd', label: 'D', text: 'Os vestígios foram apagados.' },
      { id: 'e', label: 'E', text: 'Não é possível concluir nada.' },
    ],
    correctOptionId: 'b',
    comment: 'Aplica-se o Modus Tollens: se P → Q e ~Q, então ~P. A negação da consequente implica a negação da antecedente. Logo, "o suspeito não estava no local" é a única conclusão válida.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Raciocínio Lógico',
    topic: 'Lógica Proposicional',
    difficulty: 'Médio',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Informática ──
  {
    id: 'ti-001',
    text: 'Um delegado recebeu um e-mail com link suspeito e, ao clicar, um programa instalou-se silenciosamente, criptografou todos os arquivos do computador e exibiu mensagem pedindo pagamento em criptomoeda para a recuperação dos dados. Esse tipo de malware é denominado:',
    options: [
      { id: 'a', label: 'A', text: 'Spyware.' },
      { id: 'b', label: 'B', text: 'Adware.' },
      { id: 'c', label: 'C', text: 'Ransomware.' },
      { id: 'd', label: 'D', text: 'Rootkit.' },
      { id: 'e', label: 'E', text: 'Keylogger.' },
    ],
    correctOptionId: 'c',
    comment: 'Ransomware (ransom = resgate) sequestra dados do sistema via criptografia e exige pagamento para liberação. É o principal vetor de ataques a órgãos públicos. Spyware espiona, adware exibe anúncios, rootkit oculta processos e keylogger registra teclas.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Escrivão de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Informática',
    topic: 'Segurança da Informação',
    difficulty: 'Fácil',
    contestClass: 'Escrivão',
    createdAt: NOW,
  },

  // ── Direito Constitucional ──
  {
    id: 'dc-001',
    text: 'De acordo com a Constituição Federal de 1988, a segurança pública é dever do Estado, direito e responsabilidade de todos, sendo exercida pelos seguintes órgãos, EXCETO:',
    options: [
      { id: 'a', label: 'A', text: 'Polícia Federal.' },
      { id: 'b', label: 'B', text: 'Polícia Rodoviária Federal.' },
      { id: 'c', label: 'C', text: 'Polícia Civil.' },
      { id: 'd', label: 'D', text: 'Forças Armadas.' },
      { id: 'e', label: 'E', text: 'Guardas Municipais.' },
    ],
    correctOptionId: 'd',
    comment: 'O Art. 144 da CF/88 elenca os órgãos de segurança pública: Polícia Federal, Rodoviária Federal, Ferroviária Federal, Policias Civis, Militares, Corpos de Bombeiros e Guardas Municipais. As Forças Armadas destinam-se à defesa da Pátria (Art. 142), não integrando o rol do Art. 144.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Constitucional',
    topic: 'Segurança Pública na CF/88',
    difficulty: 'Fácil',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Direito Administrativo ──
  {
    id: 'da-001',
    text: 'O atributo do ato administrativo que permite ao Estado executar materialmente suas decisões sem necessidade de autorização judicial prévia, quando houver previsão legal ou urgência, denomina-se:',
    options: [
      { id: 'a', label: 'A', text: 'Imperatividade.' },
      { id: 'b', label: 'B', text: 'Presunção de Legitimidade.' },
      { id: 'c', label: 'C', text: 'Autoexecutoriedade.' },
      { id: 'd', label: 'D', text: 'Tipicidade.' },
      { id: 'e', label: 'E', text: 'Presunção de Veracidade.' },
    ],
    correctOptionId: 'c',
    comment: 'A autoexecutoriedade (executoriedade) permite que a Administração execute diretamente suas decisões sem recorrer ao Judiciário. Distingue-se da imperatividade (poder de impor obrigações) e da presunção de legitimidade (presunção de validade dos atos).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Administrativo',
    topic: 'Atos Administrativos',
    difficulty: 'Médio',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Direito Penal ──
  {
    id: 'dp-001',
    text: 'Sobre o Inquérito Policial, analise as assertivas e assinale a CORRETA:',
    options: [
      { id: 'a', label: 'A', text: 'O IP é procedimento judicial, devendo ser presidido por juiz de direito.' },
      { id: 'b', label: 'B', text: 'A autoridade policial pode, motivadamente, arquivar autos de inquérito.' },
      { id: 'c', label: 'C', text: 'O IP tem natureza administrativa, inquisitiva e dispensável para o ajuizamento da ação penal.' },
      { id: 'd', label: 'D', text: 'O indiciado no IP tem direito ao contraditório e ampla defesa plenos.' },
      { id: 'e', label: 'E', text: 'O prazo do IP preso é de 30 dias, improrrogáveis, conforme o CPP.' },
    ],
    correctOptionId: 'c',
    comment: 'O IP é procedimento administrativo (não judicial), presidido pela autoridade policial, de natureza inquisitiva (sem contraditório pleno) e prescindível — o MP pode oferecer denúncia com outras peças de informação. O Art. 17 do CPP proíbe a autoridade policial de arquivar o IP.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Processual Penal',
    topic: 'Inquérito Policial',
    difficulty: 'Fácil',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Direito Processual Penal ──
  {
    id: 'dpp-001',
    text: 'Quanto à Prisão em Flagrante, é correto afirmar que:',
    options: [
      { id: 'a', label: 'A', text: 'Somente autoridade policial pode efetuar a prisão em flagrante.' },
      { id: 'b', label: 'B', text: 'Qualquer do povo PODE prender quem esteja em flagrante delito.' },
      { id: 'c', label: 'C', text: 'A prisão em flagrante é espécie de prisão preventiva.' },
      { id: 'd', label: 'D', text: 'O auto de prisão em flagrante dispensa a lavratura de boletim de ocorrência.' },
      { id: 'e', label: 'E', text: 'O juiz deve homologar o flagrante em até 48h apenas nos crimes hediondos.' },
    ],
    correctOptionId: 'b',
    comment: 'Art. 301 do CPP: "Qualquer do povo PODERÁ e as autoridades policiais e seus agentes DEVERÃO prender quem quer que seja encontrado em flagrante delito." A prisão em flagrante é cautelar precautelar, distinta da preventiva. O juiz deve apreciar o flagrante em 24h (Art. 310 do CPP).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Escrivão de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Processual Penal',
    topic: 'Prisão em Flagrante',
    difficulty: 'Médio',
    contestClass: 'Escrivão',
    createdAt: NOW,
  },

  // ── Legislação Penal Especial ──
  {
    id: 'lpe-001',
    text: 'De acordo com a Lei Maria da Penha (Lei 11.340/06), a violência doméstica e familiar contra a mulher compreende qualquer ação ou omissão baseada no gênero. São formas de violência previstas na lei, EXCETO:',
    options: [
      { id: 'a', label: 'A', text: 'Violência física.' },
      { id: 'b', label: 'B', text: 'Violência psicológica.' },
      { id: 'c', label: 'C', text: 'Violência sexual.' },
      { id: 'd', label: 'D', text: 'Violência institucional.' },
      { id: 'e', label: 'E', text: 'Violência patrimonial.' },
    ],
    correctOptionId: 'd',
    comment: 'O Art. 7º da Lei 11.340/06 prevê cinco formas de violência: física, psicológica, sexual, patrimonial e moral. A "violência institucional" não está listada expressamente nesse artigo, sendo conceito da saúde pública, não da lei específica.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Legislação Penal Especial',
    topic: 'Lei Maria da Penha (Lei 11.340/06)',
    difficulty: 'Fácil',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Promoção da Igualdade Racial e de Gênero ──
  {
    id: 'irg-001',
    text: 'Segundo o Estatuto da Igualdade Racial (Lei 12.288/10), o conceito de "população negra" abrange:',
    options: [
      { id: 'a', label: 'A', text: 'Apenas os indivíduos de cor preta, excluindo os pardos.' },
      { id: 'b', label: 'B', text: 'O conjunto de pessoas que se autodeclaram pretas ou pardas, conforme o IBGE.' },
      { id: 'c', label: 'C', text: 'Somente descendentes de africanos escravizados.' },
      { id: 'd', label: 'D', text: 'Pessoas negras estrangeiras em situação regular no Brasil.' },
      { id: 'e', label: 'E', text: 'Indivíduos que possuam documento comprobatório de ancestralidade africana.' },
    ],
    correctOptionId: 'b',
    comment: 'O Art. 1º, parágrafo único, IV da Lei 12.288/10 define "população negra" como o conjunto de pessoas que se autodeclaram pretas ou pardas, conforme o quesito cor ou raça usado pelo IBGE. O critério é a autodeclaração.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Promoção da Igualdade Racial e de Gênero',
    topic: 'Estatuto da Igualdade Racial (Lei 12.288/10)',
    difficulty: 'Médio',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Medicina Legal ──
  {
    id: 'ml-001',
    text: 'Na Tanatologia Forense, o fenômeno de endurecimento muscular que ocorre após a morte e segue a ordem crânio-caudal (face → pescoço → tronco → membros), denominado rigor mortis, tem como causa principal:',
    options: [
      { id: 'a', label: 'A', text: 'Acúmulo de ácido lático e consumo de ATP nas fibras musculares.' },
      { id: 'b', label: 'B', text: 'Desidratação progressiva dos tecidos musculares após a morte.' },
      { id: 'c', label: 'C', text: 'Coagulação do sangue no interior dos vasos musculares.' },
      { id: 'd', label: 'D', text: 'Ação direta de bactérias anaeróbias na musculatura.' },
      { id: 'e', label: 'E', text: 'Contração reflexa do sistema nervoso autônomo residual.' },
    ],
    correctOptionId: 'a',
    comment: 'O rigor mortis resulta da paralisação da produção de ATP (adenosina trifosfato) após a morte, impedindo o relaxamento muscular. Há acúmulo de ácido lático e ligação permanente entre actina e miosina. Pela Lei de Nysten, inicia-se na musculatura da face e progride em sentido crânio-caudal.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Perito Criminal PC-BA',
    board: 'Cebraspe',
    year: '2021',
    discipline: 'Medicina Legal',
    topic: 'Tanatologia Forense',
    difficulty: 'Médio',
    contestClass: 'Perito',
    createdAt: NOW,
  },

  // ── Contabilidade Geral (Investigador) ──
  {
    id: 'cg-001',
    text: 'No Balanço Patrimonial, os bens e direitos de uma entidade são classificados como:',
    options: [
      { id: 'a', label: 'A', text: 'Passivo.' },
      { id: 'b', label: 'B', text: 'Patrimônio Líquido.' },
      { id: 'c', label: 'C', text: 'Ativo.' },
      { id: 'd', label: 'D', text: 'Receita Bruta.' },
      { id: 'e', label: 'E', text: 'Resultado do Exercício.' },
    ],
    correctOptionId: 'c',
    comment: 'O Ativo representa os bens (imóveis, veículos, dinheiro em caixa) e direitos (contas a receber, créditos) de uma entidade. O Passivo representa as obrigações, e o Patrimônio Líquido é a diferença entre Ativo e Passivo (situação líquida).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Contabilidade Geral',
    topic: 'Balanço Patrimonial',
    difficulty: 'Fácil',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Matemática Financeira (Investigador) ──
  {
    id: 'mf-001',
    text: 'Um investigador aplicou R$ 5.000,00 a uma taxa de juros simples de 3% ao mês durante 4 meses. Qual o montante ao final do período?',
    options: [
      { id: 'a', label: 'A', text: 'R$ 5.150,00' },
      { id: 'b', label: 'B', text: 'R$ 5.600,00' },
      { id: 'c', label: 'C', text: 'R$ 5.630,00' },
      { id: 'd', label: 'D', text: 'R$ 6.000,00' },
      { id: 'e', label: 'E', text: 'R$ 5.060,00' },
    ],
    correctOptionId: 'b',
    comment: 'Juros Simples: J = C × i × t → J = 5.000 × 0,03 × 4 = R$ 600,00. Montante M = C + J = 5.000 + 600 = R$ 5.600,00.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Matemática Financeira',
    topic: 'Juros Simples',
    difficulty: 'Fácil',
    contestClass: 'Investigador',
    createdAt: NOW,
  },

  // ── Arquivologia (Escrivão) ──
  {
    id: 'arq-001',
    text: 'Na Teoria das Três Idades (Ciclo Vital dos Documentos), o arquivo que guarda documentos de uso corrente, consultados frequentemente pela entidade que os produziu, é denominado:',
    options: [
      { id: 'a', label: 'A', text: 'Arquivo intermediário.' },
      { id: 'b', label: 'B', text: 'Arquivo permanente.' },
      { id: 'c', label: 'C', text: 'Arquivo corrente.' },
      { id: 'd', label: 'D', text: 'Arquivo morto.' },
      { id: 'e', label: 'E', text: 'Arquivo especial.' },
    ],
    correctOptionId: 'c',
    comment: 'Pela Teoria das Três Idades: 1ª idade = Arquivo Corrente (uso frequente); 2ª idade = Arquivo Intermediário (aguarda destinação final, consulta esporádica); 3ª idade = Arquivo Permanente (valor histórico ou probatório, guarda definitiva). "Arquivo morto" é expressão leiga incorreta.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Escrivão de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Arquivologia',
    topic: 'Teoria das Três Idades (Ciclo Vital)',
    difficulty: 'Fácil',
    contestClass: 'Escrivão',
    createdAt: NOW,
  },

  // ── Estatística (Escrivão) ──
  {
    id: 'est-001',
    text: 'Em uma delegacia, o número de ocorrências registradas em 5 dias consecutivos foi: 4, 7, 5, 7, 7. Assinale a alternativa que apresenta, respectivamente, a média, a mediana e a moda desse conjunto de dados:',
    options: [
      { id: 'a', label: 'A', text: 'Média = 6; Mediana = 7; Moda = 7.' },
      { id: 'b', label: 'B', text: 'Média = 7; Mediana = 6; Moda = 5.' },
      { id: 'c', label: 'C', text: 'Média = 5; Mediana = 7; Moda = 7.' },
      { id: 'd', label: 'D', text: 'Média = 6; Mediana = 5; Moda = 7.' },
      { id: 'e', label: 'E', text: 'Média = 6; Mediana = 6; Moda = 7.' },
    ],
    correctOptionId: 'a',
    comment: 'Média = (4+7+5+7+7)/5 = 30/5 = 6. Ordenando: 4, 5, 7, 7, 7 → Mediana = valor central = 7. Moda = valor mais frequente = 7 (aparece 3 vezes). Resposta: Média=6, Mediana=7, Moda=7.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Escrivão de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Estatística',
    topic: 'Medidas de Tendência Central (Média, Mediana, Moda)',
    difficulty: 'Fácil',
    contestClass: 'Escrivão',
    createdAt: NOW,
  },

  // ── Direito Penal — Delegado ──
  {
    id: 'dp-delta-001',
    text: 'Sobre o Erro de Proibição no Direito Penal brasileiro, é correto afirmar:',
    options: [
      { id: 'a', label: 'A', text: 'O erro de proibição incide sobre os elementos do tipo penal e exclui o dolo.' },
      { id: 'b', label: 'B', text: 'O erro de proibição inevitável isenta de pena; o evitável pode reduzi-la de 1/6 a 1/3.' },
      { id: 'c', label: 'C', text: 'O erro de proibição afeta a tipicidade subjetiva do crime.' },
      { id: 'd', label: 'D', text: 'O erro de proibição e o erro de tipo são institutos equivalentes no Código Penal.' },
      { id: 'e', label: 'E', text: 'O erro de proibição evitável isenta de pena quando o agente é primário.' },
    ],
    correctOptionId: 'b',
    comment: 'Art. 21 do CP: o erro sobre a ilicitude do fato (erro de proibição), quando inevitável, isenta de pena; quando evitável, pode reduzi-la de 1/6 a 1/3. O erro de proibição afeta a culpabilidade (potencial consciência da ilicitude), não o dolo. O erro de tipo (Art. 20) afeta a tipicidade e exclui o dolo.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Delegado de Polícia PC-BA',
    board: 'FGV',
    year: '2024',
    discipline: 'Direito Penal',
    topic: 'Tipicidade, Ilicitude e Culpabilidade',
    difficulty: 'Difícil',
    contestClass: 'Delegado',
    createdAt: NOW,
  },
];

// ─────────────────────────────────────────────
// PACOTES DE SIMULADO
// ─────────────────────────────────────────────
export const INITIAL_PACKAGES: QuestionPackage[] = [
  {
    id: 'simulado-geral-2026',
    name: 'SIMULADO GERAL PC-BA 2026',
    description: 'Abrange todas as disciplinas do edital 2026. Ideal para nivelamento inicial e diagnóstico de pontos fracos.',
    questionIds: [
      'lp-001', 'rl-001', 'ti-001', 'dc-001', 'da-001',
      'dp-001', 'dpp-001', 'lpe-001', 'irg-001', 'ml-001',
    ],
    createdAt: NOW,
  },
  {
    id: 'simulado-investigador-2026',
    name: 'SIMULADO INVESTIGADOR PC-BA 2026',
    description: 'Foco nas matérias comuns e específicas do cargo de Investigador: Contabilidade Geral e Matemática Financeira.',
    questionIds: [
      'lp-001', 'rl-001', 'dc-001', 'dp-001', 'lpe-001',
      'cg-001', 'mf-001',
    ],
    createdAt: NOW,
  },
  {
    id: 'simulado-escrivao-2026',
    name: 'SIMULADO ESCRIVÃO PC-BA 2026',
    description: 'Foco nas matérias comuns e específicas do cargo de Escrivão: Arquivologia e Estatística.',
    questionIds: [
      'lp-001', 'ti-001', 'dc-001', 'dpp-001', 'irg-001',
      'arq-001', 'est-001',
    ],
    createdAt: NOW,
  },
  {
    id: 'simulado-delegado-2026',
    name: 'SIMULADO DELEGADO PC-BA 2026',
    description: 'Questões de nível elevado focadas no cargo de Delegado de Polícia: Penal, Processual Penal e Constitucional.',
    questionIds: [
      'dc-001', 'da-001', 'dp-001', 'dpp-001', 'dp-delta-001',
      'lpe-001', 'ml-001',
    ],
    createdAt: NOW,
  },
];