// =============================================
// DataService - Dynamic students/classes/enrollments
// Real data seeded from ApoioGEM roster
// =============================================

import { Injectable, signal, computed, Signal } from '@angular/core';
import { StudentData, TurmaData, ClassType } from '../models/lesson.model';

// Bump to v3 to force fresh start (removes old hardcoded student data from localStorage)
const LS_STUDENTS = 'apoiogem_students_v3';
const LS_TURMAS   = 'apoiogem_turmas_v3';

export function toTitleCase(str: string): string {
  const lower = ['de','da','do','das','dos','e','a','o','em','no','na','nos','nas','ao','aos','Ã ','Ã s','um','uma','uns','umas'];
  return str.toLowerCase().split(' ').map((word, i) =>
    (i === 0 || !lower.includes(word)) ? word.charAt(0).toUpperCase() + word.slice(1) : word
  ).join(' ');
}

export const NIVEL_OPTIONS: string[] = [
  'Candidato(a)', 'Ensaio', 'RJM', 'Culto Oficial',
];

export const TEORIA_SUB_LABELS: string[] = [
  'Geral', 'Infantil', 'Inicial', 'Avançado', 'Intermediário',
];

export const INSTRUMENT_LIST: string[] = [
  'A DEFINIR', 'BARÃTONO DE PISTO', 'CLARINETE', 'CLARINETE ALTO', 'CLARINETE BAIXO',
  'CLARINETE CONTRA BAIXO', 'CORNE INGLÃŠS', 'CORNET', 'EUPHONIUM', 'FAGOTE',
  'FLAUTA', 'FLAUTA BAIXO', 'FLAUTA CONTRALTO', 'FLUGELHORN', 'MELOFONE',
  'OBOÃ‰', "OBOÃ‰ D'AMORE", 'POCKET', 'SAX HORN', 'SAXOFONE ALTO', 'SAXOFONE BAIXO',
  'SAXOFONE BARÃTONO', 'SAXOFONE SOPRANINO C', 'SAXOFONE SOPRANINO R',
  'SAXOFONE SOPRANO CUR', 'SAXOFONE SOPRANO RET', 'SAXOFONE TENOR',
  'TROMBONE', 'TROMBONITO', 'TROMPA', 'TROMPETE', 'TUBA', 'TUBA HELICON',
  'TUBA WAGNERIANA', 'VIOLA', 'VIOLINO', 'VIOLONCELO',
];

export const MADEIRAS_INSTRUMENTS = new Set([
  'CLARINETE','CLARINETE ALTO','CLARINETE BAIXO','CLARINETE CONTRA BAIXO','CORNE INGLÃŠS',
  'FAGOTE','FLAUTA','FLAUTA BAIXO','FLAUTA CONTRALTO','OBOÃ‰',"OBOÃ‰ D'AMORE",
  'SAXOFONE ALTO','SAXOFONE BAIXO','SAXOFONE BARÃTONO','SAXOFONE SOPRANINO C',
  'SAXOFONE SOPRANINO R','SAXOFONE SOPRANO CUR','SAXOFONE SOPRANO RET','SAXOFONE TENOR',
]);
export const CORDAS_INSTRUMENTS  = new Set(['VIOLA','VIOLINO','VIOLONCELO']);
export const METAIS_INSTRUMENTS  = new Set([
  'BARÃTONO DE PISTO','CORNET','EUPHONIUM','FLUGELHORN','MELOFONE','POCKET','SAX HORN',
  'TROMBONE','TROMBONITO','TROMPA','TROMPETE','TUBA','TUBA HELICON','TUBA WAGNERIANA',
]);

export function canEnroll(instrument: string, classType: ClassType): boolean {
  if (['Teoria e Solfejo','Musicalização','Personalizado'].includes(classType)) return true;
  if (instrument === 'A DEFINIR') return true;
  if (classType === 'Madeiras') return MADEIRAS_INSTRUMENTS.has(instrument);
  if (classType === 'Cordas')   return CORDAS_INSTRUMENTS.has(instrument);
  if (classType === 'Metais')   return METAIS_INSTRUMENTS.has(instrument);
  return true;
}

export function instrumentsForType(type: ClassType): string[] {
  if (type === 'Madeiras') return [...MADEIRAS_INSTRUMENTS].sort();
  if (type === 'Cordas')   return [...CORDAS_INSTRUMENTS].sort();
  if (type === 'Metais')   return [...METAIS_INSTRUMENTS].sort();
  return [];
}

export function typeNeedsInstrument(type: ClassType): boolean {
  return type === 'Madeiras' || type === 'Cordas' || type === 'Metais';
}

