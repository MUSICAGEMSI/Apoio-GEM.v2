// =============================================
// HistoricoHomeComponent - Choose Turma or Aluno
// =============================================

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historico-home',
  standalone: true,
  template: `
    <main class="page-container">
      <div class="page-content">
        <header class="page-header">
          <button class="btn-back" (click)="router.navigate(['/'])" aria-label="Voltar ao início">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <!-- Title -->
        <div class="animate-fade-in" style="text-align: center; padding: 1rem;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <h1 class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">
              Consultar Histórico
            </h1>
          </div>
          <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">
            Selecione o tipo de consulta
          </p>
        </div>

        <div class="chalk-divider"></div>

        <!-- Selection -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 2.5rem 1rem;">
          <!-- Por TURMA — gold glow -->
          <button style="all: unset; width: 100%; max-width: 28rem; cursor: pointer;" (click)="router.navigate(['/historico/turma'])">
            <div class="animate-fade-in" style="animation-delay: 0.2s; text-align: center; padding: 2rem; border: 3px solid rgba(212,175,55,0.6); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s; box-shadow: 0 0 20px rgba(212,175,55,0.1);">
              <div style="width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 2px dashed rgba(212,175,55,0.4); display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">Consultar por TURMA</span>
              <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">Visualizar histórico e frequência por turma</p>
            </div>
          </button>

          <!-- Por ALUNO — foreground border with glow -->
          <button style="all: unset; width: 100%; max-width: 28rem; cursor: pointer;" (click)="router.navigate(['/historico/aluno'])">
            <div class="animate-fade-in" style="animation-delay: 0.4s; text-align: center; padding: 2rem; border: 3px solid var(--foreground); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s; box-shadow: 0 0 20px rgba(212,208,203,0.12);">
              <div style="width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 2px dashed var(--board-border); display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span class="font-chalk" style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">Consultar por ALUNO</span>
              <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">Buscar histórico individual de um aluno</p>
            </div>
          </button>
        </div>
      </div>
    </main>
  `,
})
export class HistoricoHomeComponent {
  constructor(public router: Router) {}
}
