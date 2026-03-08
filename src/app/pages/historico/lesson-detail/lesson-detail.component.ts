// =============================================
// LessonDetailComponent - Single lesson review
// =============================================

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { StructuredReviewComponent } from '../../../components/structured-review/structured-review.component';
import { LessonRecord, StructuredRecord } from '../../../models/lesson.model';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [StructuredReviewComponent],
  template: `
    <main class="page-container">
      <div class="page-content">
        <header class="page-header">
          <button class="btn-back" (click)="goBack()" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        @if (lesson) {
          <!-- Title -->
          <div class="animate-fade-in" style="text-align: center; padding: 1rem;">
            <h1 class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">
              {{ turmaName }}
            </h1>
            <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">
              {{ formattedDate }}
            </p>
          </div>

          <!-- Summary + botão Editar -->
          <div class="animate-fade-in" style="animation-delay: 0.15s; display: flex; gap: 0.75rem; padding: 0 1rem; align-items: stretch;">
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 0.75rem;">
              <span class="font-chalk" style="font-size: 1.25rem; font-weight: 700; color: var(--foreground);">
                {{ lesson.presentStudents.length }}/{{ lesson.totalStudents }}
              </span>
              <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">Presentes</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 0.75rem;">
              <span class="font-chalk" style="font-size: 1.25rem; font-weight: 700; color: var(--foreground);">
                {{ lesson.mode === 'group' ? 'Grupo' : 'Individual' }}
              </span>
              <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">Modo</span>
            </div>
            <!-- Lápis: editar aula -->
            <button
              type="button"
              (click)="editLesson()"
              title="Editar esta aula"
              style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.375rem; border: 2px solid rgba(212,175,55,0.5); border-radius: var(--radius-xl); background: rgba(212,175,55,0.06); padding: 0.75rem 1rem; cursor: pointer; transition: all 0.2s; min-width: 3.5rem; flex-shrink: 0;"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span class="font-chalk" style="font-size: 0.65rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em;">Editar</span>
            </button>
          </div>

          <div class="chalk-divider"></div>

          @if (lesson.mode === 'group') {
            <!-- GROUP MODE: students list + one shared content block -->
            <div style="padding: 0 1rem 2rem; display: flex; flex-direction: column; gap: 1rem;">

              <!-- Alunos Presentes -->
              <div style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
                <p class="font-chalk section-label" style="margin-bottom: 0.75rem;">Alunos Presentes</p>
                <ol style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;">
                  @for (name of lesson.presentStudents; track name; let i = $index) {
                    <li class="font-chalk" style="font-size: 0.875rem; color: var(--foreground);">{{ name }}</li>
                  }
                </ol>
              </div>

              <!-- Conteúdo Desenvolvido (shared) -->
              <div style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
                <p class="font-chalk section-label" style="margin-bottom: 0.75rem;">Conteúdo Desenvolvido</p>
                @if (sharedGroupRecord; as record) {
                  <app-structured-review [record]="record" />
                } @else {
                  <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">Nenhum registro.</p>
                }
              </div>
            </div>
          } @else {
            <!-- INDIVIDUAL MODE: one card per student -->
            <div class="stagger-children" style="padding: 0 1rem 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
              @for (name of lesson.presentStudents; track name; let i = $index) {
                <div class="animate-slide-in" style="border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--secondary); font-family: var(--font-chalk); font-size: 0.75rem; color: var(--secondary-foreground);">
                      {{ i + 1 }}
                    </span>
                    <span class="font-chalk" style="font-size: 1rem; font-weight: 700; color: var(--foreground);">{{ name }}</span>
                  </div>
                  @if (getStudentRecord(name); as record) {
                    <app-structured-review [record]="record" />
                  }
                </div>
              }
            </div>
          }
        } @else {
          <div style="padding: 3rem 1rem; text-align: center;">
            <p class="font-chalk" style="color: var(--muted-foreground);">Aula não encontrada.</p>
          </div>
        }
      </div>
    </main>
  `,
})
export class LessonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);

  turmaId = '';
  lessonId = '';
  lesson: LessonRecord | undefined;
  turmaName = '';
  formattedDate = '';
  sharedGroupRecord: StructuredRecord | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.turmaId = this.route.snapshot.paramMap.get('turmaId') ?? '';
    this.lessonId = this.route.snapshot.paramMap.get('lessonId') ?? '';
    this.lesson = this.lessonService.getLessonById(this.lessonId);
    this.turmaName = this.lessonService.getTurmaName(this.turmaId);

    if (this.lesson) {
      try {
        const [y, m, d] = this.lesson.date.split('-');
        const date = new Date(+y, +m - 1, +d);
        this.formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      } catch { this.formattedDate = this.lesson.date; }

      // For group mode, extract the shared record from the first student
      if (this.lesson.mode === 'group' && this.lesson.presentStudents.length > 0) {
        this.sharedGroupRecord = this.lesson.studentRecords[this.lesson.presentStudents[0]] ?? null;
      }
    }
  }

  getStudentRecord(name: string): StructuredRecord | null {
    return this.lesson?.studentRecords[name] ?? null;
  }

  goBack(): void {
    this.router.navigate(['/historico/turma', this.turmaId]);
  }

  editLesson(): void {
    if (!this.lesson) return;
    this.router.navigate(['/lancar-aula', this.turmaId], {
      queryParams: { editLessonId: this.lessonId },
    });
  }
}