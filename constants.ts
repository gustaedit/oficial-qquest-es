
import { Tags, Question, QuestionPackage } from './types';

export const INITIAL_TAGS: Tags = {
  institutions: ['PC-BA (Polícia Civil da Bahia)'],
  positions: ['Investigador de Polícia PC-BA', 'Escrivão de Polícia PC-BA', 'Delegado de Polícia PC-BA', 'Perito Criminal PC-BA'],
  boards: ['IBFC', 'FGV', 'Cebraspe', 'Vunesp'],
  disciplines: [
    'Direito Penal', 
    'Direito Processual Penal', 
    'Língua Portuguesa', 
    'Informática Policial', 
    'Criminologia', 
    'Medicina Legal', 
    'Direito Administrativo', 
    'Direito Constitucional', 
    'Raciocínio Lógico',
    'Igualdade Racial e de Gênero'
  ],
  topics: {
    'Direito Penal': ['Crimes contra a Vida', 'Crimes contra o Patrimônio', 'Teoria do Crime', 'Aplicação da Lei Penal'],
    'Direito Processual Penal': ['Inquérito Policial', 'Prisão e Liberdade', 'Provas', 'Ação Penal'],
    'Criminologia': ['Escolas Criminológicas', 'Vitimologia', 'Prevenção de Delitos'],
    'Medicina Legal': ['Tanatologia', 'Traumatologia Forense', 'Asfixiologia'],
    'Igualdade Racial e de Gênero': ['Legislação Específica BA', 'Estatuto da Igualdade Racial']
  },
  contestClasses: ['Operacional', 'Delta', 'Perícia', 'Administrativo'],
  years: ['2025', '2024', '2023', '2022', '2021']
};

