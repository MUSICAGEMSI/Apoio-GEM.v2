// =============================================
// DashboardComponent - "Quadro Negro" modular engine loader
// =============================================

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../../services/lesson.service';
import { DataService } from '../../../services/data.service';
import { StructuredReviewComponent } from '../../../components/structured-review/structured-review.component';
import { EngineTeoriaComponent } from '../../../components/engines/engine-teoria.component';
import { FreeTextEngineComponent } from '../../../components/engines/free-text-engine.component';
import { QuestionTreeComponent, StudentRecord as QTStudentRecord } from '../../../components/engines/question-tree.component';
import { HistoryEntry } from '../../../components/engines/history-accumulator.component';
import {
  ClassInfo,
  FlowStep,
  StructuredRecord,
  StructuredGroup,
  emptyStructuredRecord,
  getTurmaConfig,
  TurmaConfig,
  LessonRecord,
} from '../../../models/lesson.model';

const METHOD_PREFIX_ORDER = ['Sacro', 'Suzuki', 'Almeida Dias', 'Rubank', "Clark's", 'Clarks', 'MSA', 'Apostila'];

function getEntryMethodPrefix(source: string): string {
  for (const m of METHOD_PREFIX_ORDER) {
    if (source.startsWith(m)) return m;
  }
  return source.split(' ')[0] ?? source;
}

function sortEntriesByMethod(entries: HistoryEntry[]): HistoryEntry[] {
  // Build order from first appearance of each method
  const methodOrder: string[] = [];
  for (const e of entries) {
    const m = getEntryMethodPrefix(e.source);
    if (!methodOrder.includes(m)) methodOrder.push(m);
  }
  return [...entries].sort((a, b) => {
    const ma = getEntryMethodPrefix(a.source);
    const mb = getEntryMethodPrefix(b.source);
    const ia = methodOrder.indexOf(ma);
    const ib = methodOrder.indexOf(mb);
    if (ia !== ib) return ia - ib;
    return entries.indexOf(a) - entries.indexOf(b);
  });
}

function entriesToGroups(entries: HistoryEntry[]): StructuredGroup[] {
  return sortEntriesByMethod(entries).map(e => {
    const details: string[] = [e.source];
    if (e.status) details.push(`Status: ${e.status}`);
    if (e.observation?.trim()) details.push(`Obs: ${e.observation.trim()}`);
    return { methodName: e.source, details };
  });
}

