
import { Subject, Question, Achievement } from './types';

export const PMSP_SUBJECTS = Object.values(Subject);

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Recruta Exemplar',
    description: 'Completou o primeiro simulado geral.',
    icon: '🎖️',
    unlocked: true,
    progress: 100,
    category: 'simulado'
  },
  {
    id: '2',
    title: 'Mestre da VUNESP',
    description: 'Acertou 90% das questões de Português.',
    icon: '📚',
    unlocked: false,
    progress: 65,
    category: 'estudo'
  },
  {
    id: '3',
    title: 'Zero Pane',
    description: 'Estudou por 7 dias seguidos sem interrupções.',
    icon: '🔥',
    unlocked: true,
    progress: 100,
    category: 'estudo'
  },
  {
    id: '4',
    title: 'Sniper Matemático',
    description: 'Acertou 10 questões seguidas de raciocínio lógico.',
    icon: '🎯',
    unlocked: false,
    progress: 40,
    category: 'simulado'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: "1",
    subject: Subject.PORTUGUESE,
    text: "No trecho 'O soldado agiu com cautela', o termo destacado exerce a função de:",
    options: [
      "Adjunto adnominal",
      "Adjunto adverbial",
      "Complemento nominal",
      "Objeto direto"
    ],
    correctAnswer: 1,
    explanation: "'Com cautela' indica o modo como a ação foi realizada, sendo, portanto, um adjunto adverbial de modo."
  },
  {
    id: "2",
    subject: Subject.MATHEMATICS,
    text: "Um batalhão possui 120 soldados. Se 30% estão de folga, quantos soldados estão em serviço?",
    options: [
      "36",
      "84",
      "90",
      "80"
    ],
    correctAnswer: 1,
    explanation: "30% de 120 = 36. 120 - 36 = 84 soldados em serviço."
  }
];

export const SYLLABUS_SUMMARY = {
  [Subject.PORTUGUESE]: ["Interpretação de textos", "Gramática", "Pontuação", "Concordância"],
  [Subject.MATHEMATICS]: ["Razão e proporção", "Porcentagem", "Equações do 1º grau", "Geometria"],
  [Subject.GENERAL_KNOWLEDGE]: ["História do Brasil", "Geografia de SP", "Atualidades"],
  [Subject.COMPUTER_SCIENCE]: ["Windows 10", "Office 2016", "Navegadores", "Segurança"],
  [Subject.ADMIN_LAW]: ["Constituição Federal", "Constituição de SP", "Direitos Humanos"]
};
