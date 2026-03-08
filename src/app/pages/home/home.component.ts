// =============================================
// HomeComponent - ApoioGEM with role-based nav
// =============================================

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="page-container">
      <div class="page-content" style="justify-content: center; min-height: 100dvh; padding: 2rem 1rem;">

        <!-- Top bar: user info left + logout icon right -->
        <div style="
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.625rem 0.875rem; margin-bottom: 1.5rem;
          border: 1px solid var(--board-border); border-radius: var(--radius-xl);
          background: var(--card);
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1;">
            <div style="
              width: 1.875rem; height: 1.875rem; border-radius: 50%; flex-shrink: 0;
              background: rgba(212,175,55,0.12); border: 1px dashed rgba(212,175,55,0.4);
              display: flex; align-items: center; justify-content: center;
            ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style="min-width: 0;">
              <p class="font-chalk" style="font-size: 0.8rem; font-weight: 700; color: var(--foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ auth.currentUser()?.fullName }}
              </p>
              <p class="font-chalk" style="font-size: 0.65rem; color: var(--muted-foreground);">
                {{ auth.currentUser()?.funcao }}
              </p>
            </div>
          </div>

          <!-- Logout icon button — filled red -->
          <button type="button" (click)="auth.logout()"
            title="Sair"
            style="
              width: 2rem; height: 2rem; flex-shrink: 0;
              display: flex; align-items: center; justify-content: center;
              background: rgb(185,28,28); border: none;
              border-radius: 0.5rem; cursor: pointer;
              transition: all 0.2s; color: #fff;
            "
            onmouseover="this.style.background='rgb(220,38,38)'"
            onmouseout="this.style.background='rgb(185,28,28)'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        <!-- Title -->
        <div class="animate-fade-in" style="text-align: center; margin-bottom: 2.5rem;">
          <h1 class="font-chalk" style="font-size: 2.5rem; font-weight: 700; color: var(--foreground); line-height: 1.2;">
            ApoioGEM
          </h1>
          <p class="font-chalk" style="font-size: 0.875rem; color: var(--muted-foreground); margin-top: 0.25rem;">
            Sistema de Apoio à Gestão Musical
          </p>
          <div style="margin-top: 0.5rem; height: 2px; width: 60%; margin-inline: auto; border-radius: 9999px; background: var(--primary); opacity: 0.5;"></div>
        </div>

        <!-- Navigation buttons -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem; max-width: 28rem; margin: 0 auto; width: 100%;">

          <!-- Lançar Aula -->
          <button class="animate-fade-in" style="all: unset; display: block; width: 100%; cursor: pointer; animation-delay: 0.2s;" (click)="navigate('/lancar-aula')">
            <div style="text-align: center; padding: 2rem; border: 3px solid rgba(212,175,55,0.65); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s; box-shadow: 0 0 22px rgba(212,175,55,0.18);">
              <div style="width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 2px dashed rgba(212,175,55,0.45); display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
              </div>
              <span class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">Lançar Aula</span>
              <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">Registrar presença e conteúdo</p>
            </div>
          </button>

          <!-- Consultar Histórico -->
          <button class="animate-fade-in" style="all: unset; display: block; width: 100%; cursor: pointer; animation-delay: 0.4s;" (click)="navigate('/historico')">
            <div style="text-align: center; padding: 2rem; border: 3px solid rgba(192,192,210,0.55); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s; box-shadow: 0 0 22px rgba(192,192,210,0.12);">
              <div style="width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 2px dashed rgba(192,192,210,0.45); display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(210,210,225,0.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <span class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">Consultar Histórico</span>
              <p class="font-chalk" style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">Visualizar registros anteriores</p>
            </div>
          </button>

          <!-- Gerenciamento (master/dev only) -->
          @if (auth.isDevOrMaster()) {
            <button class="animate-fade-in" style="all: unset; display: block; width: 100%; cursor: pointer; animation-delay: 0.55s;" (click)="navigate('/gerenciamento')">
              <div style="text-align: center; padding: 1.5rem; border: 2px dashed rgba(94,196,160,0.45); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.625rem;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(94,196,160)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  <span class="font-chalk" style="font-size: 1.25rem; font-weight: 700; color: rgb(94,196,160);">Gerenciamento</span>
                </div>
                <p class="font-chalk" style="margin-top: 0.375rem; font-size: 0.8rem; color: var(--muted-foreground);">Alunos, turmas e matrículas</p>
              </div>
            </button>
          }

          <!-- Usuários (dev only) -->
          @if (auth.userRole() === 'dev') {
            <button class="animate-fade-in" style="all: unset; display: block; width: 100%; cursor: pointer; animation-delay: 0.65s;" (click)="navigate('/usuarios')">
              <div style="text-align: center; padding: 1.25rem; border: 2px dashed rgba(160,140,220,0.45); border-radius: var(--radius-xl); background: var(--card); transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.625rem;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(160,140,220)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                  <span class="font-chalk" style="font-size: 1.1rem; font-weight: 700; color: rgb(160,140,220);">Gerenciar Usuários</span>
                </div>
              </div>
            </button>
          }

        </div>
      </div>
    </main>
  `,
  styles: [`button { all: unset; display: block; width: 100%; cursor: pointer; }`],
})
export class HomeComponent {
  auth = inject(AuthService);
  constructor(private router: Router) {}
  navigate(path: string): void { this.router.navigate([path]); }
}
