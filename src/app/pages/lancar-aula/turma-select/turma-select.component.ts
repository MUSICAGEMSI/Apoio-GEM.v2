// =============================================
// TurmaSelectComponent - Dynamic from DataService
// Blocks opening if no students enrolled
// =============================================

import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { TurmaData } from '../../../models/lesson.model';

@Component({
  selector: 'app-turma-select',
  standalone: true,
  template: `
    <main class="page-container">
      <div class="page-content">
        <header class="page-header">
          <button class="btn-back" (click)="router.navigate(['/'])" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <div class="animate-fade-in" style="text-align: center; padding: 1rem;">
          <h1 class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">
            Selecione a Turma
          </h1>
        </div>

        <div class="chalk-divider"></div>

        @if (allowedTurmas().length === 0) {
          <div style="padding: 2rem 1rem; text-align: center;">
            <p class="font-chalk" style="font-size: 0.95rem; color: var(--muted-foreground);">Nenhuma turma ativa disponível.</p>
          </div>
        }

        <div class="class-grid stagger-children" style="padding: 0 1rem 2rem;">
          @for (t of allowedTurmas(); track t.id) {
            <div class="animate-slide-in" style="position: relative;">
              <button
                (click)="selectClass(t.id)"
                [style.cursor]="!isBlocked(t.id) ? 'pointer' : 'not-allowed'"
                [style.opacity]="!isBlocked(t.id) ? '1' : '0.55'"
                style="all: unset; display: block; width: 100%;"
              >
                <div class="board-card-interactive" style="text-align: center; padding: 1.5rem; position: relative;">
                  <div class="font-chalk" style="font-size: 0.8rem; color: var(--muted-foreground); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    {{ t.type }}
                  </div>
                  <div class="font-chalk" style="font-size: 1.1rem; font-weight: 700; color: var(--foreground); margin-top: 0.25rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    {{ t.description }}
                  </div>
                  <div class="font-chalk" style="font-size: 0.7rem; margin-top: 0.5rem;"
                    [style.color]="isPersonalizado(t.id) ? 'rgb(100,180,100)' : getStudentCount(t.id) > 0 ? 'var(--muted-foreground)' : 'rgb(220,70,70)'">
                    @if (isPersonalizado(t.id)) {
                      Aberta  -  todos os alunos do sistema
                    } @else {
                      {{ getStudentCount(t.id) > 0 ? getStudentCount(t.id) + ' aluno(s)' : 'Sem alunos matriculados' }}
                    }
                  </div>

                  @if (isBlocked(t.id)) {
                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(220,70,70,0.12); border: 1px solid rgba(220,70,70,0.4); border-radius: 0.375rem; padding: 0.15rem 0.4rem;">
                      <span class="font-chalk" style="font-size: 0.6rem; font-weight: 700; color: rgb(220,70,70); text-transform: uppercase; letter-spacing: 0.05em;">Bloqueada</span>
                    </div>
                  }
                  @if (isPersonalizado(t.id)) {
                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(100,160,100,0.12); border: 1px solid rgba(100,160,100,0.4); border-radius: 0.375rem; padding: 0.15rem 0.4rem;">
                      <span class="font-chalk" style="font-size: 0.6rem; font-weight: 700; color: rgb(100,180,100); text-transform: uppercase; letter-spacing: 0.05em;">Livre</span>
                    </div>
                  }
                </div>
              </button>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .class-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    @media (min-width: 768px) {
      .class-grid { gap: 1rem; }
    }
  `],
})
export class TurmaSelectComponent {
  private dataService = inject(DataService);
  private auth        = inject(AuthService);
  router = inject(Router);

  allowedTurmas = computed(() =>
    this.dataService.activeTurmas().filter(t =>
      this.auth.canAccessClass(t.id)
    )
  );

  getStudentCount(turmaId: string): number {
    return this.dataService.getStudentsForTurma(turmaId).length;
  }

  isPersonalizado(turmaId: string): boolean {
    return this.dataService.getTurmaData(turmaId)?.type === 'Personalizado';
  }

  isBlocked(turmaId: string): boolean {
    if (this.isPersonalizado(turmaId)) return false;
    return this.getStudentCount(turmaId) === 0;
  }

  selectClass(id: string): void {
    if (this.isBlocked(id)) return;
    this.router.navigate(['/lancar-aula', id]);
  }
}

