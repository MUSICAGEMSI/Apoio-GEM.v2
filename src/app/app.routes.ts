// =============================================
// App Routes - Angular 19 Standalone + Guards
// =============================================

import { Routes } from '@angular/router';
import { authGuard, masterGuard, devGuard } from './services/auth.guard';

export const routes: Routes = [
  // ── Public ──────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },

  // ── Protected (all logged-in users) ─────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'lancar-aula',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/lancar-aula/turma-select/turma-select.component').then(m => m.TurmaSelectComponent),
  },
  {
    path: 'lancar-aula/:turmaId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/lancar-aula/attendance/attendance.component').then(m => m.AttendanceComponent),
  },
  {
    path: 'lancar-aula/:turmaId/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/lancar-aula/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'historico',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historico/historico-home/historico-home.component').then(m => m.HistoricoHomeComponent),
  },
  {
    path: 'historico/turma',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historico/turma-list/turma-list.component').then(m => m.TurmaListComponent),
  },
  {
    path: 'historico/turma/:turmaId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historico/turma-detail/turma-detail.component').then(m => m.TurmaDetailComponent),
  },
  {
    path: 'historico/turma/:turmaId/:lessonId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historico/lesson-detail/lesson-detail.component').then(m => m.LessonDetailComponent),
  },
  {
    path: 'historico/aluno',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historico/aluno-list/aluno-list.component').then(m => m.AlunoListComponent),
  },
  {
    path: 'historico/aluno/:studentName',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historico/aluno-detail/aluno-detail.component').then(m => m.AlunoDetailComponent),
  },

  // ── Master/Dev only ───────────────────────────────────────────────────────
  {
    path: 'gerenciamento',
    canActivate: [authGuard, masterGuard],
    loadComponent: () =>
      import('./pages/gerenciamento/gerenciamento.component').then(m => m.GerenciamentoComponent),
  },

  // ── Dev only ───────────────────────────────────────────────────────────
  {
    path: 'usuarios',
    canActivate: [authGuard, devGuard],
    loadComponent: () =>
      import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
