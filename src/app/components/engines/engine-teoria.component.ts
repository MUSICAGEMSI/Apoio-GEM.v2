// =============================================
// EngineTeoria - MSA Group/Individual modes
// Angular 19 Standalone - single file
// =============================================

import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { AutocompleteInputComponent } from './autocomplete-input.component';
import { StatusSelectorComponent, StatusLevel } from './status-selector.component';
import { HistoryAccumulatorComponent, HistoryEntry } from './history-accumulator.component';

// ─── Intervalo de Fases (lista completa, igual ao original) ─────────────────
const MSA_RANGE_PHASES = [
  'Fase 1.1','Fase 1.2','Fase 1.3','Fase 1.4','Fase 1.5','Fase 1.6',
  'Fase 2.1','Fase 2.2','Fase 2.3','Fase 2.4','Fase 2.5','Fase 2.6',
  'Fase 3.1','Fase 3.2','Fase 3.3','Fase 3.4','Fase 3.5',
  'Fase 4.1','Fase 4.2','Fase 4.3','Fase 4.4','Fase 4.5','Fase 4.6','Fase 4.7',
  'Fase 5.1','Fase 5.2','Fase 5.3','Fase 5.4','Fase 5.5',
  'Fase 6.1','Fase 6.2','Fase 6.3','Fase 6.4','Fase 6.5','Fase 6.6','Fase 6.7',
  'Fase 7.1','Fase 7.2','Fase 7.3','Fase 7.4','Fase 7.5','Fase 7.6','Fase 7.7',
  'Fase 8.1','Fase 8.2',
  'Fase 9.1',
  'Fase 10.1',
  'Fase 11.1','Fase 11.2','Fase 11.3','Fase 11.4',
  'Fase 12.1','Fase 12.2',
  'Fase 13.1',
  'Fase 14.1',
  'Fase 15.1','Fase 15.2','Fase 15.3',
  'Fase 16.1','Fase 16.2','Fase 16.3',
];

function rangePhaseRank(phase: string): number { return MSA_RANGE_PHASES.indexOf(phase); }

// ─── Exercise Phases ────────────────────────────────────────────────────────
const MSA_EX_PHASES_DATA: Record<string, string[]> = {
  'Fase 1.6': ['1','2','3','4','5','6','7','8','9'],
  'Fase 2.1': ['1','2','3','4','5','6'],
  'Fase 2.4': ['1a','1b','1c','1d','1e'],
  'Fase 2.6': ['1','2','3a','3b','3c','3d','4','5','6a','6b','7a','7b','8a','8b','9','10','11','12','13'],
  'Fase 3.2': ['1','2','3','4'],
  'Fase 3.5': ['1','2','3','4','5'],
  'Fase 4.4': ['1','2'],
  'Fase 4.6': ['1'],
  'Fase 5.4': ['1'],
  'Fase 6.6': ['1','2','3','4','5'],
  'Fase 6.7': ['1','2','3','4','5'],
  'Fase 7.3': ['1'],
  'Fase 8.1': ['1','2','3'],
};

const MSA_EX_PHASE_NAMES = Object.keys(MSA_EX_PHASES_DATA);

// ─── Solfejo Data ────────────────────────────────────────────────────────────
const SOLFEJO_COM_CLAVE_DATA: Record<string, string[]> = {
  'Fase 1.6':  ['1','2','3','4','5','6','7','8','9'],
  'Fase 2.1':  ['1','2','3','4','5','6'],
  'Fase 2.4':  ['1a','1b','1c','1d','1e'],
  'Fase 2.6':  ['1','2','3a','3b','3c','3d','4','5','6a','6b','7a','7b','8a','8b','9','10','11','12','13'],
  'Fase 3.2':  ['1','2','3','4'],
  'Fase 3.5':  ['1','2','3','4','5'],
  'Fase 4.4':  ['1','2'],
  'Fase 4.5':  ['7','8','9','10','11','12','13','14','15','16'],
  'Fase 4.6':  ['1'],
  'Fase 4.7':  ['19','20','21','22','23','24','25','26','27','28','29'],
  'Fase 5.1':  ['30','31','32','33','34'],
  'Fase 5.2':  ['35','36','37'],
  'Fase 5.4':  ['1'],
  'Fase 5.5':  ['40','41','42'],
  'Fase 6.7':  ['1','2','3','4','5'],
  'Fase 7.3':  ['1'],
  'Fase 7.4':  ['45','47'],
  'Fase 7.7':  ['49','50','56','57'],
  'Fase 8.1':  ['1','2','3'],
  'Fase 8.2':  ['62'],
  'Fase 9.1':  ['67','68','69'],
  'Fase 10.1': ['72','73','74','75','76'],
  'Fase 11.4': ['77','78','79','80','81'],
  'Fase 12.2': ['82','83','84','85','86','87','88','89'],
  'Fase 13.1': ['90','91','92','93','94','95'],
  'Fase 14.1': ['96','97','98','99','100','101','102','103','104','105'],
  'Fase 15.3': ['106','107'],
  'Fase 16.3': ['108','109','110','111','112','113'],
};

// SEM clave: these phase+lesson combos must NOT show clave selector
const SOLFEJO_SEM_CLAVE_DATA: Record<string, string[]> = {
  'Fase 3.5': ['1','2','3','4','5'],
  'Fase 4.5': ['6'],
  'Fase 4.7': ['17','18'],
  'Fase 5.4': ['38','39'],
  'Fase 7.3': ['43','44'],
  'Fase 7.4': ['46'],
  'Fase 7.6': ['48'],
  'Fase 7.7': ['51','52','53','54','55','58','59','60','61'],
  'Fase 8.2': ['63','64','65','66'],
  'Fase 9.1': ['70','71'],
};

