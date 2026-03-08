// =============================================
// AuthService - ApoioGEM auth
// =============================================

import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser, UserRole } from '../models/lesson.model';

// Funções disponíveis para criar novos usuários (não-dev)
export const FUNCAO_OPCOES = ['Apoiador', 'Instrutor'] as const;
export type FuncaoOpcao = typeof FUNCAO_OPCOES[number];

// Papel no sistema baseado na função
export function roleForFuncao(f: string): UserRole {
  if (f === 'Encarregado') return 'master';
  return 'registrador'; // Instrutor, Apoiador
}

const LS_KEY_USER  = 'apoiogem_user_v2';
const LS_KEY_USERS = 'apoiogem_users_v2';

const DEFAULT_USERS: (AppUser & { password: string })[] = [
  { id:'u-dev-01',  fullName:'Desenvolvedor',  username:'dev',          password:'dev123',  role:'dev',         funcao:'Desenvolvedor', active:true, allowedClasses:[] },
  { id:'u-enc-01',  fullName:'Encarregado',     username:'encarregado',  password:'enc123',  role:'master',      funcao:'Encarregado',   active:true, allowedClasses:[] },
  { id:'u-ins-01',  fullName:'Instrutor',        username:'instrutor',    password:'ins123',  role:'registrador', funcao:'Instrutor',     active:true, allowedClasses:[] },
  { id:'u-apo-01',  fullName:'Apoiador',         username:'apoiador',     password:'apo123',  role:'registrador', funcao:'Apoiador',      active:true, allowedClasses:[] },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _users = this.loadUsers();
  private _currentUser = signal<AppUser | null>(this.loadCurrentUser());

  readonly currentUser   = this._currentUser.asReadonly();
  readonly isLoggedIn    = computed(() => this._currentUser() !== null);
  readonly userRole      = computed(() => this._currentUser()?.role ?? null);
  readonly isDevOrMaster = computed(() => {
    const r = this.userRole();
    return r === 'dev' || r === 'master';
  });

  constructor(private router: Router) {}

  login(username: string, password: string): string | null {
    const found = this._users.find(u =>
      u.username === username && u.password === password && u.active
    );
    if (!found) return 'Usuário ou senha inválidos.';
    const { password: _, ...user } = found;
    this._currentUser.set(user);
    try { localStorage.setItem(LS_KEY_USER, JSON.stringify(user)); } catch {}
    return null;
  }

  logout(): void {
    this._currentUser.set(null);
    try { localStorage.removeItem(LS_KEY_USER); } catch {}
    this.router.navigate(['/login']);
  }

  canAccessClass(turmaId: string): boolean {
    const u = this._currentUser();
    if (!u) return false;
    if (u.role === 'dev' || u.role === 'master') return true;
    return u.allowedClasses.length === 0 || u.allowedClasses.includes(turmaId);
  }

  listUsers(): AppUser[] {
    return this._users.map(({ password: _, ...u }) => u);
  }

  getUserById(id: string): AppUser | undefined {
    const u = this._users.find(u => u.id === id);
    if (!u) return undefined;
    const { password: _, ...user } = u;
    return user;
  }

  createUser(data: {
    fullName: string;
    username: string;
    password: string;
    funcao: string;
    allowedClasses: string[];
  }): { user: AppUser; credential: { username: string; password: string } } {
    const role = roleForFuncao(data.funcao);
    const newUser: AppUser & { password: string } = {
      id: `u-${Date.now()}`,
      fullName: data.fullName,
      username: data.username,
      password: data.password,
      role,
      funcao: data.funcao,
      active: true,
      allowedClasses: data.allowedClasses,
    };
    this._users.push(newUser);
    this.persistUsers();
    const { password: _, ...user } = newUser;
    return { user, credential: { username: data.username, password: data.password } };
  }

  toggleUserActive(userId: string): void {
    const u = this._users.find(u => u.id === userId);
    if (u && u.role !== 'dev') {
      u.active = !u.active;
      this.persistUsers();
    }
  }

  updateUser(userId: string, patch: {
    fullName?: string;
    allowedClasses?: string[];
  }): void {
    const u = this._users.find(u => u.id === userId);
    if (!u) return;
    Object.assign(u, patch);
    this.persistUsers();
    // Atualiza sessão se for o próprio usuário
    const cur = this._currentUser();
    if (cur?.id === userId) {
      const { password: _, ...updated } = u;
      this._currentUser.set(updated);
      try { localStorage.setItem(LS_KEY_USER, JSON.stringify(updated)); } catch {}
    }
  }

  private loadUsers(): (AppUser & { password: string })[] {
    try {
      const raw = localStorage.getItem(LS_KEY_USERS);
      return raw ? JSON.parse(raw) : [...DEFAULT_USERS];
    } catch { return [...DEFAULT_USERS]; }
  }

  private persistUsers(): void {
    try { localStorage.setItem(LS_KEY_USERS, JSON.stringify(this._users)); } catch {}
  }

  private loadCurrentUser(): AppUser | null {
    try {
      const raw = localStorage.getItem(LS_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