function engineForType(type: ClassType): string {
  if (type === 'Cordas') return 'cordas';
  if (type === 'Madeiras' || type === 'Metais') return 'metais-madeiras';
  if (type === 'Teoria e Solfejo') return 'teoria';
  return 'generic';
}
function allowGroupForType(type: ClassType): boolean {
  return ['Teoria e Solfejo','Musicalização','Personalizado'].includes(type);
}
function iconForType(type: ClassType): string {
  return ({ 'Cordas':'violin-treble','Madeiras':'clarinet','Metais':'trumpet',
    'Teoria e Solfejo':'metronome','Musicalização':'recorder','Personalizado':'orchestra' } as Record<string,string>)[type] ?? 'orchestra';
}

// â”€â”€â”€ Student data â€” starts empty; populate via Gerenciamento â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEFAULT_STUDENTS: StudentData[] = [];

// â”€â”€â”€ Real turma data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const REAL_TURMAS: TurmaData[] = [
  { id:'musicalizacao',    description:'TURMA 01 - MUSICALIZAÇÃO',  type:'Musicalização',    instrument:'', active:true, engineType:'generic',         allowGroup:true,  icon:'recorder'     },
  { id:'teoria-01',        description:'(GERAL) - TURMA 01 - TEORIA E SOLFEJO MSA', type:'Teoria e Solfejo', instrument:'', active:true, engineType:'teoria',           allowGroup:true,  icon:'metronome'    },
  { id:'cordas-01',        description:'TURMA 01 - CORDAS',   type:'Cordas',  instrument:'VIOLINO',  active:true, engineType:'cordas',          allowGroup:false, icon:'violin-treble' },
  { id:'cordas-02',        description:'TURMA 02 - CORDAS',   type:'Cordas',  instrument:'VIOLA',    active:true, engineType:'cordas',          allowGroup:false, icon:'violin-alto'   },
  { id:'madeiras-01',      description:'TURMA 01 - MADEIRAS', type:'Madeiras', instrument:'CLARINETE', active:true, engineType:'metais-madeiras', allowGroup:false, icon:'clarinet'     },
  { id:'metais-01',        description:'TURMA 01 - METAIS',   type:'Metais',  instrument:'TROMPETE', active:true, engineType:'metais-madeiras', allowGroup:false, icon:'trumpet'       },
  { id:'metais-02',        description:'TURMA 02 - METAIS',   type:'Metais',  instrument:'EUPHONIUM',active:true, engineType:'metais-madeiras', allowGroup:false, icon:'euphonium'     },
  { id:'pratica-conjunto', description:'PRÁTICA EM CONJUNTO',  type:'Musicalização',    instrument:'', active:true, engineType:'generic',         allowGroup:true,  icon:'orchestra'    },
  { id:'personalizado',    description:'PERSONALIZADO',         type:'Personalizado',    instrument:'', active:true, engineType:'personalizado',   allowGroup:false, icon:'orchestra'    },
];

