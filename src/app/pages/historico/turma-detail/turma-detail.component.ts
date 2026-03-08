// =============================================
// TurmaDetailComponent - Frequency grid (20 squares) + lesson list
// =============================================

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { ClassInfo, ClassHistory, LessonRecord } from '../../../models/lesson.model';

interface StudentRow {
  name: string;
  cells: (boolean | null)[];
  percentage: number;
}

@Component({
  selector: 'app-turma-detail',
  standalone: true,
  template: `
    <main class="page-container">
      <div class="page-content" style="max-width: 48rem;">
        <!-- Header -->
        <header class="page-header">
          <button class="btn-back" (click)="router.navigate(['/historico/turma'])" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <!-- Turma name -->
        <div class="animate-fade-in" style="text-align: center; padding: 0.5rem 1rem;">
          <div style="display: inline-block; border: 2px dashed var(--board-border); border-radius: var(--radius-xl); padding: 0.75rem 1.5rem;">
            <h1 class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">
              {{ classInfo?.fullName || turmaId }}
            </h1>
          </div>
        </div>

        <!-- Info cards -->
        <div class="animate-fade-in" style="animation-delay: 0.15s; display: flex; gap: 0.75rem; padding: 1rem;">
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.25rem;">
              <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
            </svg>
            <span class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">{{ history.totalLessons }}</span>
            <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">Registros</span>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.25rem;">
              <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
            </svg>
            <span class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">{{ history.avgPresent }}/{{ history.totalStudents }}</span>
            <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
              M\u00E9dia Freq. <strong style="color: var(--primary);">{{ history.percentage }}%</strong>
            </span>
          </div>
        </div>

        <!-- Frequency Grid -->
        @if (lessonDates.length > 0) {
          <div class="animate-fade-in" style="animation-delay: 0.3s; padding: 1.5rem 1rem 0;">
            <h2 class="font-chalk" style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); margin-bottom: 0.75rem;">
              Frequ\u00EAncia dos Alunos
            </h2>

            <div style="overflow-x: auto; border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card);">
              <div style="min-width: fit-content;">
                <!-- Header row -->
                <div style="display: flex; border-bottom: 1px solid var(--board-border);">
                  <div style="width: 10rem; flex-shrink: 0; padding: 0.5rem 0.75rem; position: sticky; left: 0; z-index: 1; background: var(--card);">
                    <span class="font-chalk" style="font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Aluno</span>
                  </div>
                  <div style="display: flex;">
                    @for (date of lessonDates; track date) {
                      <div style="width: 3rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0.5rem 0.25rem;">
                        <span class="font-chalk" style="font-size: 0.625rem; color: var(--muted-foreground);">{{ formatDateShort(date) }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Student rows -->
                @for (student of studentRows; track student.name; let isLast = $last) {
                  <div [style.border-bottom]="isLast ? 'none' : '1px solid rgba(58,56,53,0.5)'" style="display: flex;">
                    <div style="width: 10rem; flex-shrink: 0; padding: 0.375rem 0.75rem; position: sticky; left: 0; z-index: 1; background: var(--card); display: flex; align-items: center;">
                      <span class="font-chalk" style="font-size: 0.75rem; color: var(--foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        {{ student.name }}
                      </span>
                    </div>
                    <div style="display: flex;">
                      @for (cell of student.cells; track $index) {
                        <div style="width: 3rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0.375rem 0.25rem;">
                          @if (cell === null) {
                            <div class="freq-square empty"></div>
                          } @else if (cell) {
                            <div class="freq-square present"></div>
                          } @else {
                            <div class="freq-square absent"></div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Lesson list -->
        <div class="animate-fade-in" style="animation-delay: 0.45s; padding: 1.5rem 1rem 2rem;">
          <h2 class="font-chalk" style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); margin-bottom: 0.75rem;">
            Aulas Realizadas
          </h2>

          <div class="stagger-children" style="display: flex; flex-direction: column; gap: 0.5rem;">
            @for (lesson of lessons; track lesson.id) {
              <button class="animate-slide-in" style="all: unset; width: 100%; cursor: pointer;" (click)="openLesson(lesson.id)">
                <div class="board-card-interactive" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem;">
                  <div>
                    <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--foreground); text-transform: capitalize;">
                      {{ formatDateFull(lesson.date) }}
                    </span>
                    <p class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
                      {{ lesson.presentStudents.length }}/{{ lesson.totalStudents }} presentes - {{ lesson.mode === 'group' ? 'Grupo' : 'Individual' }}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </button>
            }

            @if (lessons.length === 0) {
              <div style="border: 1px dashed var(--board-border); border-radius: var(--radius-xl); padding: 2rem; text-align: center;">
                <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">Nenhuma aula registrada para esta turma.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </main>
  `,
})
export class TurmaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);

  turmaId = '';
  classInfo: ClassInfo | undefined;
  history!: ClassHistory;
  students: string[] = [];
  lessons: LessonRecord[] = [];
  lessonDates: string[] = [];
  studentRows: StudentRow[] = [];

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.turmaId = this.route.snapshot.paramMap.get('turmaId') ?? '';
    this.classInfo = this.lessonService.getClassInfo(this.turmaId);
    this.history = this.lessonService.getTurmaFrequency(this.turmaId);
    this.students = this.lessonService.getStudents(this.turmaId);
    this.lessons = this.lessonService.getLessonsForTurma(this.turmaId);

    // Dates oldest-first for grid
    this.lessonDates = [...this.lessons].reverse().map(l => l.date);

    // Build student rows
    this.studentRows = this.students.map(name => {
      const cells = this.lessonDates.map(date => {
        const lesson = this.lessons.find(l => l.date === date);
        if (!lesson) return null;
        return lesson.presentStudents.includes(name);
      });
      const freq = this.lessonService.getStudentFrequency(name, this.turmaId);
      return { name, cells, percentage: freq.percentage };
    });
  }

  openLesson(lessonId: string): void {
    this.router.navigate(['/historico/turma', this.turmaId, lessonId]);
  }

  formatDateShort(dateStr: string): string {
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}`;
    } catch { return dateStr; }
  }

  formatDateFull(dateStr: string): string {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(+y, +m - 1, +d);
      return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) + ` - ${d}/${m}/${y.slice(2)}`;
    } catch { return dateStr; }
  }
}
