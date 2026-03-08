// =============================================
// AlunoDetailComponent - Individual student history
// Frequency bars per turma + consolidated vertical history
// segmented by METODOS / HINARIO / ESCALAS / OUTROS
// =============================================

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { LessonRecord, StructuredRecord, StructuredGroup, StudentFrequency } from '../../../models/lesson.model';

interface ConsolidatedEntry {
  date: string;
  turma: string;
  groups: StructuredGroup[];
}

interface ConsolidatedText {
  date: string;
  turma: string;
  text: string;
}

@Component({
  selector: 'app-aluno-detail',
  standalone: true,
  template: `
    <main class="page-container">
      <div class="page-content">
        <!-- Header -->
        <header class="page-header">
          <button class="btn-back" (click)="router.navigate(['/historico/aluno'])" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <!-- Student name -->
        <div class="animate-fade-in" style="text-align: center; padding: 1rem;">
          <h1 class="font-chalk" style="font-size: 2rem; font-weight: 700; color: var(--foreground);">
            {{ studentName }}
          </h1>
        </div>

        <!-- Turma enrollments with frequency bars -->
        <div class="animate-fade-in" style="animation-delay: 0.15s; padding: 0 1rem;">
          <h2 class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); margin-bottom: 0.75rem;">
            Turmas Matriculadas
          </h2>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            @for (tf of turmaFrequencies; track tf.turmaId) {
              <div style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 0.75rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--foreground);">
                      {{ tf.turmaName }}
                    </span>
                  </div>
                  <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--primary);">
                    {{ tf.percentage }}%
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" [style.width.%]="tf.percentage"></div>
                </div>
                <span class="font-chalk" style="display: block; margin-top: 0.25rem; font-size: 0.625rem; color: var(--muted-foreground);">
                  {{ tf.present }} de {{ tf.total }} aula{{ tf.total !== 1 ? 's' : '' }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Chalk divider -->
        <div class="chalk-divider" style="margin-top: 1rem;"></div>

        <!-- Consolidated history -->
        <div class="animate-fade-in" style="animation-delay: 0.4s; padding: 0 1rem 2rem;">
          <h2 class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); margin-bottom: 1rem;">
            Historico Consolidado
          </h2>

          <!-- METODOS -->
          @if (metodos.length > 0) {
            <div style="margin-bottom: 1rem;">
              <div style="border-radius: 0.5rem; background: rgba(212,175,55,0.1); padding: 0.375rem 0.75rem; margin-bottom: 0.5rem;">
                <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary);">
                  METODOS
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                @for (entry of metodos; track $index) {
                  <div style="margin-left: 0.5rem; padding-left: 0.75rem; border-left: 2px solid rgba(212,175,55,0.2);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
                      </svg>
                      <span class="font-chalk" style="font-size: 0.625rem; color: var(--muted-foreground);">{{ entry.date }} - {{ entry.turma }}</span>
                    </div>
                    @for (g of entry.groups; track g.methodName) {
                      <div style="margin-left: 0.5rem; margin-top: 0.25rem;">
                        <span class="font-chalk" style="font-size: 0.75rem; font-weight: 700; color: var(--foreground);">{{ g.methodName }}</span>
                        @for (d of g.details; track $index; let isLast = $last) {
                          <p class="font-chalk" style="font-size: 0.75rem; line-height: 1.6; color: var(--muted-foreground);">
                            {{ d }}{{ isLast ? '.' : ';' }}
                          </p>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- HINARIO -->
          @if (hinario.length > 0) {
            <div style="margin-bottom: 1rem;">
              <div style="border-radius: 0.5rem; background: rgba(212,175,55,0.1); padding: 0.375rem 0.75rem; margin-bottom: 0.5rem;">
                <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary);">
                  HINARIO
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                @for (entry of hinario; track $index) {
                  <div style="margin-left: 0.5rem; padding-left: 0.75rem; border-left: 2px solid rgba(212,175,55,0.2);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
                      </svg>
                      <span class="font-chalk" style="font-size: 0.625rem; color: var(--muted-foreground);">{{ entry.date }} - {{ entry.turma }}</span>
                    </div>
                    @for (g of entry.groups; track g.methodName) {
                      <div style="margin-left: 0.5rem; margin-top: 0.25rem;">
                        <span class="font-chalk" style="font-size: 0.75rem; font-weight: 700; color: var(--foreground);">{{ g.methodName }}</span>
                        @for (d of g.details; track $index; let isLast = $last) {
                          <p class="font-chalk" style="font-size: 0.75rem; line-height: 1.6; color: var(--muted-foreground);">
                            {{ d }}{{ isLast ? '.' : ';' }}
                          </p>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- ESCALAS -->
          @if (escalas.length > 0) {
            <div style="margin-bottom: 1rem;">
              <div style="border-radius: 0.5rem; background: rgba(212,175,55,0.1); padding: 0.375rem 0.75rem; margin-bottom: 0.5rem;">
                <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary);">
                  ESCALAS
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                @for (entry of escalas; track $index) {
                  <div style="margin-left: 0.5rem; padding-left: 0.75rem; border-left: 2px solid rgba(212,175,55,0.2);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
                      </svg>
                      <span class="font-chalk" style="font-size: 0.625rem; color: var(--muted-foreground);">{{ entry.date }} - {{ entry.turma }}</span>
                    </div>
                    @for (g of entry.groups; track g.methodName) {
                      <div style="margin-left: 0.5rem; margin-top: 0.25rem;">
                        <span class="font-chalk" style="font-size: 0.75rem; font-weight: 700; color: var(--foreground);">{{ g.methodName }}</span>
                        @for (d of g.details; track $index; let isLast = $last) {
                          <p class="font-chalk" style="font-size: 0.75rem; line-height: 1.6; color: var(--muted-foreground);">
                            {{ d }}{{ isLast ? '.' : ';' }}
                          </p>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- OUTROS -->
          @if (outros.length > 0) {
            <div style="margin-bottom: 1rem;">
              <div style="border-radius: 0.5rem; background: rgba(212,175,55,0.1); padding: 0.375rem 0.75rem; margin-bottom: 0.5rem;">
                <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary);">
                  OUTROS
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                @for (entry of outros; track $index) {
                  <div style="margin-left: 0.5rem; padding-left: 0.75rem; border-left: 2px solid rgba(212,175,55,0.2);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
                      </svg>
                      <span class="font-chalk" style="font-size: 0.625rem; color: var(--muted-foreground);">{{ entry.date }} - {{ entry.turma }}</span>
                    </div>
                    <p class="font-chalk" style="margin-left: 0.5rem; margin-top: 0.25rem; font-size: 0.75rem; line-height: 1.6; color: var(--muted-foreground);">
                      {{ entry.text }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Empty state -->
          @if (metodos.length === 0 && hinario.length === 0 && escalas.length === 0 && outros.length === 0) {
            <div style="border: 1px dashed var(--board-border); border-radius: var(--radius-xl); padding: 2rem; text-align: center;">
              <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">Nenhum historico encontrado para este aluno.</p>
            </div>
          }
        </div>
      </div>
    </main>
  `,
})
export class AlunoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);

  studentName = '';
  turmaFrequencies: StudentFrequency[] = [];
  metodos: ConsolidatedEntry[] = [];
  hinario: ConsolidatedEntry[] = [];
  escalas: ConsolidatedEntry[] = [];
  outros: ConsolidatedText[] = [];

  constructor(public router: Router) {}

  ngOnInit(): void {
    const rawName = this.route.snapshot.paramMap.get('studentName') ?? '';
    this.studentName = decodeURIComponent(rawName);

    // Turma enrollments with frequency
    const turmas = this.lessonService.getStudentTurmas(this.studentName);
    this.turmaFrequencies = turmas.map(tid => this.lessonService.getStudentFrequency(this.studentName, tid));

    // Consolidated history
    const lessonsData = this.lessonService.getLessonsForStudent(this.studentName);
    for (const { lesson } of lessonsData) {
      const record: StructuredRecord | undefined = lesson.studentRecords[this.studentName];
      if (!record) continue;
      const turmaName = this.lessonService.getTurmaName(lesson.turmaId);
      const dateFmt = this.formatDateShort(lesson.date);

      if (record.metodo.length > 0) {
        this.metodos.push({ date: dateFmt, turma: turmaName, groups: record.metodo });
      }
      if (record.hinario.length > 0) {
        this.hinario.push({ date: dateFmt, turma: turmaName, groups: record.hinario });
      }
      if (record.escalas.length > 0) {
        this.escalas.push({ date: dateFmt, turma: turmaName, groups: record.escalas });
      }
      if (record.outros) {
        this.outros.push({ date: dateFmt, turma: turmaName, text: record.outros });
      }
    }
  }

  private formatDateShort(dateStr: string): string {
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y.slice(2)}`;
    } catch { return dateStr; }
  }
}
