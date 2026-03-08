// =============================================
// AttendanceComponent - Chamada (P/F) with localStorage draft persistence
// =============================================

import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceToggleComponent } from '../../../components/attendance-toggle/attendance-toggle.component';
import { LessonService } from '../../../services/lesson.service';
import { AttendanceMap, ClassInfo } from '../../../models/lesson.model';

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'TerÃ§a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'SÃ¡bado'];

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule, AttendanceToggleComponent],
  template: `
    <main class="page-container">
      <div class="page-content">
        <!-- Header -->
        <header class="page-header">
          <button class="btn-back" (click)="goBack()" aria-label="Voltar para turmas">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
        </header>

        <!-- Class Title -->
        <div class="animate-fade-in" style="text-align: center; padding: 0.5rem 1rem;">
          <div style="display: inline-block; border: 2px dashed var(--board-border); border-radius: var(--radius-xl); padding: 0.75rem 1.5rem;">
            <h1 class="font-chalk" style="font-size: 1.75rem; font-weight: 700; color: var(--foreground);">
              {{ classInfo?.fullName || turmaId }}
            </h1>
          </div>
        </div>

        <!-- Date Picker -->
        <div class="animate-fade-in" style="animation-delay: 0.15s; padding: 1rem;">
          <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
            Data da Aula
          </label>
          <div 
            (click)="focusDateInput()"
            style="display: flex; align-items: center; gap: 0.75rem; border: 2px dashed var(--board-border); border-radius: var(--radius-xl); padding: 0.75rem 1rem; background: var(--card); cursor: pointer; transition: border-color 0.2s;" 
            class="date-picker-container"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
            </svg>
            <input
              #dateInput
              type="date"
              [value]="selectedDate"
              [max]="todayStr"
              (change)="onDateChange($event)"
              class="font-chalk"
              style="flex: 1; background: transparent; border: none; outline: none; color: var(--foreground); font-size: 1.125rem; cursor: pointer;"
            />
          </div>
        </div>

        <!-- Saturday warning modal -->
        @if (showSaturdayModal) {
          <div style="position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); padding: 1rem;">
            <div style="width: 100%; max-width: 22rem; border-radius: var(--radius-xl); border: 2px solid var(--board-border); background: var(--card); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: rgb(230,160,50);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
                <span class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">AtenÃ§Ã£o</span>
              </div>
              <p class="font-chalk" style="font-size: 1rem; color: var(--foreground); line-height: 1.5;">
                VocÃª selecionou <strong>{{ pendingDayName }}</strong>. Habitualmente as aulas ocorrem aos sÃ¡bados. Deseja continuar?
              </p>
              <div style="display: flex; gap: 0.75rem;">
                <button type="button" (click)="cancelDateModal()"
                  style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 2px solid rgba(220,70,70,0.6); background: rgba(220,70,70,0.1); color: rgb(220,70,70); font-family: var(--font-chalk); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                  Cancelar
                </button>
                <button type="button" (click)="confirmDateModal()"
                  style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 2px solid rgba(230,160,50,0.6); background: rgba(230,160,50,0.1); color: rgb(230,160,50); font-family: var(--font-chalk); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Student List -->
        <div class="animate-fade-in" style="animation-delay: 0.3s; padding: 0 1rem 1rem;">
          <!-- Column Headers -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span class="font-chalk" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
                {{ isPersonalizado ? 'Registrados no Sistema' : 'Matriculados' }}
              </span>
              <span style="background: var(--secondary); padding: 0.125rem 0.5rem; border-radius: var(--radius-sm); font-family: var(--font-chalk); font-size: 0.75rem; color: var(--secondary-foreground);">
                {{ students.length }}
              </span>
            </div>
            <span class="font-chalk" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              PresenÃ§a
            </span>
          </div>

          <!-- Search filter for Personalizado -->
          @if (isPersonalizado) {
            <div style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--board-border); border-radius: var(--radius-xl); padding: 0.5rem 0.75rem; background: var(--card);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchFilter"
                placeholder="Buscar aluno..."
                class="font-chalk"
                style="flex: 1; background: transparent; border: none; outline: none; color: var(--foreground); font-size: 0.875rem;"
              />
              @if (searchFilter) {
                <button (click)="searchFilter = ''" style="all: unset; cursor: pointer; color: var(--muted-foreground); display: flex; align-items: center;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              }
            </div>
          }

          <!-- Chalk line -->
          <div style="height: 2px; border-radius: 9999px; background: var(--board-border); opacity: 0.6; margin-bottom: 0.75rem;"></div>

          <!-- Modo normal: P/F por aluno -->
          @if (!isPersonalizado) {
            <div class="stagger-children" style="display: flex; flex-direction: column; gap: 0.5rem;">
              @for (student of students; track student; let i = $index) {
                <div class="animate-slide-in" style="display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--board-border); border-radius: var(--radius-xl); background: var(--card); padding: 0.625rem 0.75rem; transition: border-color 0.2s;"
                  [style.border-color]="attendance[student] === true ? 'rgba(100,180,100,0.4)' : attendance[student] === false ? 'rgba(220,70,70,0.3)' : 'var(--board-border)'"
                >
                  <div style="display: flex; align-items: center; gap: 0.625rem; min-width: 0; flex: 1;">
                    <span style="display: flex; align-items: center; justify-content: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: var(--secondary); font-family: var(--font-chalk); font-size: 0.75rem; color: var(--secondary-foreground); flex-shrink: 0;">
                      {{ i + 1 }}
                    </span>
                    <span class="font-chalk" style="font-size: 0.875rem; color: var(--card-foreground); overflow-wrap: break-word; word-break: break-word; line-height: 1.3;">
                      {{ student }}
                    </span>
                  </div>
                  <app-attendance-toggle
                    [defaultValue]="getAttendanceValue(student)"
                    (attendanceChange)="onAttendanceChange(student, $event)"
                  />
                </div>
              }
            </div>
          }

          <!-- Modo Personalizado: chips â€” toque = presente, sem toque = ausente -->
          @if (isPersonalizado) {
            <p class="font-chalk" style="font-size: 0.72rem; color: var(--muted-foreground); margin-bottom: 0.75rem; text-align: center; letter-spacing: 0.03em;">
              Toque nos alunos que estiveram presentes â€” os demais ficam como falta
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              @for (student of filteredStudents; track student) {
                <button
                  type="button"
                  (click)="togglePresent(student)"
                  class="font-chalk"
                  style="all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.8rem; border-radius: 999px; font-size: 0.85rem; transition: all 0.15s; border: 1.5px solid; user-select: none; -webkit-tap-highlight-color: transparent;"
                  [style.border-color]="isSelected(student) ? 'rgba(100,200,100,0.7)' : 'var(--board-border)'"
                  [style.background]="isSelected(student) ? 'rgba(100,200,100,0.15)' : 'var(--card)'"
                  [style.color]="isSelected(student) ? 'rgb(120,220,120)' : 'var(--muted-foreground)'"
                >
                  @if (isSelected(student)) {
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  }
                  {{ student }}
                </button>
              }
              @if (searchFilter && filteredStudents.length === 0) {
                <p class="font-chalk" style="font-size: 0.85rem; color: var(--muted-foreground); padding: 0.5rem;">
                  Nenhum aluno encontrado para "{{ searchFilter }}"
                </p>
              }
            </div>
          }
        </div>

        <!-- Summary + Advance -->
        <div style="position: sticky; bottom: 0; z-index: 20; margin-top: 0.5rem; border-top: 1px solid var(--board-border); background: var(--background); backdrop-filter: blur(12px); padding: 1rem;">
          <!-- Summary counters -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.375rem;">
              <div style="width: 0.625rem; height: 0.625rem; border-radius: 50%; background: var(--color-present);"></div>
              <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
                P: <strong style="color: var(--foreground);">{{ presentCount }}</strong>
              </span>
            </div>
            @if (isPersonalizado) {
              <div style="display: flex; align-items: center; gap: 0.375rem;">
                <div style="width: 0.625rem; height: 0.625rem; border-radius: 50%; background: var(--color-absent);"></div>
                <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
                  Ausentes: <strong style="color: var(--foreground);">{{ students.length - presentCount }}</strong>
                </span>
              </div>
            }
            @if (!isPersonalizado) {
              <div style="display: flex; align-items: center; gap: 0.375rem;">
                <div style="width: 0.625rem; height: 0.625rem; border-radius: 50%; background: var(--color-absent);"></div>
                <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
                  F: <strong style="color: var(--foreground);">{{ absentCount }}</strong>
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.375rem;">
                <div style="width: 0.625rem; height: 0.625rem; border-radius: 50%; background: var(--color-pending);"></div>
                <span class="font-chalk" style="font-size: 0.75rem; color: var(--muted-foreground);">
                  Pendentes: <strong style="color: var(--foreground);">{{ pendingCount }}</strong>
                </span>
              </div>
            }
          </div>

          <!-- Ata obrigatÃ³ria quando todos ausentes (apenas turmas normais) -->
          @if (!isPersonalizado && allMarked && presentCount === 0) {
            <div style="margin-bottom: 0.75rem; border: 2px dashed rgba(230,160,50,0.5); border-radius: var(--radius-xl); background: rgba(230,160,50,0.06); padding: 0.75rem;">
              <p class="font-chalk" style="font-size: 0.8rem; color: rgb(230,160,50); margin-bottom: 0.5rem; font-weight: 700;">
                âš  NÃ£o hÃ¡ nenhum aluno marcado como presente â€” registre a Ata de aula
              </p>
              <textarea [(ngModel)]="ataAusencia" rows="3" placeholder="Descreva o motivo / registre a ata desta aula sem presentes..." class="font-chalk"
                style="width:100%;padding:0.5rem 0.75rem;border:1px solid rgba(230,160,50,0.4);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.85rem;outline:none;resize:vertical;box-sizing:border-box;">
              </textarea>
            </div>
          }

          <!-- Advance button -->
          <button
            class="btn-primary"
            [disabled]="!canAdvance"
            (click)="advance()"
          >
            AVANÃ‡AR
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          @if (!canAdvance) {
            <p class="font-chalk" style="margin-top: 0.5rem; text-align: center; font-size: 0.75rem; color: var(--muted-foreground);">
              @if (!selectedDate) {
                Selecione a data da aula para continuar
              } @else if (isPersonalizado && presentCount === 0) {
                Selecione ao menos um aluno presente para continuar
              } @else if (pendingCount > 0) {
                Marque a presenÃ§a de todos os alunos ({{ pendingCount }} pendente{{ pendingCount !== 1 ? 's' : '' }})
              } @else if (presentCount === 0 && !ataAusencia.trim()) {
                Registre a Ata para prosseguir sem presentes
              }
            </p>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .date-picker-container:focus-within { border-color: rgba(212,175,55,0.6); }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); }
  `],
})
export class AttendanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lessonService = inject(LessonService);

  @ViewChild('dateInput') dateInputRef!: ElementRef<HTMLInputElement>;

  turmaId = '';
  classInfo: ClassInfo | undefined;
  students: string[] = [];
  attendance: AttendanceMap = {};
  selectedDate = '';
  todayStr = new Date().toISOString().split('T')[0];
  isPersonalizado = false;
  searchFilter = '';

  // Saturday modal state
  showSaturdayModal = false;
  pendingDayName = '';
  pendingDate = '';
  ataAusencia = '';

  get filteredStudents(): string[] {
    if (!this.isPersonalizado || !this.searchFilter.trim()) return this.students;
    const q = this.searchFilter.trim().toLowerCase();
    return this.students.filter(s => s.toLowerCase().includes(q));
  }

  get presentCount(): number {
    return Object.values(this.attendance).filter(v => v === true).length;
  }

  get absentCount(): number {
    return Object.values(this.attendance).filter(v => v === false).length;
  }

  get pendingCount(): number {
    return this.students.length - this.presentCount - this.absentCount;
  }

  get allMarked(): boolean {
    return this.students.every(s => s in this.attendance);
  }

  get canAdvance(): boolean {
    if (!this.selectedDate) return false;
    // Personalizado: basta ter pelo menos 1 presente (nÃ£o precisa marcar todos)
    if (this.isPersonalizado) return this.presentCount > 0;
    // Demais turmas: todos devem ser marcados
    if (!this.allMarked) return false;
    if (this.presentCount === 0 && !this.ataAusencia.trim()) return false;
    return true;
  }

  focusDateInput(): void {
    this.dateInputRef?.nativeElement?.showPicker?.();
  }

  ngOnInit(): void {
    this.turmaId = this.route.snapshot.paramMap.get('turmaId') ?? '';
    this.classInfo = this.lessonService.getClassInfo(this.turmaId);
    // Turmas "abertas" (Personalizado) permitem qualquer aluno matriculado no sistema
    const classType = this.lessonService.getTurmaType(this.turmaId);
    this.isPersonalizado = classType === 'Personalizado';
    this.students = this.isPersonalizado
      ? this.lessonService.getAllStudents()
      : this.lessonService.getStudents(this.turmaId);

    // Check if editing an existing lesson
    const editLessonId = this.route.snapshot.queryParamMap.get('editLessonId');
    if (editLessonId) {
      const existing = this.lessonService.getLessonById(editLessonId);
      if (existing) {
        this.selectedDate = existing.date;
        const map: AttendanceMap = {};
        for (const s of this.students) { map[s] = existing.presentStudents.includes(s); }
        this.attendance = map;
        this.lessonService.setDraftAttendance(this.turmaId, map);
        this.lessonService.setDraftDate(this.turmaId, existing.date);
        return;
      }
    }

    // Restore draft state from localStorage
    // Filtra apenas alunos que ainda estÃ£o na turma para evitar pendentes negativos
    const rawDraft = this.lessonService.getDraftAttendance(this.turmaId);
    const filteredDraft: typeof rawDraft = {};
    for (const s of this.students) {
      if (s in rawDraft) filteredDraft[s] = rawDraft[s];
    }
    this.attendance = filteredDraft;
    this.selectedDate = this.lessonService.getDraftDate(this.turmaId) ?? '';
  }

  isSelected(student: string): boolean {
    return this.attendance[student] === true;
  }

  togglePresent(student: string): void {
    const current = this.attendance[student] === true;
    const updated = { ...this.attendance, [student]: !current };
    // Se deselecionar (false), remove da attendance para nÃ£o contar como marcado
    if (current) {
      const { [student]: _, ...rest } = updated;
      this.attendance = rest;
    } else {
      this.attendance = updated;
    }
    this.lessonService.setDraftAttendance(this.turmaId, this.attendance);
  }

  getAttendanceValue(student: string): boolean | null {
    return this.attendance[student] ?? null;
  }

  onAttendanceChange(student: string, present: boolean): void {
    this.attendance = { ...this.attendance, [student]: present };
    this.lessonService.setDraftAttendance(this.turmaId, this.attendance);
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!value) return;

    const [y, m, d] = value.split('-');
    const date = new Date(+y, +m - 1, +d);
    const dayOfWeek = date.getDay(); // 0=Dom, 6=SÃ¡b

    if (dayOfWeek !== 6) {
      this.pendingDate = value;
      this.pendingDayName = DAY_NAMES[dayOfWeek];
      this.showSaturdayModal = true;
    } else {
      this.applyDate(value);
    }
  }

  private applyDate(value: string): void {
    this.selectedDate = value;
    this.lessonService.setDraftDate(this.turmaId, value);
  }

  confirmDateModal(): void {
    this.applyDate(this.pendingDate);
    this.showSaturdayModal = false;
    this.pendingDate = '';
    this.pendingDayName = '';
  }

  cancelDateModal(): void {
    this.showSaturdayModal = false;
    this.pendingDate = '';
    this.pendingDayName = '';
    // Reset input value visually
    this.selectedDate = '';
  }

  advance(): void {
    if (!this.canAdvance) return;

    // Para Personalizado: quem nÃ£o foi selecionado = falta
    let finalAttendance = this.attendance;
    if (this.isPersonalizado) {
      const full: AttendanceMap = {};
      for (const s of this.students) { full[s] = this.attendance[s] === true; }
      finalAttendance = full;
    }

    const presentStudents = Object.entries(finalAttendance)
      .filter(([, v]) => v)
      .map(([name]) => name);
    const editLessonId = this.route.snapshot.queryParamMap.get('editLessonId');
    this.router.navigate(['/lancar-aula', this.turmaId, 'dashboard'], {
      queryParams: {
        date: this.selectedDate,
        presentes: presentStudents.length,
        total: this.students.length,
        aluno: presentStudents,
        ...(this.ataAusencia.trim() ? { ataAusencia: this.ataAusencia.trim() } : {}),
        ...(editLessonId ? { editLessonId } : {}),
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/lancar-aula']);
  }
}
