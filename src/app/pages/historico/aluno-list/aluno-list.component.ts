// =============================================
// AlunoListComponent - Student list with search filter
// =============================================

import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../../services/lesson.service';

@Component({
  selector: 'app-aluno-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="page-container">
      <div class="page-content">
        <!-- Header -->
        <header class="page-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn-back" (click)="router.navigate(['/historico'])" aria-label="Voltar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
            </button>
            <div style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 0.5rem; background: var(--primary); color: var(--primary-foreground);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 class="font-chalk" style="font-size: 1.25rem; font-weight: 700; color: var(--foreground); line-height: 1.2;">
                Historico por Aluno
              </h1>
              <p class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">Selecione um aluno</p>
            </div>
          </div>
        </header>

        <!-- Search -->
        <div class="animate-fade-in" style="padding: 1rem;">
          <div style="position: relative;">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="search"
              placeholder="Buscar aluno..."
              class="font-chalk"
              style="width: 100%; border: 2px dashed var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 0.75rem 1rem 0.75rem 2.5rem; font-size: 0.875rem; color: var(--foreground); outline: none; transition: border-color 0.2s;"
            />
          </div>
        </div>

        <!-- Student list -->
        <div class="stagger-children" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0 1rem 2rem;">
          @for (student of filteredStudents; track student) {
            <button class="animate-slide-in" style="all: unset; width: 100%; cursor: pointer;" (click)="openStudent(student)">
              <div class="board-card-interactive" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 50%; background: var(--secondary); font-family: var(--font-chalk); font-size: 0.875rem; color: var(--secondary-foreground);">
                    {{ student.charAt(0) }}
                  </span>
                  <span class="font-chalk" style="font-size: 0.875rem; color: var(--card-foreground);">{{ student }}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          }

          @if (filteredStudents.length === 0) {
            <div style="border: 1px dashed var(--board-border); border-radius: var(--radius-xl); padding: 2rem; text-align: center;">
              <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground);">Nenhum aluno encontrado.</p>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    input:focus { border-color: rgba(212, 175, 55, 0.6) !important; }
    input::placeholder { color: rgba(138, 135, 128, 0.5); }
  `],
})
export class AlunoListComponent implements OnInit {
  private lessonService = inject(LessonService);

  allStudents: string[] = [];
  search = '';

  constructor(public router: Router) {}

  get filteredStudents(): string[] {
    if (!this.search.trim()) return this.allStudents;
    const q = this.search.toLowerCase();
    return this.allStudents.filter(name => name.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    this.allStudents = this.lessonService.getAllStudents();
  }

  openStudent(name: string): void {
    this.router.navigate(['/historico/aluno', encodeURIComponent(name)]);
  }
}