// ─── Build helpers ────────────────────────────────────────────────────────────
function sortLabelsNaturally(a: string, b: string): number {
  const na = parseInt(a, 10), nb = parseInt(b, 10);
  if (!isNaN(na) && !isNaN(nb)) { if (na !== nb) return na - nb; return a.localeCompare(b); }
  return a.localeCompare(b, undefined, { numeric: true });
}

function phaseOrder(p: string): number {
  const m = p.match(/Fase (\d+)\.(\d+)/);
  return m ? parseInt(m[1], 10) * 1000 + parseInt(m[2], 10) : Infinity;
}

function buildSolfejoLessonsMap(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const map of [SOLFEJO_COM_CLAVE_DATA, SOLFEJO_SEM_CLAVE_DATA]) {
    for (const [phase, lessons] of Object.entries(map)) {
      if (!result[phase]) result[phase] = [];
      for (const l of lessons) if (!result[phase].includes(l)) result[phase].push(l);
    }
  }
  for (const phase of Object.keys(result)) result[phase].sort(sortLabelsNaturally);
  return result;
}

const SOLFEJO_LESSONS_MAP = buildSolfejoLessonsMap();
const SOLFEJO_PHASE_NAMES = Object.keys(SOLFEJO_LESSONS_MAP).sort((a, b) => phaseOrder(a) - phaseOrder(b));

// Build set of "phase|lesson" keys that require clave selection
const SOLFEJO_WITH_CLAVE = new Set<string>();
for (const [phase, lessons] of Object.entries(SOLFEJO_COM_CLAVE_DATA)) {
  for (const l of lessons) {
    if (!SOLFEJO_SEM_CLAVE_DATA[phase]?.includes(l)) SOLFEJO_WITH_CLAVE.add(`${phase}|${l}`);
  }
}

function lessonHasClave(phase: string, lesson: string): boolean {
  return SOLFEJO_WITH_CLAVE.has(`${phase}|${lesson}`);
}

function parseExLabels(labelStr: string): string[] {
  return labelStr.split(/,\s+|\s+e\s+/).map(s => s.trim()).filter(Boolean);
}

const CLAVES = ['Sol', 'Do', 'Fa'];
const INDIVIDUAL_METHODS = ['MSA', 'Apostila Auxiliar de Solfejo'];