export const INITIAL_QUESTIONS: Question[] = [
  // --- CARREIRA: OPERACIONAL (3 questões) ---
  {
    id: 'op-001',
    text: 'Sobre as características do Inquérito Policial (IP) no ordenamento jurídico brasileiro, assinale a alternativa que descreve corretamente a atuação da Autoridade Policial:',
    options: [
      { id: 'a', label: 'A', text: 'O IP é um procedimento judicial obrigatório para o oferecimento da denúncia.' },
      { id: 'b', label: 'B', text: 'A autoridade policial pode mandar arquivar autos de inquérito por falta de provas.' },
      { id: 'c', label: 'C', text: 'O inquérito policial tem natureza administrativa, sendo um procedimento inquisitivo e preparatório.' },
      { id: 'd', label: 'D', text: 'O contraditório e a ampla defesa são plenos e obrigatórios durante a fase investigativa.' },
      { id: 'e', label: 'E', text: 'O IP deve ser concluído sempre em 30 dias, independente de o réu estar preso ou solto.' }
    ],
    correctOptionId: 'c',
    comment: 'O IP é um procedimento administrativo informativo. O Art. 17 do CPP veda expressamente que a autoridade policial mande arquivar autos de inquérito.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Processual Penal',
    topic: 'Inquérito Policial',
    difficulty: 'Médio',
    contestClass: 'Operacional',
    createdAt: Date.now()
  },
  {
    id: 'op-002',
    text: 'Configura o crime de ROUBO (Art. 157, CP), diferenciando-o do furto, o emprego de:',
    options: [
      { id: 'a', label: 'A', text: 'Destreza na subtração do objeto.' },
      { id: 'b', label: 'B', text: 'Abuso de confiança.' },
      { id: 'c', label: 'C', text: 'Violência ou grave ameaça à pessoa.' },
      { id: 'd', label: 'D', text: 'Escalada ou rompimento de obstáculo.' },
      { id: 'e', label: 'E', text: 'Fraude para diminuir a vigilância da vítima.' }
    ],
    correctOptionId: 'c',
    comment: 'A elementar que diferencia o roubo do furto é a violência ou grave ameaça contra a pessoa (vis corporalis ou vis compulsiva).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Escrivão de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Penal',
    topic: 'Crimes contra o Patrimônio',
    difficulty: 'Fácil',
    contestClass: 'Operacional',
    createdAt: Date.now()
  },
  {
    id: 'op-003',
    text: 'De acordo com a Lei Orgânica da Polícia Civil da Bahia, constitui uma das garantias do policial civil no exercício do cargo:',
    options: [
      { id: 'a', label: 'A', text: 'A imunidade penal total em atos de serviço.' },
      { id: 'b', label: 'B', text: 'O uso de transporte público gratuito apenas em folga.' },
      { id: 'c', label: 'C', text: 'Prisão especial, à disposição da autoridade judiciária competente, em unidade policial civil.' },
      { id: 'd', label: 'D', text: 'Porte de arma de fogo restrito ao horário de serviço.' },
      { id: 'e', label: 'E', text: 'Vitaliciedade imediata após a posse.' }
    ],
    correctOptionId: 'c',
    comment: 'A prisão especial em unidade policial é uma prerrogativa funcional garantida por lei orgânica para preservar a integridade do agente.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Direito Administrativo',
    topic: 'Legislação Específica BA',
    difficulty: 'Médio',
    contestClass: 'Operacional',
    createdAt: Date.now()
  },

  // --- CARREIRA: DELTA (3 questões) ---
  {
    id: 'dt-001',
    text: 'No controle concentrado de constitucionalidade, a Ação Direta de Inconstitucionalidade (ADI) pode ter como objeto:',
    options: [
      { id: 'a', label: 'A', text: 'Leis ou atos normativos federais e estaduais contrários à Constituição Federal.' },
      { id: 'b', label: 'B', text: 'Apenas leis municipais que firam a Constituição Federal.' },
      { id: 'c', label: 'C', text: 'Atos administrativos de efeitos concretos sem força normativa.' },
      { id: 'd', label: 'D', text: 'Leis anteriores à promulgação da Constituição de 1988.' },
      { id: 'e', label: 'E', text: 'Decisões judiciais transitadas em julgado.' }
    ],
    correctOptionId: 'a',
    comment: 'A ADI ataca leis federais ou estaduais pós-constitucionais. Leis pré-constitucionais são tratadas via ADPF (não recepção).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Delegado de Polícia PC-BA',
    board: 'FGV',
    year: '2024',
    discipline: 'Direito Constitucional',
    topic: 'Controle de Constitucionalidade',
    difficulty: 'Difícil',
    contestClass: 'Delta',
    createdAt: Date.now()
  },
  {
    id: 'dt-002',
    text: 'Sobre a Teoria do Crime, o erro que incide sobre a ilicitude do fato, quando o agente acredita que sua conduta é permitida pelo direito, denomina-se:',
    options: [
      { id: 'a', label: 'A', text: 'Erro de tipo essencial.' },
      { id: 'b', label: 'B', text: 'Erro de proibição.' },
      { id: 'c', label: 'C', text: 'Descriminante putativa por erro de tipo.' },
      { id: 'd', label: 'D', text: 'Aberratio ictus.' },
      { id: 'e', label: 'E', text: 'Erro sobre a pessoa.' }
    ],
    correctOptionId: 'b',
    comment: 'O erro de proibição exclui a potencial consciência da ilicitude, afetando a culpabilidade (Art. 21, CP).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Delegado de Polícia PC-BA',
    board: 'FGV',
    year: '2024',
    discipline: 'Direito Penal',
    topic: 'Teoria do Crime',
    difficulty: 'Difícil',
    contestClass: 'Delta',
    createdAt: Date.now()
  },
  {
    id: 'dt-003',
    text: 'O atributo do ato administrativo que obriga o particular ao cumprimento da ordem, independentemente de sua concordância, chama-se:',
    options: [
      { id: 'a', label: 'A', text: 'Presunção de Legitimidade.' },
      { id: 'b', label: 'B', text: 'Autoexecutoriedade.' },
      { id: 'c', label: 'C', text: 'Imperatividade.' },
      { id: 'd', label: 'D', text: 'Tipicidade.' },
      { id: 'e', label: 'E', text: 'Razoabilidade.' }
    ],
    correctOptionId: 'c',
    comment: 'Imperatividade é a imposição coercitiva do ato ao particular. A autoexecutoriedade permite a execução direta pelo Estado.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Delegado de Polícia PC-BA',
    board: 'FGV',
    year: '2024',
    discipline: 'Direito Administrativo',
    topic: 'Atos Administrativos',
    difficulty: 'Médio',
    contestClass: 'Delta',
    createdAt: Date.now()
  },

  // --- CARREIRA: PERÍCIA (3 questões) ---
  {
    id: 'pr-001',
    text: 'Na Tanatologia Forense, a rigidez cadavérica (rigor mortis) ocorre devido a processos físico-químicos musculares. Assinale a alternativa correta sobre sua progressão:',
    options: [
      { id: 'a', label: 'A', text: 'Inicia-se pelos pés e sobe para a cabeça (Lei de Nysten reversa).' },
      { id: 'b', label: 'B', text: 'Inicia-se pela face, mandíbula e pescoço, progredindo para os membros.' },
      { id: 'c', label: 'C', text: 'É um fenômeno abiótico imediato.' },
      { id: 'd', label: 'D', text: 'Desaparece imediatamente após a putrefação iniciar.' },
      { id: 'e', label: 'E', text: 'Não ocorre em mortes por asfixia.' }
    ],
    correctOptionId: 'b',
    comment: 'Pela Lei de Nysten, a rigidez segue a ordem crânio-caudal (face, pescoço, tronco, membros superiores e inferiores).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Perito Criminal PC-BA',
    board: 'Cebraspe',
    year: '2021',
    discipline: 'Medicina Legal',
    topic: 'Tanatologia',
    difficulty: 'Fácil',
    contestClass: 'Perícia',
    createdAt: Date.now()
  },
  {
    id: 'pr-002',
    text: 'A Cadeia de Custódia compreende o conjunto de todos os procedimentos utilizados para manter e documentar a história cronológica do vestígio. O estágio que consiste no ato de selar o vestígio em embalagem própria é o:',
    options: [
      { id: 'a', label: 'A', text: 'Reconhecimento.' },
      { id: 'b', label: 'B', text: 'Isolamento.' },
      { id: 'c', label: 'C', text: 'Acondicionamento.' },
      { id: 'd', label: 'D', text: 'Fixação.' },
      { id: 'e', label: 'E', text: 'Coleta.' }
    ],
    correctOptionId: 'c',
    comment: 'O acondicionamento é a etapa de embalagem individualizada e selagem do vestígio coletado (Art. 158-B, CPP).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Perito Criminal PC-BA',
    board: 'Cebraspe',
    year: '2021',
    discipline: 'Direito Processual Penal',
    topic: 'Provas',
    difficulty: 'Médio',
    contestClass: 'Perícia',
    createdAt: Date.now()
  },
  {
    id: 'pr-003',
    text: 'As lesões produzidas por instrumentos perfurocortantes (como facas de dois gumes) apresentam como característica principal:',
    options: [
      { id: 'a', label: 'A', text: 'Bordas irregulares e escoriadas.' },
      { id: 'b', label: 'B', text: 'Predomínio da profundidade sobre a extensão.' },
      { id: 'c', label: 'C', text: 'Fundo de lesão com pontes de tecido íntegro.' },
      { id: 'd', label: 'D', text: 'Forma de "casa de botão" ou ogival.' },
      { id: 'e', label: 'E', text: 'Halo de enxugo e tatuagem.' }
    ],
    correctOptionId: 'd',
    comment: 'As lesões perfurocortantes (inciso-perfurantes) apresentam a forma ogival ou de botoeira, respeitando as leis de Filhós e Langer.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Perito Criminal PC-BA',
    board: 'Cebraspe',
    year: '2021',
    discipline: 'Medicina Legal',
    topic: 'Traumatologia Forense',
    difficulty: 'Difícil',
    contestClass: 'Perícia',
    createdAt: Date.now()
  },

  // --- CARREIRA: ADMINISTRATIVO / GERAL (3 questões) ---
  {
    id: 'ad-001',
    text: 'Segundo o Estatuto da Igualdade Racial e de Combate à Intolerância Religiosa do Estado da Bahia (Lei 13.182/14), as ações afirmativas visam:',
    options: [
      { id: 'a', label: 'A', text: 'Punir criminalmente todos os atos de preconceito.' },
      { id: 'b', label: 'B', text: 'Eliminar as desigualdades históricas acumuladas por grupos étnico-raciais.' },
      { id: 'c', label: 'C', text: 'Garantir o livre acesso a templos religiosos apenas em datas festivas.' },
      { id: 'd', label: 'D', text: 'Instituir o ensino obrigatório de línguas europeias apenas.' },
      { id: 'e', label: 'E', text: 'Proibir a prática de capoeira em locais públicos.' }
    ],
    correctOptionId: 'b',
    comment: 'Ações afirmativas são medidas temporárias adotadas pelo Estado para corrigir disparidades históricas (Art. 4º da Lei 13.182/14).',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Escrivão de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Igualdade Racial e de Gênero',
    topic: 'Estatuto da Igualdade Racial',
    difficulty: 'Fácil',
    contestClass: 'Administrativo',
    createdAt: Date.now()
  },
  {
    id: 'ad-002',
    text: 'Considere a premissa: "Se o investigador é eficiente, então o crime é solucionado". Sabendo que o crime não foi solucionado, conclui-se que:',
    options: [
      { id: 'a', label: 'A', text: 'O investigador é eficiente.' },
      { id: 'b', label: 'B', text: 'O investigador não é eficiente.' },
      { id: 'c', label: 'C', text: 'O investigador solucionou outro crime.' },
      { id: 'd', label: 'D', text: 'O crime foi arquivado por falta de provas.' },
      { id: 'e', label: 'E', text: 'Não se pode concluir nada sobre a eficiência.' }
    ],
    correctOptionId: 'b',
    comment: 'Pela regra do Modus Tollens (P -> Q, ~Q |- ~P), se a consequência é falsa, a premissa antecedente também deve ser falsa.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Raciocínio Lógico',
    topic: 'Lógica Sentencial',
    difficulty: 'Médio',
    contestClass: 'Administrativo',
    createdAt: Date.now()
  },
  {
    id: 'ad-003',
    text: 'O malware que infecta um computador, criptografa os arquivos do usuário e exige pagamento de resgate é o:',
    options: [
      { id: 'a', label: 'A', text: 'Adware.' },
      { id: 'b', label: 'B', text: 'Spyware.' },
      { id: 'c', label: 'C', text: 'Ransomware.' },
      { id: 'd', label: 'D', text: 'Trojan.' },
      { id: 'e', label: 'E', text: 'Worm.' }
    ],
    correctOptionId: 'c',
    comment: 'Ransomware (Ransom = Resgate) é o software malicioso de sequestro de dados mediante extorsão.',
    institution: 'PC-BA (Polícia Civil da Bahia)',
    position: 'Investigador de Polícia PC-BA',
    board: 'IBFC',
    year: '2022',
    discipline: 'Informática Policial',
    topic: 'Segurança da Informação',
    difficulty: 'Fácil',
    contestClass: 'Administrativo',
    createdAt: Date.now()
  }
];

export const INITIAL_PACKAGES: QuestionPackage[] = [
  {
    id: 'simulado-zero-pcba',
    name: 'SIMULADO ZERO: OPERAÇÃO BAHIA',
    description: 'Nivelamento tático com 10 questões fundamentais abrangendo todas as carreiras da PC-BA.',
    questionIds: [
      'op-001', 'op-002', 'op-003', // Operacional
      'dt-001', 'dt-002',           // Delta
      'pr-001', 'pr-002',           // Perícia
      'ad-001', 'ad-002', 'ad-003'  // Administrativo/Geral
    ],
    createdAt: Date.now()
  }
];
