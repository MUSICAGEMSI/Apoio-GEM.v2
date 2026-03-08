// =============================================
// TurmaListComponent - Dynamic from DataService
// =============================================

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { LessonService } from '../../../services/lesson.service';

@Component({
  selector: 'app-turma-list',
  standalone: true,
  template: `
    <main class="page-container">
      <div class="page-content">
        <header class="page-header">
          <button class="btn-back" (click)="router.navigate(['/historico'])" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <div class="animate-fade-in" style="text-align: center; padding: 1rem;">
          <h1 class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">
            Histórico por Turma
          </h1>
        </div>

        <div class="chalk-divider"></div>

        <div class="stagger-children" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0 1rem 2rem;">
          @for (t of dataService.activeTurmas(); track t.id) {
            @let freq = getFrequency(t.id);
            <button class="animate-slide-in" style="all: unset; width: 100%; cursor: pointer;" (click)="select(t.id)">
              <div class="board-card-interactive" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem;">
                <div style="min-width: 0;">
                  <span class="font-chalk" style="font-size: 1rem; font-weight: 700; color: var(--foreground); display: block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ t.description }}</span>
                  <p class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
                    {{ freq.totalLessons }} registro(s) · {{ freq.totalStudents }} aluno(s)
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          }

          @if (dataService.activeTurmas().length === 0) {
            <div style="border: 1px dashed var(--board-border); border-radius: var(--radius-xl); padding: 2rem; text-align: center;">
              <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">Nenhuma turma ativa cadastrada.</p>
            </div>
          }
        </div>
      </div>
    </main>
  `,
})
export class TurmaListComponent {
  dataService   = inject(DataService);
  lessonService = inject(LessonService);
  router        = inject(Router);

  select(id: string): void {
    this.router.navigate(['/historico/turma', id]);
  }

  getFrequency(turmaId: string) {
    return this.lessonService.getTurmaFrequency(turmaId);
  }
}