// ─── Component ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-engine-teoria',
  standalone: true,
  imports: [AutocompleteInputComponent, StatusSelectorComponent, HistoryAccumulatorComponent],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      @if (mode === 'group') {

        <!-- MSA Header -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px solid rgba(94,196,160,0.3); background: rgba(94,196,160,0.05); padding: 0.75rem 1rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(94,196,160)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; letter-spacing: 0.05em; color: rgb(94,196,160);">
            MSA - Método Simplificado de Aprendizagem
          </span>
        </div>

        <!-- Section 1: Fase De/Ate -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 1rem;">
          <label class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Intervalo de Fases</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <span class="font-chalk" style="display: block; margin-bottom: 0.25rem; font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">De</span>
              <app-autocomplete-input [suggestions]="msaRangePhases" placeholder="Fase..." [blockedValues]="[]"
                [value]="gFaseDe()" (confirmed)="gFaseDe.set($event)" (cleared)="clearGFaseDe()" />
            </div>
            <div>
              <span class="font-chalk" style="display: block; margin-bottom: 0.25rem; font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Ate</span>
              <app-autocomplete-input [suggestions]="gFaseAteSuggestions()" placeholder="Fase..." [blockedValues]="[]"
                [value]="gFaseAte()" (confirmed)="gFaseAte.set($event)" (cleared)="gFaseAte.set(null)" />
            </div>
          </div>
          @if (gRangeError()) {
            <p class="font-chalk" style="font-size: 0.75rem; color: rgb(220,70,70);">O campo "Até" deve ser uma fase igual ou superior à fase selecionada em "De" ({{ gFaseDe() }})</p>
          }
          @if (gRangeOverlap() && gRangeValid()) {
            <p class="font-chalk" style="font-size: 0.75rem; color: rgb(230,160,50);">
              Fases já registradas: {{ overlappingPhaseNames() }}. Este intervalo sobrepõe fases já adicionadas.
            </p>
          }
          @if (gRangeValid() && !gRangeIsDuplicate()) {
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                <textarea [value]="gFaseObs()" (input)="gFaseObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="1" class="font-chalk"
                  style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
              </div>
              <button type="button" (click)="addFaseRange()" class="font-chalk"
                style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.5rem; border: 2px dashed rgba(94,196,160,0.4); padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 700; color: rgb(94,196,160); cursor: pointer; transition: all 0.2s; background: transparent;">
                + Adicionar Intervalo
              </button>
            </div>
          }
        </div>

        <!-- Section 2: Exercícios do MSA -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 1rem;">
          <label class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Exercícios do MSA</label>
          <app-autocomplete-input [suggestions]="msaExPhaseNames" placeholder="Selecione a fase..." [blockedValues]="[]"
            [value]="gExPhase()" (confirmed)="onGExPhaseConfirmed($event)" (cleared)="onGExPhaseCleared()" />

          @if (gExPhase() && gExLabels().length > 0) {
            <span class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              {{ gExPhase() }} - Selecione os exercícios
            </span>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              @for (ex of gExLabels(); track ex) {
                <button type="button" (click)="toggleGExercise(ex)" [disabled]="isGExBlocked(ex)"
                  [style.border-color]="gExSelected().has(ex) ? 'var(--primary)' : isGExBlocked(ex) ? 'rgba(58,56,53,0.3)' : 'var(--board-border)'"
                  [style.border-style]="gExSelected().has(ex) ? 'solid' : 'dashed'"
                  [style.background]="gExSelected().has(ex) ? 'rgba(212,175,55,0.1)' : 'transparent'"
                  [style.color]="isGExBlocked(ex) ? 'rgba(138,135,128,0.3)' : gExSelected().has(ex) ? 'var(--primary)' : 'var(--foreground)'"
                  [style.cursor]="isGExBlocked(ex) ? 'not-allowed' : 'pointer'"
                  style="display: flex; min-width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border-radius: 0.5rem; border-width: 2px; padding: 0 0.375rem; font-size: 0.875rem; font-weight: 700; transition: all 0.2s;"
                  class="font-chalk">{{ ex }}</button>
              }
            </div>
            @if (gExSelected().size > 0) {
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                  <textarea [value]="gExObs()" (input)="gExObs.set(asInput($event).value)" placeholder="Observação sobre exercícios..." rows="1" class="font-chalk"
                    style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                </div>
                <button type="button" (click)="addGExercises()" class="font-chalk"
                  style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.5rem; border: 2px dashed rgba(94,196,160,0.4); padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 700; color: rgb(94,196,160); cursor: pointer; transition: all 0.2s; background: transparent;">
                  + Adicionar Exercícios
                </button>
              </div>
            }
          }
        </div>

        <!-- Section 3: Solfejo e Leitura Rítmica -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 1rem;">
          <label class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Solfejo e Leitura Rítmica</label>
          <app-autocomplete-input [suggestions]="solfejoPhaseNames" placeholder="Selecione a fase..." [blockedValues]="[]"
            [value]="gSolfejoPhase()" (confirmed)="onGSolfejoPhaseConfirmed($event)" (cleared)="onGSolfejoPhaseCleared()" />

          @if (gSolfejoPhase() && gSolfejoLessons().length > 0) {
            <span class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              {{ gSolfejoPhase() }} - Selecione a lição
            </span>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              @for (lesson of gSolfejoLessons(); track lesson) {
                <button type="button" (click)="toggleGSolfejoLesson(lesson)" [disabled]="isGSolfejoLessonBlocked(lesson)"
                  [style.border-color]="gSolfejoLesson() === lesson ? 'var(--primary)' : isGSolfejoLessonBlocked(lesson) ? 'rgba(58,56,53,0.3)' : 'var(--board-border)'"
                  [style.border-style]="gSolfejoLesson() === lesson ? 'solid' : 'dashed'"
                  [style.background]="gSolfejoLesson() === lesson ? 'rgba(212,175,55,0.1)' : 'transparent'"
                  [style.color]="isGSolfejoLessonBlocked(lesson) ? 'rgba(138,135,128,0.3)' : gSolfejoLesson() === lesson ? 'var(--primary)' : 'var(--foreground)'"
                  [style.cursor]="isGSolfejoLessonBlocked(lesson) ? 'not-allowed' : 'pointer'"
                  style="display: flex; min-width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border-radius: 0.5rem; border-width: 2px; padding: 0 0.375rem; font-size: 0.875rem; font-weight: 700; transition: all 0.2s;"
                  class="font-chalk">{{ lesson }}</button>
              }
            </div>
            @if (gSolfejoLesson()) {
              @if (gSolfejoLessonHasClave()) {
                <label class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Claves (seleção múltipla)</label>
                <div style="display: flex; gap: 0.5rem;">
                  @for (c of claves; track c) {
                    <button type="button" (click)="toggleGClave(c)"
                      [style.border-color]="gSolfejoClaves().has(c) ? 'var(--primary)' : 'var(--board-border)'"
                      [style.border-style]="gSolfejoClaves().has(c) ? 'solid' : 'dashed'"
                      [style.background]="gSolfejoClaves().has(c) ? 'rgba(212,175,55,0.1)' : 'transparent'"
                      [style.color]="gSolfejoClaves().has(c) ? 'var(--primary)' : 'var(--foreground)'"
                      style="flex: 1; border-radius: 0.5rem; border-width: 2px; padding: 0.625rem 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                      class="font-chalk">Clave de {{ c }}</button>
                  }
                </div>
              }
              @if (gCanAddSolfejo()) {
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                    <textarea [value]="gSolfejoObs()" (input)="gSolfejoObs.set(asInput($event).value)" placeholder="Observação sobre solfejo..." rows="1" class="font-chalk"
                      style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                  </div>
                  <button type="button" (click)="addGSolfejo()" class="font-chalk"
                    style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.5rem; border: 2px dashed rgba(94,196,160,0.4); padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 700; color: rgb(94,196,160); cursor: pointer; transition: all 0.2s; background: transparent;">
                    + Adicionar Solfejo
                  </button>
                </div>
              }
            }
          }
        </div>

        <!-- Accumulated entries -->
        <app-history-accumulator [entries]="entries()" addLabel="" [addDisabled]="true"
          [canRemoveLast]="entries().length > 0" (removeLast)="handleRemoveLast()" (removeAt)="handleRemoveAt($event)" />

        <!-- Unsaved state warning (group) -->
        @if (gHasUnsaved()) {
          <div style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(220,160,50,0.5); background: rgba(220,160,50,0.08); padding: 0.625rem 0.875rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(220,160,50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span class="font-chalk" style="font-size: 0.75rem; color: rgb(220,160,50);">
              Há dados não salvos. Adicione ou limpe os campos antes de prosseguir.
            </span>
          </div>
        }

        <!-- Save (group) -->
        <button type="button" [disabled]="entries().length === 0 || gHasUnsaved()" (click)="handleSave()"
          [style.border-color]="entries().length > 0 && !gHasUnsaved() ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
          [style.color]="entries().length > 0 && !gHasUnsaved() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
          [style.cursor]="entries().length > 0 && !gHasUnsaved() ? 'pointer' : 'not-allowed'"
          style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px dashed; padding: 1rem 1.5rem; font-size: 1.25rem; font-weight: 700; transition: all 0.2s; background: transparent;"
          class="font-chalk">SALVAR</button>

      } @else {
        <!-- ===== INDIVIDUAL MODE ===== -->

        <!-- Method selector -->
        <div>
          <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Método</label>
          <div style="display: flex; gap: 0.5rem;">
            @for (m of individualMethods; track m) {
              <button type="button" (click)="iSelectedMethod.set(iSelectedMethod() === m ? null : m)"
                [style.border-color]="iSelectedMethod() === m ? 'var(--primary)' : 'var(--board-border)'"
                [style.border-style]="iSelectedMethod() === m ? 'solid' : 'dashed'"
                [style.background]="iSelectedMethod() === m ? 'rgba(212,175,55,0.1)' : 'transparent'"
                [style.color]="iSelectedMethod() === m ? 'var(--primary)' : 'var(--foreground)'"
                style="flex: 1; border-radius: 0.5rem; border-width: 2px; padding: 0.625rem 0.75rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                class="font-chalk">{{ m }}</button>
            }
          </div>
        </div>

        <!-- MSA Individual -->
        @if (iSelectedMethod() === 'MSA') {

          <!-- Solfejo e Leitura Rítmica (individual) -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 1rem;">
            <label class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Solfejo e Leitura Rítmica</label>
            <app-autocomplete-input [suggestions]="solfejoPhaseNames" placeholder="Selecione a fase..." [blockedValues]="[]"
              [value]="iMsaSolfejoPhase()" (confirmed)="onIMsaSolfejoPhaseConfirmed($event)" (cleared)="onIMsaSolfejoPhaseCleared()" />

            @if (iMsaSolfejoPhase() && iMsaSolfejoLessons().length > 0) {
              <span class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
                {{ iMsaSolfejoPhase() }} - Selecione a lição
              </span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                @for (lesson of iMsaSolfejoLessons(); track lesson) {
                  <button type="button" (click)="toggleIMsaSolfejoLesson(lesson)" [disabled]="isIMsaSolfejoLessonBlocked(lesson)"
                    [style.border-color]="iMsaSolfejoLesson() === lesson ? 'var(--primary)' : isIMsaSolfejoLessonBlocked(lesson) ? 'rgba(58,56,53,0.3)' : 'var(--board-border)'"
                    [style.border-style]="iMsaSolfejoLesson() === lesson ? 'solid' : 'dashed'"
                    [style.background]="iMsaSolfejoLesson() === lesson ? 'rgba(212,175,55,0.1)' : 'transparent'"
                    [style.color]="isIMsaSolfejoLessonBlocked(lesson) ? 'rgba(138,135,128,0.3)' : iMsaSolfejoLesson() === lesson ? 'var(--primary)' : 'var(--foreground)'"
                    [style.cursor]="isIMsaSolfejoLessonBlocked(lesson) ? 'not-allowed' : 'pointer'"
                    style="display: flex; min-width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border-radius: 0.5rem; border-width: 2px; padding: 0 0.375rem; font-size: 0.875rem; font-weight: 700; transition: all 0.2s;"
                    class="font-chalk">{{ lesson }}</button>
                }
              </div>
              @if (iMsaSolfejoLesson()) {
                @if (iMsaSolfejoLessonHasClave()) {
                  <label class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Claves (seleção múltipla)</label>
                  <div style="display: flex; gap: 0.5rem;">
                    @for (c of claves; track c) {
                      <button type="button" (click)="toggleIMsaClave(c)"
                        [style.border-color]="iMsaSolfejoClaves().has(c) ? 'var(--primary)' : 'var(--board-border)'"
                        [style.border-style]="iMsaSolfejoClaves().has(c) ? 'solid' : 'dashed'"
                        [style.background]="iMsaSolfejoClaves().has(c) ? 'rgba(212,175,55,0.1)' : 'transparent'"
                        [style.color]="iMsaSolfejoClaves().has(c) ? 'var(--primary)' : 'var(--foreground)'"
                        style="flex: 1; border-radius: 0.5rem; border-width: 2px; padding: 0.625rem 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                        class="font-chalk">Clave de {{ c }}</button>
                    }
                  </div>
                }
                @if (iMsaSolfejoReadyForStatus()) {
                  <app-status-selector [value]="iMsaSolfejoStatus()" (statusChange)="iMsaSolfejoStatus.set($event)" />
                  <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                    <textarea [value]="iMsaSolfejoObs()" (input)="iMsaSolfejoObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="2" class="font-chalk"
                      style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                  </div>
                }
              }
            }
            <app-history-accumulator [entries]="[]" addLabel="Adicionar Solfejo" [addDisabled]="!iMsaSolfejoCanAdd()" (add)="addIMsaSolfejo()" />
          </div>

          <!-- Exercícios (individual) -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 1rem;">
            <label class="font-chalk" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Exercícios</label>
            <app-autocomplete-input [suggestions]="msaExPhaseNames" placeholder="Selecione a fase..." [blockedValues]="[]"
              [value]="iMsaExPhase()" (confirmed)="onIMsaExPhaseConfirmed($event)" (cleared)="onIMsaExPhaseCleared()" />

            @if (iMsaExPhase() && iMsaExLabels().length > 0) {
              <span class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
                {{ iMsaExPhase() }} - Selecione os exercícios
              </span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                @for (ex of iMsaExLabels(); track ex) {
                  <button type="button" (click)="toggleIMsaEx(ex)" [disabled]="isIMsaExBlocked(ex)"
                    [style.border-color]="iMsaExSelected().has(ex) ? 'var(--primary)' : isIMsaExBlocked(ex) ? 'rgba(58,56,53,0.3)' : 'var(--board-border)'"
                    [style.border-style]="iMsaExSelected().has(ex) ? 'solid' : 'dashed'"
                    [style.background]="iMsaExSelected().has(ex) ? 'rgba(212,175,55,0.1)' : 'transparent'"
                    [style.color]="isIMsaExBlocked(ex) ? 'rgba(138,135,128,0.3)' : iMsaExSelected().has(ex) ? 'var(--primary)' : 'var(--foreground)'"
                    [style.cursor]="isIMsaExBlocked(ex) ? 'not-allowed' : 'pointer'"
                    style="display: flex; min-width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border-radius: 0.5rem; border-width: 2px; padding: 0 0.375rem; font-size: 0.875rem; font-weight: 700; transition: all 0.2s;"
                    class="font-chalk">{{ ex }}</button>
                }
              </div>
              @if (iMsaExSelected().size > 0) {
                <app-status-selector [value]="iMsaExStatus()" (statusChange)="iMsaExStatus.set($event)" />
                <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                  <textarea [value]="iMsaExObs()" (input)="iMsaExObs.set(asInput($event).value)" placeholder="Observação sobre exercícios..." rows="2" class="font-chalk"
                    style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                </div>
              }
            }
            <app-history-accumulator [entries]="[]" addLabel="Adicionar Exercícios" [addDisabled]="!iMsaExCanAdd()" (add)="addIMsaExercises()" />
          </div>

          @if (entries().length > 0) {
            <div style="border-top: 1px solid var(--board-border); padding-top: 1rem;">
              <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Registros Acumulados</label>
              <app-history-accumulator [entries]="entries()" addLabel="" [addDisabled]="true" [canRemoveLast]="true"
                (removeLast)="handleRemoveLast()" (removeAt)="handleRemoveAt($event)" />
            </div>
          }
        }

        <!-- Apostila Auxiliar de Solfejo -->
        @if (iSelectedMethod() === 'Apostila Auxiliar de Solfejo') {
          <div>
            <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Lição</label>
            <app-autocomplete-input [suggestions]="apostilaSuggestions" placeholder="Digite a lição..."
              [blockedValues]="apostilaBlockedValues()"
              [value]="iApostilaLesson()" (confirmed)="iApostilaLesson.set($event)" (cleared)="iApostilaLesson.set(null)" />
          </div>
          @if (iApostilaLesson()) {
            <app-status-selector [value]="iApostilaStatus()" (statusChange)="iApostilaStatus.set($event)" />
            <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
              <textarea [value]="iApostilaObs()" (input)="iApostilaObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="2" class="font-chalk"
                style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
            </div>
          }
          <app-history-accumulator [entries]="entries()" addLabel="Adicionar Lição" [addDisabled]="!iApostilaCanAdd()"
            [canRemoveLast]="entries().length > 0" (add)="addIApostila()" (removeLast)="handleRemoveLast()"
            (removeAt)="handleRemoveAt($event)" />
        }

        <!-- Unsaved state warning (individual) -->
        @if (iHasUnsaved()) {
          <div style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(220,160,50,0.5); background: rgba(220,160,50,0.08); padding: 0.625rem 0.875rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(220,160,50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span class="font-chalk" style="font-size: 0.75rem; color: rgb(220,160,50);">
              Há dados não salvos. Adicione ou limpe os campos antes de prosseguir.
            </span>
          </div>
        }

        <!-- Save (individual) -->
        <button type="button" [disabled]="entries().length === 0 || iHasUnsaved()" (click)="handleSave()"
          [style.border-color]="entries().length > 0 && !iHasUnsaved() ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
          [style.color]="entries().length > 0 && !iHasUnsaved() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
          [style.cursor]="entries().length > 0 && !iHasUnsaved() ? 'pointer' : 'not-allowed'"
          style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px dashed; padding: 1rem 1.5rem; font-size: 1.25rem; font-weight: 700; transition: all 0.2s; background: transparent;"
          class="font-chalk">SALVAR</button>
      }
    </div>
  `,
})
export class EngineTeoriaComponent {
  @Input() mode: 'group' | 'individual' = 'group';
  @Input() initialEntries: HistoryEntry[] = [];
  @Output() save = new EventEmitter<HistoryEntry[]>();
  @Output() entriesChange = new EventEmitter<HistoryEntry[]>();

  // Expose constants to template
  msaRangePhases    = MSA_RANGE_PHASES;
  msaExPhaseNames   = MSA_EX_PHASE_NAMES;
  solfejoPhaseNames = SOLFEJO_PHASE_NAMES;
  claves            = CLAVES;
  individualMethods = INDIVIDUAL_METHODS;
  apostilaSuggestions = Array.from({ length: 170 }, (_, i) => `Lição ${i + 1}`);

  entries = signal<HistoryEntry[]>([]);
  existingSources = computed(() => this.entries().map(e => e.source));

  // ── GROUP STATE ──────────────────────────────────────────────────────────────
  gFaseDe  = signal<string | null>(null);
  gFaseAte = signal<string | null>(null);
  gFaseObs = signal('');

  gExPhase    = signal<string | null>(null);
  gExSelected = signal<Set<string>>(new Set());
  gExObs      = signal('');

  gSolfejoPhase  = signal<string | null>(null);
  gSolfejoLesson = signal<string | null>(null);
  gSolfejoClaves = signal<Set<string>>(new Set());
  gSolfejoObs    = signal('');

  // ── GROUP COMPUTED ───────────────────────────────────────────────────────────
  gFaseAteSuggestions = computed(() => {
    const de = this.gFaseDe();
    if (!de) return MSA_RANGE_PHASES;
    const deRank = rangePhaseRank(de);
    return MSA_RANGE_PHASES.filter((_, i) => i >= deRank);
  });

  gRangeValid = computed(() => {
    const de = this.gFaseDe(), ate = this.gFaseAte();
    return de !== null && ate !== null && rangePhaseRank(ate) >= rangePhaseRank(de);
  });

  gRangeError = computed(() => {
    const de = this.gFaseDe(), ate = this.gFaseAte();
    return de !== null && ate !== null && rangePhaseRank(ate) < rangePhaseRank(de);
  });

  gRangeLabel = computed(() => {
    if (!this.gRangeValid()) return '';
    return `MSA Teoria ${this.gFaseDe()} a ${this.gFaseAte()}`;
  });

  gCoveredPhases = computed(() => {
    const covered = new Set<number>();
    for (const src of this.existingSources()) {
      const m = src.match(/^MSA Teoria (Fase \d+\.\d+) a (Fase \d+\.\d+)$/);
      if (m) {
        const di = rangePhaseRank(m[1]), ai = rangePhaseRank(m[2]);
        if (di >= 0 && ai >= 0) for (let i = di; i <= ai; i++) covered.add(i);
      }
    }
    return covered;
  });

  gRangeOverlap = computed(() => {
    if (!this.gRangeValid()) return false;
    const di = rangePhaseRank(this.gFaseDe()!), ai = rangePhaseRank(this.gFaseAte()!);
    for (let i = di; i <= ai; i++) { if (this.gCoveredPhases().has(i)) return true; }
    return false;
  });

  gRangeIsDuplicate = computed(() => {
    const label = this.gRangeLabel();
    return (label !== '' && this.existingSources().includes(label)) || this.gRangeOverlap();
  });

  overlappingPhaseNames = computed(() => {
    if (!this.gRangeValid()) return '';
    const di = rangePhaseRank(this.gFaseDe()!), ai = rangePhaseRank(this.gFaseAte()!);
    const names: string[] = [];
    for (let i = di; i <= ai; i++) { if (this.gCoveredPhases().has(i)) names.push(MSA_RANGE_PHASES[i]); }
    return names.join(', ');
  });

  gExLabels = computed(() => {
    const phase = this.gExPhase();
    return phase ? (MSA_EX_PHASES_DATA[phase] ?? []) : [];
  });

  gSolfejoLessons = computed(() => {
    const phase = this.gSolfejoPhase();
    return phase ? (SOLFEJO_LESSONS_MAP[phase] ?? []) : [];
  });

  gSolfejoLessonHasClave = computed(() => {
    const phase = this.gSolfejoPhase(), lesson = this.gSolfejoLesson();
    return !!phase && !!lesson && lessonHasClave(phase, lesson);
  });

  gCanAddSolfejo = computed(() => {
    const phase = this.gSolfejoPhase(), lesson = this.gSolfejoLesson();
    if (!phase || !lesson) return false;
    return !lessonHasClave(phase, lesson) || this.gSolfejoClaves().size > 0;
  });

  /**
   * True when the user has started filling a section but hasn't pressed "Adicionar".
   * Prevents proceeding to SALVAR with incomplete/uncommitted data.
   */
  gHasUnsaved = computed(() => {
    // Fase range: De chosen but not yet added (Ate also filled and valid → add button visible, or partially filled)
    if (this.gFaseDe() !== null) return true;
    // Exercises: phase chosen (implies user is in-progress)
    if (this.gExPhase() !== null) return true;
    // Solfejo: phase chosen
    if (this.gSolfejoPhase() !== null) return true;
    return false;
  });

  // ── INDIVIDUAL STATE ─────────────────────────────────────────────────────────
  iSelectedMethod = signal<string | null>(null);

  iMsaSolfejoPhase  = signal<string | null>(null);
  iMsaSolfejoLesson = signal<string | null>(null);
  iMsaSolfejoClaves = signal<Set<string>>(new Set());
  iMsaSolfejoStatus = signal<StatusLevel | null>(null);
  iMsaSolfejoObs    = signal('');

  iMsaExPhase    = signal<string | null>(null);
  iMsaExSelected = signal<Set<string>>(new Set());
  iMsaExStatus   = signal<StatusLevel | null>(null);
  iMsaExObs      = signal('');

  iApostilaLesson = signal<string | null>(null);
  iApostilaStatus = signal<StatusLevel | null>(null);
  iApostilaObs    = signal('');

  // ── INDIVIDUAL COMPUTED ──────────────────────────────────────────────────────
  iMsaSolfejoLessons = computed(() => {
    const phase = this.iMsaSolfejoPhase();
    return phase ? (SOLFEJO_LESSONS_MAP[phase] ?? []) : [];
  });

  iMsaSolfejoLessonHasClave = computed(() => {
    const phase = this.iMsaSolfejoPhase(), lesson = this.iMsaSolfejoLesson();
    return !!phase && !!lesson && lessonHasClave(phase, lesson);
  });

  /** True when clave requirement is met (or not needed) — show status selector */
  iMsaSolfejoReadyForStatus = computed(() => {
    const phase = this.iMsaSolfejoPhase(), lesson = this.iMsaSolfejoLesson();
    if (!phase || !lesson) return false;
    return !lessonHasClave(phase, lesson) || this.iMsaSolfejoClaves().size > 0;
  });

  iMsaSolfejoCanAdd = computed(() =>
    this.iMsaSolfejoReadyForStatus() && this.iMsaSolfejoStatus() !== null
  );

  iMsaExLabels = computed(() => {
    const phase = this.iMsaExPhase();
    return phase ? (MSA_EX_PHASES_DATA[phase] ?? []) : [];
  });

  iMsaExCanAdd = computed(() =>
    this.iMsaExSelected().size > 0 && this.iMsaExPhase() !== null && this.iMsaExStatus() !== null
  );

  iApostilaCanAdd = computed(() =>
    this.iApostilaLesson() !== null && this.iApostilaStatus() !== null
  );

  apostilaBlockedValues = computed(() =>
    this.existingSources().map(s => s.replace('Apostila Solfejo - ', ''))
  );

  /** Individual unsaved: any of the three sub-sections has uncommitted state */
  iHasUnsaved = computed(() => {
    if (this.iSelectedMethod() === 'MSA') {
      // Solfejo: phase selected
      if (this.iMsaSolfejoPhase() !== null) return true;
      // Exercises: phase selected
      if (this.iMsaExPhase() !== null) return true;
    }
    if (this.iSelectedMethod() === 'Apostila Auxiliar de Solfejo') {
      // Lesson chosen but not yet added
      if (this.iApostilaLesson() !== null) return true;
    }
    return false;
  });

  // ── LIFECYCLE ────────────────────────────────────────────────────────────────
  ngOnInit(): void { this.entries.set([...this.initialEntries]); }

  // ── GROUP METHODS ────────────────────────────────────────────────────────────
  addFaseRange(): void {
    if (!this.gRangeValid() || this.gRangeIsDuplicate()) return;
    this.entries.update(prev => [...prev, { source: this.gRangeLabel(), observation: this.gFaseObs() || undefined }]);
    this.gFaseDe.set(null); this.gFaseAte.set(null); this.gFaseObs.set('');
    this.entriesChange.emit(this.entries());
  }

  isGExBlocked(ex: string): boolean {
    const prefix = `MSA Exercicios ${this.gExPhase()} - (`;
    for (const src of this.existingSources()) {
      if (src.startsWith(prefix)) {
        const labels = parseExLabels(src.slice(prefix.length, -1));
        if (labels.includes(ex)) return true;
      }
    }
    return false;
  }

  toggleGExercise(ex: string): void {
    if (this.isGExBlocked(ex)) return;
    this.gExSelected.update(prev => {
      const next = new Set(prev);
      next.has(ex) ? next.delete(ex) : next.add(ex);
      return next;
    });
  }

  addGExercises(): void {
    const phase = this.gExPhase();
    const all = MSA_EX_PHASES_DATA[phase ?? ''] ?? [];
    const sorted = Array.from(this.gExSelected()).sort((a, b) => all.indexOf(a) - all.indexOf(b));
    if (!phase || sorted.length === 0) return;
    const exLabel = sorted.length === 1
      ? sorted[0]
      : sorted.slice(0, -1).join(', ') + ' e ' + sorted[sorted.length - 1];
    this.entries.update(prev => [...prev, {
      source: `MSA Exercicios ${phase} - (${exLabel})`,
      observation: this.gExObs() || undefined,
    }]);
    this.gExPhase.set(null); this.gExSelected.set(new Set()); this.gExObs.set('');
    this.entriesChange.emit(this.entries());
  }

  isGSolfejoLessonBlocked(lesson: string): boolean {
    const phase = this.gSolfejoPhase();
    if (!phase) return false;
    return this.existingSources().some(src => src.startsWith(`Solfejo ${phase} - Lição ${lesson}`));
  }

  toggleGSolfejoLesson(lesson: string): void {
    if (this.isGSolfejoLessonBlocked(lesson)) return;
    this.gSolfejoLesson.set(this.gSolfejoLesson() === lesson ? null : lesson);
    this.gSolfejoClaves.set(new Set());
  }

  toggleGClave(c: string): void {
    this.gSolfejoClaves.update(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  addGSolfejo(): void {
    const phase = this.gSolfejoPhase(), lesson = this.gSolfejoLesson();
    if (!phase || !lesson) return;
    const hasClave = lessonHasClave(phase, lesson);
    if (hasClave && this.gSolfejoClaves().size === 0) return;
    const claveStr = hasClave ? ` - Clave ${Array.from(this.gSolfejoClaves()).join('/')}` : '';
    this.entries.update(prev => [...prev, {
      source: `Solfejo ${phase} - Lição ${lesson}${claveStr}`,
      observation: this.gSolfejoObs() || undefined,
    }]);
    this.gSolfejoPhase.set(null); this.gSolfejoLesson.set(null);
    this.gSolfejoClaves.set(new Set()); this.gSolfejoObs.set('');
    this.entriesChange.emit(this.entries());
  }

  // ── INDIVIDUAL METHODS ───────────────────────────────────────────────────────
  isIMsaSolfejoLessonBlocked(lesson: string): boolean {
    const phase = this.iMsaSolfejoPhase();
    if (!phase) return false;
    return this.existingSources().some(src => src.startsWith(`MSA Solfejo ${phase} - Lição ${lesson}`));
  }

  toggleIMsaSolfejoLesson(lesson: string): void {
    if (this.isIMsaSolfejoLessonBlocked(lesson)) return;
    this.iMsaSolfejoLesson.set(this.iMsaSolfejoLesson() === lesson ? null : lesson);
    this.iMsaSolfejoClaves.set(new Set());
    this.iMsaSolfejoStatus.set(null);
  }

  toggleIMsaClave(c: string): void {
    this.iMsaSolfejoClaves.update(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  addIMsaSolfejo(): void {
    const phase = this.iMsaSolfejoPhase(), lesson = this.iMsaSolfejoLesson(), st = this.iMsaSolfejoStatus();
    if (!phase || !lesson || !st) return;
    const hasClave = lessonHasClave(phase, lesson);
    if (hasClave && this.iMsaSolfejoClaves().size === 0) return;
    const claveStr = hasClave ? ` - Clave ${Array.from(this.iMsaSolfejoClaves()).join('/')}` : '';
    this.entries.update(prev => [...prev, {
      source: `MSA Solfejo ${phase} - Lição ${lesson}${claveStr}`,
      status: st,
      observation: this.iMsaSolfejoObs() || undefined,
    }]);
    this.iMsaSolfejoPhase.set(null); this.iMsaSolfejoLesson.set(null);
    this.iMsaSolfejoClaves.set(new Set()); this.iMsaSolfejoStatus.set(null); this.iMsaSolfejoObs.set('');
    this.entriesChange.emit(this.entries());
  }

  isIMsaExBlocked(ex: string): boolean {
    const prefix = `MSA Exercicios ${this.iMsaExPhase()} - (`;
    for (const src of this.existingSources()) {
      if (src.startsWith(prefix)) {
        const labels = parseExLabels(src.slice(prefix.length, -1));
        if (labels.includes(ex)) return true;
      }
    }
    return false;
  }

  toggleIMsaEx(ex: string): void {
    if (this.isIMsaExBlocked(ex)) return;
    this.iMsaExSelected.update(prev => {
      const next = new Set(prev);
      next.has(ex) ? next.delete(ex) : next.add(ex);
      return next;
    });
  }

  addIMsaExercises(): void {
    const phase = this.iMsaExPhase(), st = this.iMsaExStatus();
    const all = MSA_EX_PHASES_DATA[phase ?? ''] ?? [];
    const sorted = Array.from(this.iMsaExSelected()).sort((a, b) => all.indexOf(a) - all.indexOf(b));
    if (!phase || !st || sorted.length === 0) return;
    const exLabel = sorted.length === 1
      ? sorted[0]
      : sorted.slice(0, -1).join(', ') + ' e ' + sorted[sorted.length - 1];
    this.entries.update(prev => [...prev, {
      source: `MSA Exercicios ${phase} - (${exLabel})`,
      status: st,
      observation: this.iMsaExObs() || undefined,
    }]);
    this.iMsaExPhase.set(null); this.iMsaExSelected.set(new Set());
    this.iMsaExStatus.set(null); this.iMsaExObs.set('');
    this.entriesChange.emit(this.entries());
  }

  addIApostila(): void {
    const lesson = this.iApostilaLesson(), st = this.iApostilaStatus();
    if (!lesson || !st) return;
    this.entries.update(prev => [...prev, {
      source: `Apostila Solfejo - ${lesson.trim()}`,
      status: st,
      observation: this.iApostilaObs() || undefined,
    }]);
    this.iApostilaLesson.set(null); this.iApostilaStatus.set(null); this.iApostilaObs.set('');
    this.entriesChange.emit(this.entries());
  }

  // ── TEMPLATE EVENT HANDLERS ──────────────────────────────────────────────────
  clearGFaseDe(): void { this.gFaseDe.set(null); this.gFaseAte.set(null); }

  onGExPhaseConfirmed(v: string): void { this.gExPhase.set(v); this.gExSelected.set(new Set()); }
  onGExPhaseCleared(): void { this.gExPhase.set(null); this.gExSelected.set(new Set()); }

  onGSolfejoPhaseConfirmed(p: string): void {
    this.gSolfejoPhase.set(p); this.gSolfejoLesson.set(null); this.gSolfejoClaves.set(new Set());
  }
  onGSolfejoPhaseCleared(): void {
    this.gSolfejoPhase.set(null); this.gSolfejoLesson.set(null); this.gSolfejoClaves.set(new Set());
  }

  onIMsaSolfejoPhaseConfirmed(p: string): void {
    this.iMsaSolfejoPhase.set(p); this.iMsaSolfejoLesson.set(null);
    this.iMsaSolfejoClaves.set(new Set()); this.iMsaSolfejoStatus.set(null);
  }
  onIMsaSolfejoPhaseCleared(): void {
    this.iMsaSolfejoPhase.set(null); this.iMsaSolfejoLesson.set(null);
    this.iMsaSolfejoClaves.set(new Set()); this.iMsaSolfejoStatus.set(null);
  }

  onIMsaExPhaseConfirmed(v: string): void {
    this.iMsaExPhase.set(v); this.iMsaExSelected.set(new Set()); this.iMsaExStatus.set(null);
  }
  onIMsaExPhaseCleared(): void {
    this.iMsaExPhase.set(null); this.iMsaExSelected.set(new Set()); this.iMsaExStatus.set(null);
  }

  handleRemoveLast(): void {
    this.entries.update(prev => prev.slice(0, -1));
    this.entriesChange.emit(this.entries());
  }

  handleRemoveAt(idx: number): void {
    this.entries.update(prev => prev.filter((_, i) => i !== idx));
    this.entriesChange.emit(this.entries());
  }

  handleSave(): void { this.save.emit(this.entries()); }

  asInput(e: Event): HTMLInputElement { return e.target as HTMLInputElement; }
}