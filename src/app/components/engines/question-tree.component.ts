// =============================================
// QuestionTree - SIM/NAO decision tree per student
// Navigates through MÉTODO -> HINÁRIO -> ESCALAS -> OUTROS
// Angular 19 Standalone - single file
// =============================================

import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { EngineCordasComponent } from './engine-cordas.component';
import { EngineMetaisMadeirasComponent } from './engine-metais-madeiras.component';
import { EngineHinarioComponent } from './engine-hinario.component';
import { EngineEscalasComponent } from './engine-escalas.component';
import { EngineTeoriaComponent } from './engine-teoria.component';
import { FreeTextEngineComponent } from './free-text-engine.component';
import { HistoryEntry } from './history-accumulator.component';
import { getTurmaConfig } from '../../models/lesson.model';
import { LessonService } from '../../services/lesson.service';

export interface StudentRecord {
  metodo: HistoryEntry[];
  hinario: HistoryEntry[];
  escalas: HistoryEntry[];
  outros: string;
}

export function emptyStudentRecord(): StudentRecord {
  return { metodo: [], hinario: [], escalas: [], outros: '' };
}

type QuestionStep = 'q1' | 'q2' | 'q3' | 'q4';
type EngineStep = 'engine-metodo' | 'engine-hinario' | 'engine-escalas' | 'engine-outros';
type Step = QuestionStep | EngineStep;

const FULL_QUESTION_ORDER: QuestionStep[] = ['q1', 'q2', 'q3', 'q4'];
const TEORIA_QUESTION_ORDER: QuestionStep[] = ['q1', 'q4'];

const QUESTIONS: Record<QuestionStep, string> = {
  q1: 'EXECUTOU MÉTODO?',
  q2: 'EXECUTOU HINÁRIO?',
  q3: 'EXECUTOU ESCALAS?',
  q4: 'EXECUTOU OUTROS?',
};

const Q_TO_ENGINE: Record<QuestionStep, EngineStep> = {
  q1: 'engine-metodo', q2: 'engine-hinario', q3: 'engine-escalas', q4: 'engine-outros',
};

const ENGINE_TO_Q: Record<EngineStep, QuestionStep> = {
  'engine-metodo': 'q1', 'engine-hinario': 'q2', 'engine-escalas': 'q3', 'engine-outros': 'q4',
};

