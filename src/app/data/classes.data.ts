// =============================================
// Static Data - classes and students
// =============================================

import { ClassInfo } from '../models/lesson.model';

export const CLASSES_DATA: ClassInfo[] = [
  {
    id: 'musicalizacao',
    title: 'Turma 01',
    subtitle: 'Musicaliza\u00E7\u00E3o',
    fullName: 'Turma 01 - MUSICALIZA\u00C7\u00C3O',
    engineType: 'generic',
    allowGroup: true,
    icon: 'recorder',
  },
  {
    id: 'teoria',
    title: 'Turma 01',
    subtitle: 'Teoria',
    fullName: 'Turma 01 - TEORIA',
    engineType: 'teoria',
    allowGroup: true,
    icon: 'metronome',
  },
  {
    id: 'cordas-01',
    title: 'Turma 01',
    subtitle: 'Cordas',
    fullName: 'Turma 01 - CORDAS',
    engineType: 'cordas',
    allowGroup: false,
    icon: 'violin-treble',
  },
  {
    id: 'cordas-02',
    title: 'Turma 02',
    subtitle: 'Cordas',
    fullName: 'Turma 02 - CORDAS',
    engineType: 'cordas',
    allowGroup: false,
    icon: 'violin-alto',
  },
  {
    id: 'madeiras-01',
    title: 'Turma 01',
    subtitle: 'Madeiras',
    fullName: 'Turma 01 - MADEIRAS',
    engineType: 'metais-madeiras',
    allowGroup: false,
    icon: 'clarinet',
  },
  {
    id: 'metais-01',
    title: 'Turma 01',
    subtitle: 'Metais',
    fullName: 'Turma 01 - METAIS',
    engineType: 'metais-madeiras',
    allowGroup: false,
    icon: 'trumpet',
  },
  {
    id: 'metais-02',
    title: 'Turma 02',
    subtitle: 'Metais',
    fullName: 'Turma 02 - METAIS',
    engineType: 'metais-madeiras',
    allowGroup: false,
    icon: 'euphonium',
  },
  {
    id: 'pratica-conjunto',
    title: 'Pr\u00E1tica em',
    subtitle: 'Conjunto',
    fullName: 'PR\u00C1TICA EM CONJUNTO',
    engineType: 'generic',
    allowGroup: true,
    icon: 'orchestra',
  },
];

export const STUDENTS_BY_CLASS: Record<string, string[]> = {
  musicalizacao: [
    'Ana Clara Oliveira', 'Pedro Henrique Santos', 'Maria Luiza Costa',
    'Gabriel Ferreira', 'Isabela Rodrigues', 'Lucas Almeida',
    'Beatriz Carvalho', 'Matheus Souza', 'Laura Pereira',
    'Davi Lima', 'Sofia Martins', 'Arthur Nascimento',
  ],
  teoria: [
    'Rafael Barbosa', 'Julia Ribeiro', 'Felipe Goncalves',
    'Camila Araujo', 'Thiago Melo', 'Fernanda Dias',
    'Bruno Cardoso', 'Mariana Monteiro',
  ],
  'cordas-01': [
    'Helena Castro', 'Enzo Rocha', 'Valentina Moreira',
    'Bernardo Nunes', 'Alice Teixeira', 'Nicolas Mendes', 'Larissa Campos',
  ],
  'cordas-02': [
    'Manuela Vieira', 'Gustavo Correia', 'Cecilia Ramos',
    'Leonardo Pinto', 'Isadora Azevedo', 'Samuel Lopes',
  ],
  'madeiras-01': [
    'Aurora Silva', 'Henrique Duarte', 'Luana Batista',
    'Caio Rezende', 'Yasmin Freitas', 'Ryan Machado', 'Elisa Fonseca',
  ],
  'metais-01': [
    'Miguel Costa', 'Clara Santos', 'Joao Vitor Lima',
    'Ana Beatriz Ferreira', 'Daniel Oliveira', 'Maria Eduarda Souza',
    'Heitor Almeida', 'Luiza Carvalho',
  ],
  'metais-02': [
    'Antonio Pereira', 'Carolina Martins', 'Tomas Ribeiro',
    'Gabriela Goncalves', 'Pedro Lucas Araujo', 'Stella Melo',
  ],
  'pratica-conjunto': [
    'Ana Clara Oliveira', 'Rafael Barbosa', 'Helena Castro',
    'Miguel Costa', 'Aurora Silva', 'Enzo Rocha', 'Julia Ribeiro',
    'Manuela Vieira', 'Gustavo Correia', 'Henrique Duarte',
    'Clara Santos', 'Antonio Pereira', 'Pedro Henrique Santos',
    'Fernanda Dias', 'Valentina Moreira',
  ],
};