// â”€â”€â”€ Auto-number turmas per type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function nextTurmaNumber(turmas: TurmaData[], type: ClassType): number {
  const same = turmas.filter(t => t.type === type);
  return same.length + 1;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private _students!: ReturnType<typeof signal<StudentData[]>>;
  private _turmas!:   ReturnType<typeof signal<TurmaData[]>>;

  students!:       Signal<StudentData[]>;
  turmas!:         Signal<TurmaData[]>;
  activeStudents!: Signal<StudentData[]>;
  activeTurmas!:   Signal<TurmaData[]>;

  constructor() {
    const storedStudents = this.load<StudentData[]>(LS_STUDENTS) ?? DEFAULT_STUDENTS;
    const storedTurmas   = this.load<TurmaData[]>(LS_TURMAS);
    const migratedTurmas = storedTurmas ? this.migrateTurmas(storedTurmas) : REAL_TURMAS;

    this._students = signal<StudentData[]>(storedStudents);
    this._turmas   = signal<TurmaData[]>(migratedTurmas);

    this.students       = this._students.asReadonly();
    this.turmas         = this._turmas.asReadonly();
    this.activeStudents = computed(() => this._students().filter(s => s.active));
    this.activeTurmas   = computed(() => this._turmas().filter(t => t.active));
  }

  // â”€â”€â”€ Migração: corrige dados antigos sem campo 'type' ou sem instrumento na descrição â”€â”€
  private migrateTurmas(turmas: TurmaData[]): TurmaData[] {
    let changed = false;
    const migrated = turmas.map(t => {
      let u = { ...t };

      // 1) Derivar 'type' se estiver faltando (dados de versão anterior)
      if (!u.type) {
        changed = true;
        if (u.engineType === 'cordas')           u.type = 'Cordas';
        else if (u.engineType === 'metais-madeiras') {
          const inst = (u.instrument ?? '').trim().toUpperCase();
          u.type = MADEIRAS_INSTRUMENTS.has(inst) ? 'Madeiras' : 'Metais';
        }
        else if (u.engineType === 'teoria')      u.type = 'Teoria e Solfejo';
        else                                     u.type = 'Musicalização';
      }

      // 2) Remover instrumento da descrição se estiver presente (era redundante)
      if (u.instrument && u.description.toUpperCase().endsWith(` - ${u.instrument.toUpperCase()}`)) {
        changed = true;
        u.description = u.description.slice(0, -(` - ${u.instrument}`).length);
      }
      return u;
    });

    if (changed) { try { localStorage.setItem(LS_TURMAS, JSON.stringify(migrated)); } catch {} }
    return migrated;
  }

  // ---- Students ----

  getStudentsForTurma(turmaId: string): StudentData[] {
    return this._students().filter(s => s.active && s.enrollments.includes(turmaId));
  }

  getStudentNames(turmaId: string): string[] {
    return this.getStudentsForTurma(turmaId).map(s => s.fullName);
  }

  getAllStudentNames(): string[] {
    return [...new Set(this._students().map(s => s.fullName))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  addStudent(data: Omit<StudentData, 'id' | 'enrollments'>): StudentData {
    const s: StudentData = { ...data, id: `s-${Date.now()}`, enrollments: [] };
    const next = [...this._students(), s];
    this._students.set(next); this.save(LS_STUDENTS, next);
    return s;
  }

  updateStudent(id: string, patch: Partial<Omit<StudentData, 'id'>>): void {
    const next = this._students().map(s => s.id === id ? { ...s, ...patch } : s);
    this._students.set(next); this.save(LS_STUDENTS, next);
  }

  toggleStudentActive(id: string): void {
    this.updateStudent(id, { active: !this._students().find(s => s.id === id)?.active });
  }

  enroll(studentId: string, turmaId: string): boolean {
    const student = this._students().find(s => s.id === studentId);
    const turma   = this._turmas().find(t => t.id === turmaId);
    if (!student || !turma) return false;
    if (!canEnroll(student.instrument, turma.type)) return false;
    if (student.enrollments.includes(turmaId)) return true;
    const next = this._students().map(s =>
      s.id === studentId ? { ...s, enrollments: [...s.enrollments, turmaId] } : s
    );
    this._students.set(next); this.save(LS_STUDENTS, next);
    return true;
  }

  unenroll(studentId: string, turmaId: string): void {
    const next = this._students().map(s =>
      s.id === studentId ? { ...s, enrollments: s.enrollments.filter(t => t !== turmaId) } : s
    );
    this._students.set(next); this.save(LS_STUDENTS, next);
  }

  // ---- Turmas ----

  getTurmaData(id: string): TurmaData | undefined { return this._turmas().find(t => t.id === id); }
  getTurmaName(id: string): string { return this._turmas().find(t => t.id === id)?.description ?? id; }

  getStudentTurmas(studentName: string): string[] {
    return this._students().find(s => s.fullName === studentName)?.enrollments ?? [];
  }

  addTurma(data: Omit<TurmaData, 'id' | 'engineType' | 'allowGroup' | 'icon'>): TurmaData {
    const num = nextTurmaNumber(this._turmas(), data.type);
    const typeLabel = data.type.toUpperCase();
    const instrLabel = data.instrument ? ` - ${data.instrument}` : '';
    const subLabelPart = data.subLabel ? `(${data.subLabel.toUpperCase()}) - ` : '';
    const t: TurmaData = {
      ...data,
      id: `turma-${Date.now()}`,
      description: `${subLabelPart}TURMA ${String(num).padStart(2,'0')} - ${typeLabel}`,
      engineType: engineForType(data.type),
      allowGroup: allowGroupForType(data.type),
      icon: iconForType(data.type),
    };
    const next = [...this._turmas(), t];
    this._turmas.set(next); this.save(LS_TURMAS, next);
    return t;
  }

  toggleTurmaActive(id: string): void {
    const next = this._turmas().map(t => t.id === id ? { ...t, active: !t.active } : t);
    this._turmas.set(next); this.save(LS_TURMAS, next);
  }

  // ---- Helpers ----
  getClassInfo(turmaId: string) {
    const td = this.getTurmaData(turmaId);
    if (!td) return undefined;
    return { id:td.id, title:td.description, subtitle:td.description,
      fullName:td.description, engineType:td.engineType, allowGroup:td.allowGroup,
      icon:td.icon, active:td.active, instrument:td.instrument || undefined };
  }

  private load<T>(key: string): T | null {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
  }
  private save(key: string, val: unknown): void {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
}