@Component({
  selector: 'app-question-tree',
  standalone: true,
  imports: [
    EngineCordasComponent, EngineMetaisMadeirasComponent, EngineHinarioComponent,
    EngineEscalasComponent, EngineTeoriaComponent, FreeTextEngineComponent,
  ],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Header: back button + progress dots -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
        <button type="button" (click)="handleBack()"
          style="display: flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: 0.5rem; border: 1px solid var(--board-border); background: none; color: var(--muted-foreground); cursor: pointer; transition: all 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div style="display: flex; gap: 0.375rem;">
          @for (q of questionOrder; track q; let i = $index) {
            <div
              [style.background]="i === progressIdx() ? 'var(--primary)' : answers()[q] !== null ? (answers()[q] ? 'var(--color-present)' : 'var(--color-absent-border)') : 'var(--board-border)'"
              [style.transform]="i === progressIdx() ? 'scale(1.25)' : 'scale(1)'"
              style="width: 0.5rem; height: 0.5rem; border-radius: 50%; transition: all 0.2s;"
            ></div>
          }
        </div>
      </div>

      <!-- Nome do aluno centralizado e em destaque -->
      <div style="text-align: center; padding: 0.75rem 1rem; border: 2px dashed var(--board-border); border-radius: var(--radius-xl); background: var(--card);">
        <span class="font-chalk" style="font-size: 1.25rem; font-weight: 700; color: var(--foreground);">
          {{ studentName }}
        </span>
      </div>

      <!-- Confirmation modal: NÃO with existing data -->
      @if (showNaoConfirm()) {
        <div style="position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); padding: 1rem;">
          <div style="width: 100%; max-width: 22rem; border-radius: var(--radius-xl); border: 2px solid rgba(220,70,70,0.4); background: var(--card); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: rgb(220,70,70);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <span class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Atenção</span>
            </div>
            <p class="font-chalk" style="font-size: 0.95rem; color: var(--foreground); line-height: 1.5;">
              Há registros salvos para esta etapa. Confirma que deseja responder NÃO e remover os dados?
            </p>
            <div style="display: flex; gap: 0.75rem;">
              <button type="button" (click)="cancelNaoConfirm()"
                style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 2px solid rgba(94,196,160,0.6); background: rgba(94,196,160,0.1); color: rgb(94,196,160); font-family: var(--font-chalk); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                Voltar
              </button>
              <button type="button" (click)="confirmNao()"
                style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 2px solid rgba(220,70,70,0.6); background: rgba(220,70,70,0.1); color: rgb(220,70,70); font-family: var(--font-chalk); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Question views -->
      @if (isQuestion()) {
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem 0;">
          <h2 class="font-chalk" style="text-align: center; font-size: 1.5rem; font-weight: 700; color: var(--foreground);">
            {{ currentQuestion() }}
          </h2>

          @if (prevAnswer() !== null) {
            <p class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
              (resposta anterior:
              <span [style.color]="prevAnswer() ? 'var(--color-present)' : 'var(--color-absent)'">
                {{ prevAnswer() ? 'SIM' : 'NÃO' }}
              </span>
              - clique para alterar)
            </p>
          }

          <div style="display: flex; gap: 1rem;">
            <button type="button" (click)="answer(true)"
              [style.border-color]="prevAnswer() === true ? 'var(--color-present)' : 'var(--color-present-border)'"
              [style.background]="prevAnswer() === true ? 'var(--color-present-bg-strong)' : 'var(--color-present-bg-light)'"
              style="display: flex; width: 7rem; height: 4rem; align-items: center; justify-content: center; border-radius: 0.75rem; border: 2px solid; font-size: 1.25rem; font-weight: 700; color: var(--color-present); cursor: pointer; transition: all 0.2s;"
              class="font-chalk"
            >SIM</button>

            @if (!lastQMandatory()) {
              <button type="button" (click)="answer(false)"
                [style.border-color]="prevAnswer() === false ? 'var(--color-absent)' : 'var(--color-absent-border)'"
                [style.background]="prevAnswer() === false ? 'var(--color-absent-bg-strong)' : 'var(--color-absent-bg-light)'"
                style="display: flex; width: 7rem; height: 4rem; align-items: center; justify-content: center; border-radius: 0.75rem; border: 2px solid; font-size: 1.25rem; font-weight: 700; color: var(--color-absent); cursor: pointer; transition: all 0.2s;"
                class="font-chalk"
              >NÃO</button>
            }
          </div>

          @if (lastQMandatory()) {
            <p class="font-chalk" style="max-width: 20rem; text-align: center; font-size: 0.875rem; color: rgb(230,160,50);">
              Todas as respostas anteriores foram NÃO. Você deve registrar algo em OUTROS.
            </p>
          }
        </div>
      }

      <!-- Engine views -->
      @if (step() === 'engine-metodo') {
        <div>
          <h3 class="font-chalk" style="text-align: center; margin-bottom: 1rem; font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Método</h3>
          @switch (engineType) {
            @case ('cordas') {
              <app-engine-cordas [initialEntries]="record().metodo" (save)="onEngineSave('engine-metodo', $event)" (entriesChange)="onEngineChange('engine-metodo', $event)" />
            }
            @case ('metais-madeiras') {
              <app-engine-metais-madeiras [turmaId]="turmaId" [initialEntries]="record().metodo" (save)="onEngineSave('engine-metodo', $event)" (entriesChange)="onEngineChange('engine-metodo', $event)" />
            }
            @case ('teoria') {
              <app-engine-teoria mode="individual" [initialEntries]="record().metodo" (save)="onEngineSave('engine-metodo', $event)" (entriesChange)="onEngineChange('engine-metodo', $event)" />
            }
            @default {
              <app-free-text-engine [initial]="record().outros" [studentName]="studentName" (save)="onTextEngineSave('engine-metodo', $event)" />
            }
          }
        </div>
      }

      @if (step() === 'engine-hinario') {
        <div>
          <h3 class="font-chalk" style="text-align: center; margin-bottom: 1rem; font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Hinário</h3>
          <app-engine-hinario [initialEntries]="record().hinario" (save)="onEngineSave('engine-hinario', $event)" (entriesChange)="onEngineChange('engine-hinario', $event)" />
        </div>
      }

      @if (step() === 'engine-escalas') {
        <div>
          <h3 class="font-chalk" style="text-align: center; margin-bottom: 1rem; font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Escalas</h3>
          <app-engine-escalas [initialEntries]="record().escalas" (save)="onEngineSave('engine-escalas', $event)" (entriesChange)="onEngineChange('engine-escalas', $event)" />
        </div>
      }

      @if (step() === 'engine-outros') {
        <div>
          <h3 class="font-chalk" style="text-align: center; margin-bottom: 1rem; font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Outros</h3>
          <app-free-text-engine [initial]="record().outros" [studentName]="studentName" (save)="onTextEngineSave('engine-outros', $event)" />
        </div>
      }
    </div>
  `,
})
export class QuestionTreeComponent implements OnInit, OnChanges {
  private lessonService = inject(LessonService);
  @Input() turmaId = '';
  @Input() studentName = '';
  @Input() existingRecord?: StudentRecord;
  @Output() complete = new EventEmitter<StudentRecord>();
  @Output() back = new EventEmitter<void>();

  questionOrder: QuestionStep[] = [];
  engineType = '';

  step = signal<Step>('q1');
  record = signal<StudentRecord>(emptyStudentRecord());
  answers = signal<Record<QuestionStep, boolean | null>>({ q1: null, q2: null, q3: null, q4: null });
  history = signal<Step[]>([]);
  showNaoConfirm = signal(false);

  isQuestion = computed(() => !this.step().startsWith('engine-'));

  currentQuestion = computed(() => {
    const s = this.step() as QuestionStep;
    return QUESTIONS[s] ?? '';
  });

  prevAnswer = computed(() => {
    const s = this.step() as QuestionStep;
    return this.answers()[s] ?? null;
  });

  lastQuestion = computed(() => this.questionOrder[this.questionOrder.length - 1]);

  allNao = computed(() => {
    const beforeLast = this.questionOrder.slice(0, -1);
    return beforeLast.length > 0 && beforeLast.every(q => this.answers()[q] === false);
  });

  lastQMandatory = computed(() => {
    const s = this.step() as QuestionStep;
    return s === this.lastQuestion() && this.allNao();
  });

  hasDataForCurrentQuestion = computed(() => {
    const s = this.step() as QuestionStep;
    const r = this.record();
    if (s === 'q1') return r.metodo.length > 0;
    if (s === 'q2') return r.hinario.length > 0;
    if (s === 'q3') return r.escalas.length > 0;
    if (s === 'q4') return r.outros.trim().length > 0;
    return false;
  });

  progressIdx = computed(() => {
    const s = this.step();
    const qIdx = this.questionOrder.indexOf(s as QuestionStep);
    if (qIdx >= 0) return qIdx;
    const engineQ = ENGINE_TO_Q[s as EngineStep];
    return engineQ ? this.questionOrder.indexOf(engineQ) : -1;
  });

  ngOnInit(): void {
    this.initConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentName'] && !changes['studentName'].firstChange) {
      this.resetState();
    }
  }

  private initConfig(): void {
    const classInfo = this.lessonService.getClassInfo(this.turmaId);
    const engine = classInfo?.engineType ?? getTurmaConfig(this.turmaId).engine;
    this.engineType = engine;
    this.questionOrder = engine === 'teoria' ? [...TEORIA_QUESTION_ORDER] : [...FULL_QUESTION_ORDER];
    this.step.set(this.questionOrder[0]);
    if (this.existingRecord) {
      this.record.set({ ...this.existingRecord });
    }
  }

  private resetState(): void {
    this.step.set(this.questionOrder[0] ?? 'q1');
    this.record.set(emptyStudentRecord());
    this.answers.set({ q1: null, q2: null, q3: null, q4: null });
    this.history.set([]);
    this.showNaoConfirm.set(false);
    if (this.existingRecord) {
      this.record.set({ ...this.existingRecord });
    }
  }

  private getNextQuestion(current: QuestionStep): QuestionStep | null {
    const idx = this.questionOrder.indexOf(current);
    return idx >= 0 && idx < this.questionOrder.length - 1 ? this.questionOrder[idx + 1] : null;
  }

  private executeNao(): void {
    const q = this.step() as QuestionStep;
    // Clear existing data for this step
    this.record.update(r => {
      const next = { ...r };
      if (q === 'q1') next.metodo = [];
      if (q === 'q2') next.hinario = [];
      if (q === 'q3') next.escalas = [];
      if (q === 'q4') next.outros = '';
      return next;
    });
    this.answers.update(a => ({ ...a, [q]: false }));
    const next = this.getNextQuestion(q);
    if (!next) {
      this.complete.emit(this.record());
      return;
    }
    this.history.update(h => [...h, this.step()]);
    this.step.set(next);
  }

  answer(yes: boolean): void {
    const q = this.step() as QuestionStep;
    if (yes) {
      const engine = Q_TO_ENGINE[q];
      this.answers.update(a => ({ ...a, [q]: true }));
      this.history.update(h => [...h, this.step()]);
      this.step.set(engine);
    } else {
      // If there is existing data, show confirmation modal first
      if (this.hasDataForCurrentQuestion()) {
        this.showNaoConfirm.set(true);
      } else {
        this.executeNao();
      }
    }
  }

  cancelNaoConfirm(): void {
    this.showNaoConfirm.set(false);
  }

  confirmNao(): void {
    this.showNaoConfirm.set(false);
    this.executeNao();
  }

  onEngineSave(engineStep: EngineStep, entries: HistoryEntry[]): void {
    const q = ENGINE_TO_Q[engineStep];
    this.record.update(r => {
      const next = { ...r };
      if (engineStep === 'engine-metodo') next.metodo = entries;
      if (engineStep === 'engine-hinario') next.hinario = entries;
      if (engineStep === 'engine-escalas') next.escalas = entries;
      return next;
    });
    const nextQ = this.getNextQuestion(q);
    if (!nextQ) {
      this.complete.emit(this.record());
      return;
    }
    this.history.update(h => [...h, this.step()]);
    this.step.set(nextQ);
  }

  onTextEngineSave(engineStep: EngineStep, text: string): void {
    const q = ENGINE_TO_Q[engineStep];
    this.record.update(r => ({ ...r, outros: text }));
    const nextQ = this.getNextQuestion(q);
    if (!nextQ) {
      this.complete.emit(this.record());
      return;
    }
    this.history.update(h => [...h, this.step()]);
    this.step.set(nextQ);
  }

  onEngineChange(engineStep: EngineStep, entries: HistoryEntry[]): void {
    this.record.update(r => {
      const next = { ...r };
      if (engineStep === 'engine-metodo') next.metodo = entries;
      if (engineStep === 'engine-hinario') next.hinario = entries;
      if (engineStep === 'engine-escalas') next.escalas = entries;
      return next;
    });
  }

  handleBack(): void {
    const s = this.step();
    if (s === this.questionOrder[0] && this.history().length === 0) {
      this.back.emit();
      return;
    }
    if (s.startsWith('engine-')) {
      const q = ENGINE_TO_Q[s as EngineStep];
      this.step.set(q);
      this.history.update(h => h.length > 0 ? h.slice(0, -1) : []);
      return;
    }
    if (this.history().length > 0) {
      const prev = this.history()[this.history().length - 1];
      this.step.set(prev);
      this.history.update(h => h.slice(0, -1));
    } else {
      this.back.emit();
    }
  }
}