function qtRecordToStructured(qr: QTStudentRecord): StructuredRecord {
  return {
    metodo: entriesToGroups(qr.metodo),
    hinario: entriesToGroups(qr.hinario),
    escalas: entriesToGroups(qr.escalas),
    outros: qr.outros,
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styles: [`
    @keyframes publishPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(94,196,160,0); transform: scale(1); }
      50% { box-shadow: 0 0 18px 6px rgba(94,196,160,0.45); transform: scale(1.015); }
    }
  `],
  imports: [
    FormsModule,
    StructuredReviewComponent,
    EngineTeoriaComponent,
    FreeTextEngineComponent,
    QuestionTreeComponent,
  ],
  template: `
    <main class="page-container">
      <div class="page-content">
        <!-- Header -->
        <header class="page-header">
          <button class="btn-back" (click)="handleBack()" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <!-- Class Title -->
        <div class="animate-fade-in" style="text-align: center; padding: 1rem;">
          <h1 class="font-chalk" style="font-size: 2rem; font-weight: 700; color: var(--foreground);">
            {{ classInfo?.fullName || turmaId }}
          </h1>
          @if (classInfo?.instrument) {
            <div class="font-chalk" style="font-size: 0.95rem; font-weight: 600; color: var(--primary); margin-top: 0.25rem; letter-spacing: 0.04em;">
              {{ classInfo?.instrument }}
            </div>
          }
          <div style="margin-top: 0.5rem; height: 2px; width: 50%; margin-inline: auto; border-radius: 9999px; background: var(--primary); opacity: 0.5;"></div>
        </div>

        <!-- Sub-header: date + present count -->
        <div class="animate-fade-in" style="animation-delay: 0.15s; display: flex; justify-content: center; gap: 1.5rem; padding: 0 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
            </svg>
            <span class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">
              <strong style="color: var(--foreground);">{{ formattedDate }}</strong>
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <span class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">
              <strong style="color: var(--foreground);">{{ presentes }}</strong> / {{ totalAlunos }} alunos
            </span>
          </div>
        </div>

        <div class="chalk-divider"></div>

        <!-- ===== UNSAVED DATA SWITCH WARNING (item 1) ===== -->
        @if (pendingSwitchMode) {
          <div style="position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);padding:1rem;">
            <div style="width:100%;max-width:22rem;border-radius:0.875rem;border:2px solid rgba(230,160,50,0.5);background:var(--card);padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(230,160,50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span class="font-chalk" style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgb(230,160,50);">Atenção</span>
              </div>
              <p class="font-chalk" style="font-size:0.9rem;color:var(--foreground);line-height:1.6;">
                Você tem dados <strong>não salvos</strong> no modo <strong>{{ pendingSwitchMode === 'group' ? 'Individualmente' : 'Em Grupo' }}</strong>.<br>
                Se prosseguir, esses dados serão <strong style="color:rgb(220,70,70);">apagados</strong>.
              </p>
              <div style="display:flex;gap:0.75rem;">
                <button type="button" (click)="cancelSwitchMode()" class="font-chalk"
                  style="flex:1;padding:0.75rem;border-radius:0.5rem;border:2px solid rgba(94,196,160,0.5);color:rgb(94,196,160);background:transparent;font-size:0.875rem;font-weight:700;cursor:pointer;">
                  Cancelar
                </button>
                <button type="button" (click)="confirmSwitchMode()" class="font-chalk"
                  style="flex:1;padding:0.75rem;border-radius:0.5rem;border:2px solid rgba(220,70,70,0.5);color:rgb(220,70,70);background:rgba(220,70,70,0.08);font-size:0.875rem;font-weight:700;cursor:pointer;">
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ===== STEP: CHOOSE MODE ===== -->
        @if (step === 'choose') {
          <div class="animate-fade-in" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 2.5rem 1rem;">
            <!-- Group button -->
            <button style="all: unset; width: 100%; max-width: 28rem; cursor: pointer;" (click)="selectGroup()">
              <div style="text-align: center; padding: 2rem; border: 3px solid var(--color-present); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s; box-shadow: 0 0 20px var(--color-present-bg);">
                <div style="width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 2px dashed var(--color-present-border); display: flex; align-items: center; justify-content: center;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-present)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">Lançar em GRUPO</span>
                <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">Registrar conteúdo para todos os presentes</p>
              </div>
            </button>

            <!-- Individual button — same glow style, foreground border -->
            <button style="all: unset; width: 100%; max-width: 28rem; cursor: pointer;" (click)="selectIndividual()">
              <div style="text-align: center; padding: 2rem; border: 3px solid var(--foreground); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s; box-shadow: 0 0 20px rgba(212,208,203,0.12);">
                <div style="width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 2px dashed var(--board-border); display: flex; align-items: center; justify-content: center;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">Lançar INDIVIDUALMENTE</span>
                <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">Registrar conteúdo por aluno</p>
              </div>
            </button>
          </div>
        }

        <!-- ===== STEP: GROUP ENGINE ===== -->
        @if (step === 'group-engine') {
          <div class="animate-fade-in" style="padding: 2rem 1rem;">
            <div class="badge badge-green" style="margin: 0 auto 1.5rem; display: flex; width: fit-content;">
              LANÇAMENTO EM GRUPO
            </div>

            <div style="max-width: 32rem; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">

              <!-- Conteúdo da Aula (MOVIDO PARA CIMA) -->
              <div>
                <label class="font-chalk" style="display: block; margin-bottom: 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
                  Descrição Geral
                </label>
                @switch (turmaConfig.engine) {
                  @case ('teoria') {
                    <app-engine-teoria
                      mode="group"
                      [initialEntries]="groupEntries"
                      (save)="onGroupEngineSave($event)"
                      (entriesChange)="groupEntries = $event"
                    />
                  }
                  @default {
                    <app-free-text-engine
                      [initial]="groupText"
                      (save)="onGroupTextSave($event)"
                    />
                  }
                }
              </div>

              <!-- Alunos Presentes (MOVIDO PARA BAIXO) -->
              <div style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
                <label class="font-chalk" style="display: block; margin-bottom: 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
                  Lista de Presença ({{ presentStudents.length }})
                </label>
                <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                  @for (student of presentStudents; track student; let i = $index) {
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--color-present-bg-strong); border: 1px solid var(--color-present-border); font-family: var(--font-chalk); font-size: 0.7rem; color: var(--color-present); flex-shrink: 0;">
                        {{ i + 1 }}
                      </span>
                      <span class="font-chalk" style="font-size: 0.875rem; color: var(--foreground);">{{ student }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ===== STEP: INDIVIDUAL TREE ===== -->
        @if (step === 'individual-tree') {
          <div class="animate-fade-in" style="padding: 2rem 1rem;">
            <!-- Progress -->
            <div style="text-align: center; margin-bottom: 0.75rem;">
              <span class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">
                Aluno {{ currentStudentIndex + 1 }} de {{ presentStudents.length }}
              </span>
            </div>
            <div class="progress-bar" style="max-width: 32rem; margin: 0 auto 1.5rem;">
              <div class="progress-bar-fill" [style.width.%]="((currentStudentIndex + 1) / presentStudents.length) * 100"></div>
            </div>

            <div style="max-width: 32rem; margin: 0 auto;">
              @if (turmaConfig.engine === 'generic') {
                <!-- Musicalização individual: FreeTextEngine only -->
                <p class="font-chalk" style="text-align: center; margin-bottom: 1rem; font-size: 0.875rem; color: var(--muted-foreground);">
                  {{ currentStudent }}
                </p>
                <app-free-text-engine
                  [initial]="getIndividualText()"
                  [studentName]="currentStudent"
                  (save)="onIndividualTextSave($event)"
                />
              } @else {
                <app-question-tree
                  [turmaId]="turmaId"
                  [studentName]="currentStudent"
                  [existingRecord]="getExistingStudentRecord()"
                  (complete)="onStudentComplete($event)"
                  (back)="onStudentBack()"
                />
              }
            </div>
          </div>
        }

        <!-- ===== STEP: PERSONALIZADO ENGINE ===== -->
        @if (step === 'personalizado-engine') {
          <div class="animate-fade-in" style="padding: 2rem 1rem;">
            <div style="max-width: 32rem; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">

              <!-- Lista de alunos -->
              <div>
                <label class="font-chalk" style="display:block;margin-bottom:0.75rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
                  Alunos Presentes ({{ personalizadoSelected.size }})
                </label>
                @if (_allSystemStudents.length === 0) {
                  <p class="font-chalk" style="color:var(--muted-foreground);font-size:0.85rem;">Nenhum aluno cadastrado no sistema.</p>
                } @else {
                  <div style="border:1px solid var(--board-border);border-radius:var(--radius-xl);background:var(--card);padding:0.75rem;display:flex;flex-direction:column;gap:0.375rem;max-height:16rem;overflow-y:auto;">
                    @for (name of _allSystemStudents; track name) {
                      <label style="display:flex;align-items:center;gap:0.625rem;cursor:pointer;padding:0.375rem 0.25rem;border-radius:0.375rem;"
                        [style.background]="personalizadoSelected.has(name) ? 'rgba(94,196,160,0.08)' : 'transparent'">
                        <input type="checkbox"
                          [checked]="personalizadoSelected.has(name)"
                          (change)="togglePersonalizadoStudent(name)"
                          style="width:1rem;height:1rem;cursor:pointer;accent-color:rgb(94,196,160);flex-shrink:0;"/>
                        <span class="font-chalk" style="font-size:0.875rem;color:var(--foreground);">{{ name }}</span>
                      </label>
                    }
                  </div>
                }
              </div>

              <!-- Descrição -->
              <div>
                <label class="font-chalk" style="display:block;margin-bottom:0.75rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
                  Descrição da Aula
                </label>
                <app-free-text-engine
                  [initial]="personalizadoText"
                  (save)="onPersonalizadoSave($event)"
                />
              </div>

            </div>
          </div>
        }

        <!-- ===== STEP: REVIEW ===== -->
        @if (step === 'review') {
          <div class="animate-fade-in" style="padding: 2rem 1rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h2 class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">Resumo do Lançamento</h2>
              <p class="font-chalk" style="margin-top: 0.25rem; font-size: 0.875rem; color: var(--muted-foreground);">Confira os dados antes de publicar</p>
            </div>

            <!-- Summary card -->
            <div style="max-width: 32rem; margin: 0 auto 1rem; border: 2px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--foreground);">{{ classInfo?.fullName || turmaId }}</span>
                </div>
                @if (classInfo?.instrument) {
                  <span class="font-chalk" style="font-size: 0.8rem; font-weight: 600; color: var(--primary); letter-spacing: 0.03em;">{{ classInfo?.instrument }}</span>
                }
                <span class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">{{ formattedDate }}</span>
                <span class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">
                  Presentes: <strong style="color: var(--foreground);">{{ presentes }}</strong> / Total: <strong style="color: var(--foreground);">{{ totalAlunos }}</strong>
                </span>
              </div>
            </div>

            <!-- Mode badge -->
            <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
              @if (selectedMode === 'group') {
                <span class="badge badge-green">GRUPO</span>
              } @else {
                <span class="badge badge-gold">INDIVIDUAL</span>
              }
            </div>

            <!-- Review entries -->
            <div class="stagger-children" style="max-width: 32rem; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem;">
              @if (selectedMode === 'group') {
                <!-- MODO GRUPO: Lista de alunos primeiro, depois o conteúdo uma única vez -->
                <div class="animate-slide-in" style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
                  <!-- Lista de Presentes -->
                  <div style="margin-bottom: 1rem;">
                    <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
                      Alunos Presentes
                    </label>
                    <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                      @for (entry of reviewEntries; track entry.name; let i = $index) {
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <span style="display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--secondary); font-family: var(--font-chalk); font-size: 0.75rem; color: var(--secondary-foreground);">
                            {{ i + 1 }}
                          </span>
                          <span class="font-chalk" style="font-size: 0.875rem; font-weight: 600; color: var(--card-foreground);">{{ entry.name }}</span>
                        </div>
                      }
                    </div>
                  </div>
                  
                  <!-- Conteúdo (mostrado apenas uma vez) -->
                  <div style="border-top: 1px solid var(--board-border); padding-top: 1rem;">
                    @if (reviewEntries[0]?.structured; as structuredRecord) {
                      <app-structured-review [record]="structuredRecord" />
                    } @else {
                      <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground); line-height: 1.6;">
                        {{ reviewEntries[0]?.text || 'Nenhum registro' }}
                      </p>
                    }
                  </div>
                </div>
              } @else {
                <!-- MODO INDIVIDUAL: Um card por aluno com seu conteúdo -->
                @for (entry of reviewEntries; track entry.name; let i = $index) {
                  <div class="animate-slide-in" style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                      <span style="display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--secondary); font-family: var(--font-chalk); font-size: 0.75rem; color: var(--secondary-foreground);">
                        {{ i + 1 }}
                      </span>
                      <span class="font-chalk" style="font-size: 1rem; font-weight: 700; color: var(--card-foreground);">{{ entry.name }}</span>
                    </div>
                    @if (entry.structured) {
                      <app-structured-review [record]="entry.structured" />
                    } @else {
                      <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground); line-height: 1.6;">
                        {{ entry.text || 'Nenhum registro' }}
                      </p>
                    }
                  </div>
                }
              }
            </div>

            <!-- Actions -->
            <div style="max-width: 32rem; margin: 2rem auto 0; display: flex; flex-direction: column; gap: 0.75rem;">
              <button class="btn-secondary" (click)="editAgain()">
                Editar novamente
              </button>
              <button
                style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; width: 100%; padding: 1rem 1.5rem; border: 2px solid var(--color-present); border-radius: var(--radius-xl); background: var(--color-present-bg); font-family: var(--font-chalk); font-size: 1.25rem; font-weight: 700; color: var(--foreground); cursor: pointer; animation: publishPulse 1.6s ease-in-out infinite;"
                (click)="publish()"
              >
                CONFIRMAR E PUBLICAR
              </button>
            </div>
          </div>
        }
      </div>
    </main>
  `,
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lessonService = inject(LessonService);
  private dataService = inject(DataService);

  turmaId = '';
  classInfo: ClassInfo | undefined;
  turmaConfig!: TurmaConfig;
  dateStr = '';
  formattedDate = '';
  presentes = 0;
  totalAlunos = 0;
  presentStudents: string[] = [];

  step: FlowStep = 'choose';
  selectedMode: 'group' | 'individual' | null = null;
  pendingSwitchMode: 'group' | 'individual' | null = null;
  editLessonId: string | null = null; // item 3: editing existing lesson

  // Group state
  groupText = '';
  groupEntries: HistoryEntry[] = [];
  groupStructuredRecord: StructuredRecord | null = null;

  // Individual state
  currentStudentIndex = 0;
  studentRecords: Record<string, StructuredRecord> = {};
  qtStudentRecords: Record<string, QTStudentRecord> = {};

  // Personalizado state
  _allSystemStudents: string[] = [];
  personalizadoSelected = new Set<string>();
  personalizadoText = '';

  togglePersonalizadoStudent(name: string): void {
    const next = new Set(this.personalizadoSelected);
    next.has(name) ? next.delete(name) : next.add(name);
    this.personalizadoSelected = next;
  }

  onPersonalizadoSave(text: string): void {
    this.personalizadoText = text;
    // Monta registro como group com alunos selecionados como presença
    this.presentStudents = [...this.personalizadoSelected];
    this.groupText = text;
    const rec = emptyStructuredRecord();
    rec.outros = text;
    this.groupStructuredRecord = rec;
    this.step = 'review';
  }

  get currentStudent(): string {
    return this.presentStudents[this.currentStudentIndex] ?? '';
  }

  getExistingStudentRecord(): QTStudentRecord | undefined {
    return this.qtStudentRecords[this.currentStudent];
  }

  /** Returns the saved free text for current student (generic individual mode) */
  getIndividualText(): string {
    return this.studentRecords[this.currentStudent]?.outros ?? '';
  }

  /** Saves free text for generic individual mode and advances to next student */
  onIndividualTextSave(text: string): void {
    const rec = emptyStructuredRecord();
    rec.outros = text;
    this.studentRecords[this.currentStudent] = rec;
    this.lessonService.setDraftStudentRecord(this.turmaId, this.currentStudent, rec);

    if (this.currentStudentIndex < this.presentStudents.length - 1) {
      this.currentStudentIndex++;
    } else {
      this.step = 'review';
    }
  }

  get reviewEntries(): { name: string; text: string; structured: StructuredRecord | null }[] {
    if (this.selectedMode === 'group') {
      const rec = this.groupStructuredRecord;
      return this.presentStudents.map(name => ({
        name,
        text: rec ? '' : this.groupText,
        structured: rec,
      }));
    }
    return this.presentStudents.map(name => {
      const record = this.studentRecords[name] ?? emptyStructuredRecord();
      const hasData = record.metodo.length > 0 || record.hinario.length > 0
        || record.escalas.length > 0 || record.outros.trim().length > 0;
      return { name, text: '', structured: hasData ? record : null };
    });
  }

  ngOnInit(): void {
    this.turmaId = this.route.snapshot.paramMap.get('turmaId') ?? '';
    this.classInfo = this.lessonService.getClassInfo(this.turmaId);
    this.turmaConfig = this.classInfo
      ? { engine: this.classInfo.engineType, allowGroup: this.classInfo.allowGroup }
      : getTurmaConfig(this.turmaId);

    const qp = this.route.snapshot.queryParamMap;
    this.dateStr = qp.get('date') ?? '';
    this.presentes = Number(qp.get('presentes') ?? '0');
    this.totalAlunos = Number(qp.get('total') ?? '0');
    this.presentStudents = qp.getAll('aluno');
    this.editLessonId = qp.get('editLessonId') ?? null;

    if (this.dateStr) {
      try {
        const [y, m, d] = this.dateStr.split('-');
        const date = new Date(+y, +m - 1, +d);
        this.formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        // Capitalize primeira letra do dia da semana
        this.formattedDate = this.formattedDate.charAt(0).toUpperCase() + this.formattedDate.slice(1);
      } catch { this.formattedDate = this.dateStr; }
    }

    if (this.turmaConfig.engine === 'personalizado') {
      this.step = 'personalizado-engine';
      this.selectedMode = 'group';
      // Popula lista de todos os alunos do sistema para seleção
      this._allSystemStudents = this.dataService.activeStudents().map(s => s.fullName).sort();
    } else if (!this.turmaConfig.allowGroup) {
      this.step = 'individual-tree';
      this.selectedMode = 'individual';
    }
  }

  get hasGroupData(): boolean { return this.groupEntries.length > 0 || this.groupText.trim().length > 0; }
  get hasIndividualData(): boolean { return Object.keys(this.qtStudentRecords).length > 0 || Object.keys(this.studentRecords).some(k => { const r = this.studentRecords[k]; return r.metodo.length > 0 || r.hinario.length > 0 || r.escalas.length > 0 || !!r.outros; }); }

  selectGroup(): void {
    // If coming from individual with data, warn first
    if (this.selectedMode === 'individual' && this.hasIndividualData) {
      this.pendingSwitchMode = 'group'; return;
    }
    this.doSelectGroup();
  }

  selectIndividual(): void {
    if (this.selectedMode === 'group' && this.hasGroupData) {
      this.pendingSwitchMode = 'individual'; return;
    }
    this.doSelectIndividual();
  }

  confirmSwitchMode(): void {
    const mode = this.pendingSwitchMode;
    this.pendingSwitchMode = null;
    if (mode === 'group') {
      // Clear individual data
      this.qtStudentRecords = {}; this.studentRecords = {}; this.currentStudentIndex = 0;
      this.doSelectGroup();
    } else if (mode === 'individual') {
      // Clear group data
      this.groupEntries = []; this.groupText = ''; this.groupStructuredRecord = null;
      this.doSelectIndividual();
    }
  }

  cancelSwitchMode(): void { this.pendingSwitchMode = null; }

  private doSelectGroup(): void { this.selectedMode = 'group'; this.step = 'group-engine'; }
  private doSelectIndividual(): void { this.selectedMode = 'individual'; this.currentStudentIndex = 0; this.step = 'individual-tree'; }

  onGroupEngineSave(entries: HistoryEntry[]): void {
    this.groupEntries = entries;
    const rec = emptyStructuredRecord();
    rec.metodo = entriesToGroups(entries);
    this.groupStructuredRecord = rec;
    this.step = 'review';
  }

  onGroupTextSave(text: string): void {
    this.groupText = text;
    this.groupStructuredRecord = null;
    this.step = 'review';
  }

  onStudentComplete(record: QTStudentRecord): void {
    this.qtStudentRecords[this.currentStudent] = record;
    this.studentRecords[this.currentStudent] = qtRecordToStructured(record);
    this.lessonService.setDraftStudentRecord(this.turmaId, this.currentStudent, this.studentRecords[this.currentStudent]);

    if (this.currentStudentIndex < this.presentStudents.length - 1) {
      this.currentStudentIndex++;
    } else {
      this.step = 'review';
    }
  }

  onStudentBack(): void {
    if (this.currentStudentIndex > 0) {
      this.currentStudentIndex--;
    } else if (this.turmaConfig.allowGroup) {
      this.step = 'choose';
      this.selectedMode = null;
    } else {
      this.router.navigate(['/lancar-aula', this.turmaId]);
    }
  }

  editAgain(): void {
    if (this.selectedMode === 'group') {
      this.step = 'group-engine';
    } else {
      this.currentStudentIndex = 0;
      this.step = 'individual-tree';
    }
  }

  publish(): void {
    const records: Record<string, StructuredRecord> = {};
    for (const name of this.presentStudents) {
      if (this.selectedMode === 'group') {
        if (this.groupStructuredRecord) {
          records[name] = this.groupStructuredRecord;
        } else {
          const rec = emptyStructuredRecord();
          rec.outros = this.groupText;
          records[name] = rec;
        }
      } else {
        records[name] = this.studentRecords[name] ?? emptyStructuredRecord();
      }
    }

    const lessonId = this.editLessonId ?? `${this.turmaId}-${this.dateStr}`;

    const lesson: LessonRecord = {
      id: lessonId,
      turmaId: this.turmaId,
      date: this.dateStr,
      presentStudents: this.presentStudents,
      totalStudents: this.totalAlunos,
      mode: this.selectedMode ?? 'group',
      studentRecords: records,
    };

    if (this.editLessonId) {
      this.lessonService.updateLesson(this.editLessonId, lesson);
      this.lessonService.clearAllDrafts(this.turmaId);
      this.router.navigate(['/historico/turma', this.turmaId, this.editLessonId]);
    } else {
      this.lessonService.addLesson(lesson);
      this.lessonService.clearAllDrafts(this.turmaId);
      this.router.navigate(['/']);
    }
  }

  handleBack(): void {
    if (this.step === 'choose') {
      this.router.navigate(['/lancar-aula', this.turmaId]);
    } else if (this.step === 'review') {
      this.step = this.selectedMode === 'group' ? 'group-engine' : 'individual-tree';
    } else if (this.step === 'group-engine') {
      if (this.turmaConfig.allowGroup) {
        this.step = 'choose';
        this.selectedMode = null;
      } else {
        this.router.navigate(['/lancar-aula', this.turmaId]);
      }
    } else {
      if (this.turmaConfig.allowGroup) {
        this.step = 'choose';
        this.selectedMode = null;
      } else {
        this.router.navigate(['/lancar-aula', this.turmaId]);
      }
    }
  }
}