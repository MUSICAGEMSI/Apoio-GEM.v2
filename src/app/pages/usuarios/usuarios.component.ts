// =============================================
// UsuariosComponent - Dev only
// Create and manage system users
// =============================================

import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, FUNCAO_OPCOES } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AppUser } from '../../models/lesson.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
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

        <div class="animate-fade-in" style="text-align:center;padding:0.5rem 1rem 1.5rem;">
          <h1 class="font-chalk" style="font-size:2rem;font-weight:700;color:var(--foreground);">Usuários</h1>
          <div style="margin-top:0.5rem;height:2px;width:40%;margin-inline:auto;border-radius:9999px;background:rgb(160,140,220);opacity:0.5;"></div>
        </div>

        <!-- ═══ Criar Usuário ═══ -->
        <section style="padding:0 1rem;margin-bottom:1.5rem;">
          <div style="border:2px dashed rgba(160,140,220,0.35);border-radius:var(--radius-xl);background:var(--card);padding:1.25rem;">
            <h3 class="font-chalk" style="font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgb(160,140,220);margin-bottom:1rem;">
              + Criar Usuário
            </h3>

            <div style="display:flex;flex-direction:column;gap:0.75rem;">

              <!-- Nome -->
              <div>
                <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Nome Completo</label>
                <input type="text" [(ngModel)]="newName" (ngModelChange)="onNameChange()" placeholder="Nome do usuário" class="font-chalk"
                  style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;box-sizing:border-box;"/>
              </div>

              <!-- Username (gerenciador define) -->
              <div>
                <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
                  Nome de Usuário (login)
                </label>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <input type="text" [(ngModel)]="newUsername" placeholder="ex: joao.silva" class="font-chalk"
                    style="flex:1;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;box-sizing:border-box;"/>
                  <button type="button" (click)="autoUsername()" title="Gerar automaticamente do nome" class="font-chalk"
                    style="padding:0.4rem 0.6rem;border:1px dashed rgba(160,140,220,0.5);border-radius:var(--radius-md);background:transparent;color:rgb(160,140,220);font-size:0.75rem;cursor:pointer;white-space:nowrap;">
                    Auto
                  </button>
                </div>
              </div>

              <!-- Função -->
              <div>
                <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Função</label>
                <select [(ngModel)]="newFuncao" class="font-chalk"
                  style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;">
                  <option value="">Selecione...</option>
                  @for (f of funcaoOpcoes; track f) {
                    <option [value]="f">{{ f }}</option>
                  }
                </select>
              </div>

              <!-- Senha provisória -->
              <div>
                <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Senha Provisória</label>
                <input type="text" [(ngModel)]="newPassword" placeholder="Senha inicial" class="font-chalk"
                  style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;box-sizing:border-box;"/>
              </div>

              @if (formError()) {
                <p class="font-chalk" style="font-size:0.8rem;color:rgb(220,70,70);">{{ formError() }}</p>
              }

              <button type="button" (click)="createUser()" class="font-chalk"
                [disabled]="!newName.trim() || !newUsername.trim() || !newFuncao || !newPassword.trim()"
                [style.opacity]="(!newName.trim() || !newUsername.trim() || !newFuncao || !newPassword.trim()) ? '0.4' : '1'"
                [style.cursor]="(!newName.trim() || !newUsername.trim() || !newFuncao || !newPassword.trim()) ? 'not-allowed' : 'pointer'"
                style="padding:0.625rem 1rem;border:2px solid rgba(160,140,220,0.5);border-radius:var(--radius-md);background:rgba(160,140,220,0.08);color:rgb(160,140,220);font-size:0.875rem;font-weight:700;transition:all 0.2s;">
                Criar Usuário
              </button>
            </div>

            <!-- Credenciais criadas -->
            @if (createdCreds()) {
              <div style="margin-top:1rem;border:1px solid rgba(94,196,160,0.4);border-radius:var(--radius-md);background:rgba(94,196,160,0.08);padding:1rem;">
                <p class="font-chalk" style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:rgb(94,196,160);margin-bottom:0.5rem;">✓ Usuário criado! Credenciais:</p>
                <p class="font-chalk" style="font-size:0.875rem;color:var(--foreground);">Login: <strong>{{ createdCreds()!.username }}</strong></p>
                <p class="font-chalk" style="font-size:0.875rem;color:var(--foreground);">Senha: <strong>{{ createdCreds()!.password }}</strong></p>
                <p class="font-chalk" style="font-size:0.75rem;color:var(--muted-foreground);margin-top:0.25rem;">Anote e repasse ao usuário.</p>
              </div>
            }
          </div>
        </section>

        <!-- ═══ Lista de usuários ═══ -->
        <section style="padding:0 1rem;">
          <p class="font-chalk" style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted-foreground);margin-bottom:0.75rem;">
            Usuários Cadastrados
          </p>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            @for (u of users(); track u.id) {
              <div style="border:1px solid var(--board-border);border-radius:var(--radius-xl);background:var(--card);padding:0.75rem 1rem;"
                [style.opacity]="u.active ? '1' : '0.45'">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                  <div style="min-width:0;flex:1;">
                    <p class="font-chalk" style="font-size:0.875rem;font-weight:700;color:var(--foreground);">{{ u.fullName }}</p>
                    <p class="font-chalk" style="font-size:0.7rem;color:var(--muted-foreground);">
                      @{{ u.username }} · {{ u.funcao }} · {{ roleLabel(u.role) }}
                    </p>
                    @if (u.allowedClasses.length > 0) {
                      <p class="font-chalk" style="font-size:0.65rem;color:var(--muted-foreground);margin-top:0.125rem;">
                        Turmas: {{ getTurmaDescriptions(u.allowedClasses) }}
                      </p>
                    } @else {
                      <p class="font-chalk" style="font-size:0.65rem;color:rgba(94,196,160,0.7);margin-top:0.125rem;">Acesso a todas as turmas</p>
                    }
                  </div>
                  <div style="display:flex;gap:0.375rem;flex-shrink:0;align-items:center;">
                    <!-- Editar -->
                    <button type="button" (click)="openEdit(u)" title="Editar" class="font-chalk"
                      style="width:1.75rem;height:1.75rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(160,140,220,0.4);border-radius:var(--radius-sm);background:transparent;color:rgb(160,140,220);cursor:pointer;transition:all 0.2s;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </button>
                    <!-- Ativo/Inativo -->
                    @if (u.role !== 'dev') {
                      <button type="button" (click)="toggleActive(u)" class="font-chalk"
                        [style.border-color]="u.active ? 'rgba(94,196,160,0.5)' : 'rgba(220,70,70,0.4)'"
                        [style.color]="u.active ? 'rgb(94,196,160)' : 'rgb(220,70,70)'"
                        style="padding:0.2rem 0.5rem;border:1px solid;border-radius:var(--radius-sm);background:transparent;font-size:0.65rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;">
                        {{ u.active ? 'Ativo' : 'Inativo' }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <div style="height:2rem;"></div>
      </div>
    </main>

    <!-- ═══ Modal Editar Usuário ═══ -->
    @if (editingUser()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);padding:1rem;">
        <div class="animate-fade-in" style="width:100%;max-width:24rem;border:2px solid rgba(160,140,220,0.4);border-radius:var(--radius-xl);background:var(--card);padding:1.5rem;display:flex;flex-direction:column;gap:1rem;max-height:90dvh;overflow-y:auto;">

          <div style="display:flex;align-items:center;justify-content:space-between;">
            <h3 class="font-chalk" style="font-size:1rem;font-weight:700;color:rgb(160,140,220);">Editar Usuário</h3>
            <button type="button" (click)="closeEdit()"
              style="background:none;border:none;cursor:pointer;color:var(--muted-foreground);display:flex;align-items:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          <!-- Nome -->
          <div>
            <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Nome Completo</label>
            <input type="text" [(ngModel)]="editName" class="font-chalk"
              style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;box-sizing:border-box;"/>
          </div>

          <!-- Turmas com acesso -->
          <div>
            <label class="font-chalk" style="display:block;margin-bottom:0.5rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
              Turmas com Acesso
              <span class="font-chalk" style="text-transform:none;font-size:0.65rem;margin-left:0.25rem;">(vazio = acesso a todas)</span>
            </label>
            <div style="display:flex;flex-direction:column;gap:0.375rem;max-height:12rem;overflow-y:auto;">
              @for (t of allTurmas(); track t.id) {
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;padding:0.25rem 0;">
                  <input type="checkbox" [checked]="editClasses.has(t.id)" (change)="toggleClass(t.id)"
                    style="width:1rem;height:1rem;cursor:pointer;accent-color:rgb(160,140,220);"/>
                  <span class="font-chalk" style="font-size:0.8rem;color:var(--foreground);">{{ t.description }}</span>
                </label>
              }
            </div>
            @if (editClasses.size > 0) {
              <button type="button" (click)="clearEditClasses()" class="font-chalk"
                style="margin-top:0.375rem;font-size:0.7rem;color:var(--muted-foreground);background:none;border:none;cursor:pointer;text-decoration:underline;">
                Limpar seleção (acesso a todas)
              </button>
            }
          </div>

          @if (editError()) {
            <p class="font-chalk" style="font-size:0.8rem;color:rgb(220,70,70);">{{ editError() }}</p>
          }

          <div style="display:flex;gap:0.75rem;">
            <button type="button" (click)="closeEdit()" class="font-chalk"
              style="flex:1;padding:0.625rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:transparent;color:var(--muted-foreground);font-size:0.875rem;cursor:pointer;">
              Cancelar
            </button>
            <button type="button" (click)="saveEdit()" class="font-chalk"
              style="flex:2;padding:0.625rem;border:2px solid rgba(160,140,220,0.5);border-radius:var(--radius-md);background:rgba(160,140,220,0.1);color:rgb(160,140,220);font-size:0.875rem;font-weight:700;cursor:pointer;">
              Salvar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UsuariosComponent {
  auth        = inject(AuthService);
  dataService = inject(DataService);
  router      = inject(Router);

  funcaoOpcoes = FUNCAO_OPCOES;

  // ─── Criar usuário ──────────────────────────────────────────────────
  newName     = '';
  newUsername = '';
  newFuncao   = '';
  newPassword = '';
  formError   = signal('');
  createdCreds = signal<{ username: string; password: string } | null>(null);
  users = signal<AppUser[]>(this.auth.listUsers());

  allTurmas = computed(() => this.dataService.activeTurmas());

  onNameChange(): void {
    // sugestão automática leve (pode sobrescrever)
  }

  autoUsername(): void {
    if (!this.newName.trim()) return;
    this.newUsername = this.newName.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  }

  createUser(): void {
    this.formError.set(''); this.createdCreds.set(null);
    if (!this.newName.trim())     { this.formError.set('Informe o nome.'); return; }
    if (!this.newUsername.trim()) { this.formError.set('Defina o nome de usuário.'); return; }
    if (!this.newFuncao)          { this.formError.set('Selecione a função.'); return; }
    if (!this.newPassword.trim()) { this.formError.set('Defina uma senha.'); return; }

    const result = this.auth.createUser({
      fullName: this.newName.trim(),
      username: this.newUsername.trim(),
      password: this.newPassword.trim(),
      funcao: this.newFuncao,
      allowedClasses: [],
    });

    this.createdCreds.set(result.credential);
    this.users.set(this.auth.listUsers());
    this.newName = ''; this.newUsername = ''; this.newFuncao = ''; this.newPassword = '';
  }

  getTurmaDescriptions(ids: string[]): string {
    return ids.map(id => this.dataService.getTurmaName(id) || id).join(', ');
  }

  roleLabel(r: string): string {
    return ({ dev:'Dev', master:'Master', registrador:'Registrador' } as Record<string,string>)[r] ?? r;
  }

  toggleActive(u: AppUser): void {
    this.auth.toggleUserActive(u.id);
    this.users.set(this.auth.listUsers());
  }

  // ─── Editar usuário ─────────────────────────────────────────────────
  editingUser = signal<AppUser | null>(null);
  editName    = '';
  editClasses = new Set<string>();
  editError   = signal('');

  openEdit(u: AppUser): void {
    this.editingUser.set(u);
    this.editName = u.fullName;
    this.editClasses = new Set(u.allowedClasses);
    this.editError.set('');
  }

  closeEdit(): void {
    this.editingUser.set(null);
  }

  clearEditClasses(): void {
    this.editClasses = new Set<string>();
  }

  toggleClass(turmaId: string): void {
    const next = new Set(this.editClasses);
    next.has(turmaId) ? next.delete(turmaId) : next.add(turmaId);
    this.editClasses = next;
  }

  saveEdit(): void {
    const u = this.editingUser();
    if (!u) return;
    if (!this.editName.trim()) { this.editError.set('O nome não pode ser vazio.'); return; }
    this.auth.updateUser(u.id, {
      fullName: this.editName.trim(),
      allowedClasses: [...this.editClasses],
    });
    this.users.set(this.auth.listUsers());
    this.closeEdit();
  }
}