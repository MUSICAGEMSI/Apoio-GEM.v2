// =============================================
// GerenciamentoComponent - Master/Dev only
// =============================================

import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService, INSTRUMENT_LIST, canEnroll, instrumentsForType, typeNeedsInstrument, toTitleCase, NIVEL_OPTIONS, TEORIA_SUB_LABELS } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { StudentData, TurmaData, ClassType } from '../../models/lesson.model';

type Tab = 'alunos' | 'turmas' | 'matriculas';
const CLASS_TYPES: ClassType[] = ['Teoria e Solfejo','Musicalização','Cordas','Madeiras','Metais','Personalizado'];

@Component({
  selector: 'app-gerenciamento',
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

        <div class="animate-fade-in" style="text-align:center;padding:0.5rem 1rem 1rem;">
          <h1 class="font-chalk" style="font-size:2rem;font-weight:700;color:var(--foreground);">Gerenciamento</h1>
          <div style="margin-top:0.5rem;height:2px;width:50%;margin-inline:auto;border-radius:9999px;background:rgb(94,196,160);opacity:0.5;"></div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:0.5rem;padding:0 1rem;margin-bottom:1rem;">
          @for (t of tabs; track t.key) {
            <button type="button" (click)="activeTab.set(t.key)" class="font-chalk"
              [style.border-color]="activeTab()===t.key ? 'rgba(94,196,160,0.6)' : 'var(--board-border)'"
              [style.color]="activeTab()===t.key ? 'rgb(94,196,160)' : 'var(--muted-foreground)'"
              [style.background]="activeTab()===t.key ? 'rgba(94,196,160,0.08)' : 'transparent'"
              style="flex:1;padding:0.625rem 0.5rem;border-radius:var(--radius-md);border:2px solid;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.2s;text-transform:uppercase;letter-spacing:0.05em;">
              {{ t.label }}
            </button>
          }
        </div>

        <div class="chalk-divider"></div>

        <!-- ═══ ALUNOS ═══ -->
        @if (activeTab() === 'alunos') {
          <section style="padding:0 1rem;">
            <div style="border:2px dashed rgba(212,175,55,0.3);border-radius:var(--radius-xl);background:var(--card);padding:1.25rem;margin-bottom:1.25rem;">
              <h3 class="font-chalk" style="font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--primary);margin-bottom:1rem;">+ Cadastrar Aluno</h3>
              <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div>
                  <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Nome Completo</label>
                  <input type="text" [(ngModel)]="newSName" placeholder="Nome completo do aluno" class="font-chalk"
                    style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;box-sizing:border-box;"/>
                </div>
                <div>
                  <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Instrumento</label>
                  <select [(ngModel)]="newSInst" class="font-chalk"
                    style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;">
                    <option value="">Selecione...</option>
                    @for (i of instruments; track i) { <option [value]="i">{{ i }}</option> }
                  </select>
                </div>
                <div>
                  <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Nível</label>
                  <select [(ngModel)]="newSNivel" class="font-chalk"
                    style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;">
                    <option value="">Selecione...</option>
                    @for (n of nivelOptions; track n) { <option [value]="n">{{ n }}</option> }
                  </select>
                </div>
                @if (sErr()) { <p class="font-chalk" style="font-size:0.8rem;color:rgb(220,70,70);">{{ sErr() }}</p> }
                <button type="button" (click)="addStudent()" [disabled]="!canSaveStudent()" class="font-chalk"
                  [style.border-color]="canSaveStudent() ? 'rgba(94,196,160,0.6)' : 'rgba(138,135,128,0.3)'"
                  [style.color]="canSaveStudent() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
                  [style.cursor]="canSaveStudent() ? 'pointer' : 'not-allowed'"
                  style="padding:0.625rem 1rem;border:2px solid;border-radius:var(--radius-md);background:transparent;font-size:0.875rem;font-weight:700;transition:all 0.2s;">
                  Cadastrar
                </button>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              @for (s of dataService.students(); track s.id) {
                <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--board-border);border-radius:var(--radius-xl);background:var(--card);padding:0.75rem 1rem;"
                  [style.opacity]="s.active ? '1' : '0.45'">
                  <div style="min-width:0;">
                    <p class="font-chalk" style="font-size:0.875rem;font-weight:700;color:var(--foreground);">{{ s.fullName }}</p>
                    <p class="font-chalk" style="font-size:0.7rem;color:var(--muted-foreground);">{{ s.instrument }} · {{ s.nivel }} · {{ s.enrollments.length }} turma(s)</p>
                  </div>
                  <button type="button" (click)="dataService.toggleStudentActive(s.id)" class="font-chalk"
                    [style.border-color]="s.active ? 'rgba(94,196,160,0.5)' : 'rgba(220,70,70,0.4)'"
                    [style.color]="s.active ? 'rgb(94,196,160)' : 'rgb(220,70,70)'"
                    style="flex-shrink:0;padding:0.2rem 0.5rem;border:1px solid;border-radius:var(--radius-sm);background:transparent;font-size:0.65rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;">
                    {{ s.active ? 'Ativo' : 'Inativo' }}
                  </button>
                </div>
              }
            </div>
          </section>
        }

        <!-- ═══ TURMAS ═══ -->
        @if (activeTab() === 'turmas') {
          <section style="padding:0 1rem;">
            <div style="border:2px dashed rgba(212,175,55,0.3);border-radius:var(--radius-xl);background:var(--card);padding:1.25rem;margin-bottom:1.25rem;">
              <h3 class="font-chalk" style="font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--primary);margin-bottom:1rem;">+ Cadastrar Turma</h3>

              <p class="font-chalk" style="font-size:0.75rem;color:var(--muted-foreground);margin-bottom:0.875rem;">
                O número da turma (01, 02…) é gerado automaticamente com base nas turmas já cadastradas do mesmo tipo.
              </p>

              <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div>
                  <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Tipo</label>
                  <select [(ngModel)]="newTType" (ngModelChange)="onTypeChange()" class="font-chalk"
                    style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;">
                    <option value="">Selecione...</option>
                    @for (ct of classTypes; track ct) { <option [value]="ct">{{ ct }}</option> }
                  </select>
                </div>

                @if (newTType && typeNeedsInst(newTType)) {
                  <div>
                    <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
                      Instrumento <span style="color:rgb(220,70,70);">*</span>
                    </label>
                    <select [(ngModel)]="newTInst" class="font-chalk"
                      style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.9rem;outline:none;">
                      <option value="">Selecione o instrumento...</option>
                      @for (i of instrumentsForType(); track i) { <option [value]="i">{{ i }}</option> }
                    </select>
                  </div>
                }

                @if (newTType === 'Teoria e Solfejo') {
                  <div>
                    <label class="font-chalk" style="display:block;margin-bottom:0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
                      Identificação da Turma <span style="color:var(--muted-foreground);font-size:0.65rem;">(aparece entre parênteses)</span>
                    </label>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.375rem;">
                      @for (sl of teoriaSubLabels; track sl) {
                        <button type="button" (click)="newTSubLabel = sl" class="font-chalk"
                          [style.border-color]="newTSubLabel===sl ? 'rgba(94,196,160,0.8)' : 'var(--board-border)'"
                          [style.background]="newTSubLabel===sl ? 'rgba(94,196,160,0.12)' : 'transparent'"
                          [style.color]="newTSubLabel===sl ? 'rgb(94,196,160)' : 'var(--muted-foreground)'"
                          style="padding:0.2rem 0.6rem;border:1px solid;border-radius:var(--radius-sm);font-size:0.75rem;cursor:pointer;">
                          {{ sl }}
                        </button>
                      }
                    </div>
                    <input type="text" [(ngModel)]="newTSubLabel" placeholder="Ou digite livremente..." class="font-chalk"
                      style="width:100%;padding:0.4rem 0.625rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.85rem;outline:none;box-sizing:border-box;"/>
                  </div>
                }

                @if (newTType) {
                  <div style="background:rgba(94,196,160,0.06);border:1px dashed rgba(94,196,160,0.3);border-radius:var(--radius-md);padding:0.625rem 0.875rem;">
                    <p class="font-chalk" style="font-size:0.8rem;color:var(--muted-foreground);">Nome gerado automaticamente:</p>
                    <p class="font-chalk" style="font-size:0.9rem;font-weight:700;color:rgb(94,196,160);">{{ previewTurmaName() }}</p>
                  </div>
                }

                @if (tErr()) { <p class="font-chalk" style="font-size:0.8rem;color:rgb(220,70,70);">{{ tErr() }}</p> }
                <button type="button" (click)="addTurma()" [disabled]="!canSaveTurma()" class="font-chalk"
                  [style.border-color]="canSaveTurma() ? 'rgba(94,196,160,0.6)' : 'rgba(138,135,128,0.3)'"
                  [style.color]="canSaveTurma() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
                  [style.cursor]="canSaveTurma() ? 'pointer' : 'not-allowed'"
                  style="padding:0.625rem 1rem;border:2px solid;border-radius:var(--radius-md);background:transparent;font-size:0.875rem;font-weight:700;transition:all 0.2s;">
                  Cadastrar
                </button>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.5rem;">
              @for (t of dataService.turmas(); track t.id) {
                <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--board-border);border-radius:var(--radius-xl);background:var(--card);padding:0.75rem 1rem;"
                  [style.opacity]="t.active ? '1' : '0.45'">
                  <div style="min-width:0;">
                    <p class="font-chalk" style="font-size:0.875rem;font-weight:700;color:var(--foreground);">{{ t.description }}</p>
                    <p class="font-chalk" style="font-size:0.7rem;color:var(--muted-foreground);">{{ t.type }}{{ t.instrument ? ' · ' + t.instrument : '' }}</p>
                  </div>
                  <button type="button" (click)="dataService.toggleTurmaActive(t.id)" class="font-chalk"
                    [style.border-color]="t.active ? 'rgba(94,196,160,0.5)' : 'rgba(220,70,70,0.4)'"
                    [style.color]="t.active ? 'rgb(94,196,160)' : 'rgb(220,70,70)'"
                    style="flex-shrink:0;padding:0.2rem 0.5rem;border:1px solid;border-radius:var(--radius-sm);background:transparent;font-size:0.65rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;">
                    {{ t.active ? 'Ativa' : 'Inativa' }}
                  </button>
                </div>
              }
            </div>
          </section>
        }

        <!-- ═══ MATRÍCULAS ═══ -->
        @if (activeTab() === 'matriculas') {
          <section style="padding:0 1rem;display:flex;flex-direction:column;gap:1rem;">

            <!-- List of all turmas with expandable enrolled students -->
            @for (turma of dataService.activeTurmas(); track turma.id) {
              <div style="border:1px solid var(--board-border);border-radius:var(--radius-xl);background:var(--card);overflow:hidden;">

                <!-- Turma header — click to expand -->
                <button type="button" (click)="toggleExpand(turma.id)"
                  style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;background:transparent;border:none;cursor:pointer;text-align:left;">
                  <div>
                    <p class="font-chalk" style="font-size:0.9rem;font-weight:700;color:var(--foreground);">{{ turma.description }}</p>
                    <p class="font-chalk" style="font-size:0.7rem;color:var(--muted-foreground);">
                      {{ enrolledIn(turma.id).length }} matriculado(s)
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    [style.transform]="expandedTurma() === turma.id ? 'rotate(180deg)' : 'rotate(0)'"
                    style="transition:transform 0.2s;flex-shrink:0;">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                @if (expandedTurma() === turma.id) {
                  <div style="border-top:1px solid var(--board-border);padding:0.875rem 1rem;">

                    <!-- Search + enroll -->
                    <div style="margin-bottom:0.75rem;">
                      <p class="font-chalk" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted-foreground);margin-bottom:0.375rem;">
                        Matricular aluno
                      </p>
                      <div style="display:flex;gap:0.5rem;align-items:center;">
                        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
                          placeholder="Buscar por nome..." class="font-chalk"
                          style="flex:1;padding:0.4rem 0.625rem;border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--background);color:var(--foreground);font-size:0.85rem;outline:none;"/>
                      </div>

                      <!-- Search results dropdown -->
                      @if (searchQuery.length > 0 && searchResults().length > 0) {
                        <div style="border:1px solid var(--board-border);border-radius:var(--radius-md);background:var(--card);margin-top:0.375rem;max-height:10rem;overflow-y:auto;">
                          @for (s of searchResults(); track s.id) {
                            <button type="button" (click)="enrollStudent(s, turma)"
                              style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;border:none;background:transparent;cursor:pointer;border-bottom:1px solid var(--board-border);">
                              <span class="font-chalk" style="font-size:0.85rem;color:var(--foreground);">{{ s.fullName }}</span>
                              <span class="font-chalk" style="font-size:0.7rem;color:var(--muted-foreground);">{{ s.instrument }}</span>
                            </button>
                          }
                        </div>
                      }
                      @if (searchQuery.length > 1 && searchResults().length === 0) {
                        <p class="font-chalk" style="font-size:0.8rem;color:var(--muted-foreground);margin-top:0.375rem;">Nenhum aluno elegível encontrado.</p>
                      }
                      @if (enrollMsg()) {
                        <p class="font-chalk" style="font-size:0.8rem;margin-top:0.375rem;"
                          [style.color]="enrollMsg()!.ok ? 'rgb(94,196,160)' : 'rgb(220,70,70)'">
                          {{ enrollMsg()!.text }}
                        </p>
                      }
                    </div>

                    <!-- Currently enrolled -->
                    @if (enrolledIn(turma.id).length === 0) {
                      <p class="font-chalk" style="font-size:0.85rem;color:var(--muted-foreground);">Nenhum aluno matriculado.</p>
                    }
                    <div style="display:flex;flex-direction:column;gap:0.375rem;">
                      @for (s of enrolledIn(turma.id); track s.id) {
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.375rem 0.5rem;border-radius:var(--radius-md);background:var(--muted);">
                          <span class="font-chalk" style="font-size:0.875rem;color:var(--foreground);">{{ s.fullName }}</span>
                          <button type="button" (click)="unenrollStudent(s.id, turma.id)"
                            title="Desmatricular"
                            style="width:1.5rem;height:1.5rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(220,70,70,0.4);border-radius:50%;background:transparent;color:rgb(220,70,70);cursor:pointer;flex-shrink:0;">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        }

        <div style="height:2rem;"></div>
      </div>
    </main>
  `,
})
export class GerenciamentoComponent {
  dataService = inject(DataService);
  auth        = inject(AuthService);
  router      = inject(Router);

  instruments = INSTRUMENT_LIST;
  classTypes  = CLASS_TYPES;
  tabs = [
    { key: 'alunos'     as Tab, label: 'Alunos'     },
    { key: 'turmas'     as Tab, label: 'Turmas'     },
    { key: 'matriculas' as Tab, label: 'Matrículas' },
  ];
  activeTab = signal<Tab>('alunos');

  // ─── Aluno form ─────────────────────────────
  newSName  = ''; newSInst = ''; newSNivel = '';
  nivelOptions = NIVEL_OPTIONS;
  sErr = signal('');

  canSaveStudent(): boolean {
    return this.newSName.trim().length > 0 && this.newSInst.length > 0 && this.newSNivel.length > 0;
  }

  addStudent(): void {
    this.sErr.set('');
    if (!this.newSName.trim()) { this.sErr.set('Informe o nome.'); return; }
    if (!this.newSInst)         { this.sErr.set('Selecione o instrumento.'); return; }
    if (!this.newSNivel)        { this.sErr.set('Selecione o nível.'); return; }
    const formattedName = toTitleCase(this.newSName.trim());
    this.dataService.addStudent({ fullName: formattedName, instrument: this.newSInst, nivel: this.newSNivel, active: true });
    this.newSName = ''; this.newSInst = ''; this.newSNivel = '';
  }

  // ─── Turma form ─────────────────────────────
  newTType: ClassType | '' = ''; newTInst = ''; newTSubLabel = '';
  teoriaSubLabels = TEORIA_SUB_LABELS;
  tErr = signal('');

  typeNeedsInst(t: ClassType | ''): boolean { return typeNeedsInstrument(t as ClassType); }

  onTypeChange(): void { this.newTInst = ''; this.newTSubLabel = ''; this.tErr.set(''); }

  instrumentsForType(): string[] {
    if (!this.newTType || !typeNeedsInstrument(this.newTType as ClassType)) return [];
    return instrumentsForType(this.newTType as ClassType);
  }

  previewTurmaName(): string {
    if (!this.newTType) return '';
    const turmas = this.dataService.turmas();
    const num = turmas.filter(t => t.type === this.newTType).length + 1;
    const typeLabel = (this.newTType as string).toUpperCase();
    const instrLabel = this.newTInst ? ` - ${this.newTInst}` : '';
    const subLabelPart = this.newTSubLabel ? `(${this.newTSubLabel.toUpperCase()}) - ` : '';
    return `${subLabelPart}TURMA ${String(num).padStart(2,'0')} - ${typeLabel}`;
  }

  canSaveTurma(): boolean {
    if (!this.newTType) return false;
    if (typeNeedsInstrument(this.newTType as ClassType) && !this.newTInst) return false;
    return true;
  }

  addTurma(): void {
    this.tErr.set('');
    if (!this.newTType) { this.tErr.set('Selecione o tipo.'); return; }
    if (typeNeedsInstrument(this.newTType as ClassType) && !this.newTInst) {
      this.tErr.set('O instrumento é obrigatório para este tipo de turma.'); return;
    }
    this.dataService.addTurma({ type: this.newTType as ClassType, instrument: this.newTInst, subLabel: this.newTSubLabel || undefined, active: true, description: '' });
    this.newTType = ''; this.newTInst = ''; this.newTSubLabel = '';
  }

  // ─── Matrículas ─────────────────────────────
  expandedTurma = signal<string | null>(null);
  searchQuery   = '';
  enrollMsg     = signal<{ ok: boolean; text: string } | null>(null);

  toggleExpand(id: string): void {
    this.expandedTurma.set(this.expandedTurma() === id ? null : id);
    this.searchQuery = ''; this.enrollMsg.set(null);
  }

  enrolledIn(turmaId: string): StudentData[] {
    return this.dataService.getStudentsForTurma(turmaId);
  }

  searchResults = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (q.length < 1) return [];
    const turmaId = this.expandedTurma();
    if (!turmaId) return [];
    const turma = this.dataService.getTurmaData(turmaId);
    if (!turma) return [];
    return this.dataService.activeStudents().filter(s =>
      s.fullName.toLowerCase().includes(q) &&
      !s.enrollments.includes(turmaId) &&
      canEnroll(s.instrument, turma.type)
    ).slice(0, 8);
  });

  onSearch(): void { this.enrollMsg.set(null); }

  enrollStudent(student: StudentData, turma: TurmaData): void {
    const ok = this.dataService.enroll(student.id, turma.id);
    this.enrollMsg.set(ok
      ? { ok: true, text: `${student.fullName} matriculado(a)!` }
      : { ok: false, text: `Instrumento (${student.instrument}) não permitido nesta turma.` }
    );
    this.searchQuery = '';
    setTimeout(() => this.enrollMsg.set(null), 3000);
  }

  unenrollStudent(studentId: string, turmaId: string): void {
    this.dataService.unenroll(studentId, turmaId);
  }
}