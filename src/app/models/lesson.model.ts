// =============================================
// lesson.model.ts - Shared types and helpers
// =============================================

export interface StructuredGroup {
  methodName: string;
  details: string[];
}

export interface StructuredRecord {
  metodo: StructuredGroup[];
  hinario: StructuredGroup[];
  escalas: StructuredGroup[];
  outros: string;
}

export type AttendanceMap = Record<string, boolean>;

export interface LessonRecord {
  id: string;
  turmaId: string;
  date: string;
  presentStudents: string[];
  totalStudents: number;
  mode: 'individual' | 'group';
  studentRecords: Record<string, StructuredRecord>;
}

export interface ClassInfo {
  id: string;
  title: string;
  subtitle: string;
  fullName: string;
  engineType: string;
  allowGroup: boolean;
  icon: string;
  instrument?: string;
  active?: boolean;
}

export interface ClassHistory {
  turmaId: string;
  turmaName: string;
  totalLessons: number;
  avgPresent: number;
  totalStudents: number;
  percentage: number;
  lessons: LessonRecord[];
}

export interface StudentFrequency {
  turmaId: string;
  turmaName: string;
  present: number;
  total: number;
  percentage: number;
}

export type FlowStep = 'choose' | 'individual-tree' | 'group-engine' | 'personalizado-engine' | 'review';

export interface TurmaConfig {
  engine: string;
  allowGroup: boolean;
}

// ---- Auth / User types ----

export type UserRole = 'dev' | 'master' | 'registrador';
export type UserFuncao = 'Desenvolvedor' | 'Encarregado' | 'Instrutor' | 'Apoiador';

export interface AppUser {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  funcao: UserFuncao | string;
  active: boolean;
  allowedClasses: string[];
}

// ---- Management types ----

export interface StudentData {
  id: string;
  fullName: string;
  instrument: string;
  nivel: string;
  active: boolean;
  enrollments: string[];
}

export type ClassType = 'Teoria e Solfejo' | 'Musicalização' | 'Cordas' | 'Madeiras' | 'Metais' | 'Personalizado';

export interface TurmaData {
  id: string;
  description: string;
  type: ClassType;
  instrument: string;
  active: boolean;
  engineType: string;
  allowGroup: boolean;
  icon: string;
  subLabel?: string; // extra label for Teoria (ex: Infantil, Geral, Avançado...)
}

export function emptyStructuredRecord(): StructuredRecord {
  return { metodo: [], hinario: [], escalas: [], outros: '' };
}

import { CLASSES_DATA } from '../data/classes.data';

export function getTurmaConfig(turmaId: string): TurmaConfig {
  const info = CLASSES_DATA.find(c => c.id === turmaId);
  return {
    engine: info?.engineType ?? 'generic',
    allowGroup: info?.allowGroup ?? false,
  };
}