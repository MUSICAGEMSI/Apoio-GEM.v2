// =============================================
// LoginComponent - First screen of the app
// =============================================

import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main style="
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background);
      padding: 1.5rem;
    ">
      <div class="animate-fade-in" style="width: 100%; max-width: 22rem;">

        <!-- Logo / Title -->
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <div style="
            width: 5rem; height: 5rem; border-radius: 50%;
            border: 2px dashed rgba(212,175,55,0.5);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.25rem;
            background: rgba(212,175,55,0.05);
          ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <h1 class="font-chalk" style="font-size: 2rem; font-weight: 700; color: var(--foreground); line-height: 1.2;">ApoioGEM</h1>
          <p class="font-chalk" style="margin-top: 0.25rem; font-size: 0.875rem; color: var(--muted-foreground);">
            Sistema de Apoio à Gestão Musical
          </p>
        </div>

        <!-- Card -->
        <div style="
          border: 2px solid rgba(212,175,55,0.3);
          border-radius: var(--radius-xl);
          background: var(--card);
          padding: 1.75rem;
          box-shadow: 0 0 32px rgba(212,175,55,0.08);
        ">
          <!-- Username -->
          <div style="margin-bottom: 1rem;">
            <label class="font-chalk" style="display: block; margin-bottom: 0.375rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              Usuário
            </label>
            <div style="
              display: flex; align-items: center; gap: 0.625rem;
              border: 2px solid var(--board-border); border-radius: var(--radius-md);
              background: var(--background); padding: 0.625rem 0.875rem;
              transition: border-color 0.2s;
            "
            [style.border-color]="usernameFocused ? 'rgba(212,175,55,0.6)' : 'var(--board-border)'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="username"
                (focus)="usernameFocused = true"
                (blur)="usernameFocused = false"
                (keydown.enter)="focusPassword()"
                placeholder="seu.usuario"
                class="font-chalk"
                #usernameInput
                style="flex: 1; background: transparent; border: none; outline: none; color: var(--foreground); font-size: 1rem;"
              />
            </div>
          </div>

          <!-- Password -->
          <div style="margin-bottom: 1.5rem;">
            <label class="font-chalk" style="display: block; margin-bottom: 0.375rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              Senha
            </label>
            <div style="
              display: flex; align-items: center; gap: 0.625rem;
              border: 2px solid var(--board-border); border-radius: var(--radius-md);
              background: var(--background); padding: 0.625rem 0.875rem;
              transition: border-color 0.2s;
            "
            [style.border-color]="passwordFocused ? 'rgba(212,175,55,0.6)' : 'var(--board-border)'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                (focus)="passwordFocused = true"
                (blur)="passwordFocused = false"
                (keydown.enter)="handleLogin()"
                placeholder="••••••••"
                class="font-chalk"
                #passwordInput
                style="flex: 1; background: transparent; border: none; outline: none; color: var(--foreground); font-size: 1rem;"
              />
              <button type="button" (click)="showPassword = !showPassword"
                style="background: none; border: none; cursor: pointer; color: var(--muted-foreground); padding: 0; display: flex; align-items: center; opacity: 0.7;"
                [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                @if (!showPassword) {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          <!-- Error message -->
          @if (errorMsg()) {
            <div style="
              display: flex; align-items: center; gap: 0.5rem;
              background: rgba(220,70,70,0.1); border: 1px solid rgba(220,70,70,0.3);
              border-radius: var(--radius-md); padding: 0.625rem 0.875rem;
              margin-bottom: 1rem;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(220,70,70)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span class="font-chalk" style="font-size: 0.875rem; color: rgb(220,70,70);">{{ errorMsg() }}</span>
            </div>
          }

          <!-- Login button -->
          <button
            type="button"
            (click)="handleLogin()"
            [disabled]="loading()"
            class="font-chalk"
            style="
              display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem;
              border-radius: var(--radius-md);
              border: 2px solid rgba(212,175,55,0.6);
              background: rgba(212,175,55,0.1);
              padding: 0.875rem 1.5rem;
              font-size: 1rem; font-weight: 700;
              color: var(--primary);
              cursor: pointer; transition: all 0.2s;
            "
          >
            @if (loading()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Entrando...
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Entrar
            }
          </button>
        </div>

        <!-- Hint -->
        <p class="font-chalk" style="text-align: center; margin-top: 1.25rem; font-size: 0.75rem; color: var(--muted-foreground); opacity: 0.6;">
          Acesso restrito ao sistema ApoioGEM
        </p>
      </div>
    </main>

    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  usernameFocused = false;
  passwordFocused = false;

  loading  = signal(false);
  errorMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  focusPassword(): void {
    const el = document.querySelector<HTMLInputElement>('input[type="password"], input[type="text"][placeholder="••••••••"]');
    el?.focus();
  }

  handleLogin(): void {
    this.errorMsg.set('');
    if (!this.username.trim() || !this.password) {
      this.errorMsg.set('Preencha usuário e senha.');
      return;
    }
    this.loading.set(true);
    // Simulate async (replace with HTTP call later)
    setTimeout(() => {
      const err = this.auth.login(this.username.trim(), this.password);
      this.loading.set(false);
      if (err) {
        this.errorMsg.set(err);
      } else {
        this.router.navigate(['/']);
      }
    }, 400);
  }
}
