// =============================================
// EngineMetaisMadeiras - Almeida Dias / Rubank / Clark's
// Angular 19 Standalone - per-turma data
// =============================================

import { Component, Input, Output, EventEmitter, signal, computed, inject, effect, OnInit } from '@angular/core';
import { AutocompleteInputComponent } from './autocomplete-input.component';
import { StatusSelectorComponent, StatusLevel } from './status-selector.component';
import { HistoryAccumulatorComponent, HistoryEntry } from './history-accumulator.component';
import { DataService, MADEIRAS_INSTRUMENTS } from '../../services/data.service';

type Tab = 'almeida-dias' | 'rubank' | 'clarks';

// Instrumentos de sopro metal que também usam Rubank Trompete + Clark's
const TROMPETE_FAMILY = new Set(['TROMPETE', 'CORNET', 'FLUGELHORN', 'POCKET']);

// ─── Shared Types ─────────────────────────────────────────────────────────────
interface SubField { name: string; lessons: string[]; }
interface AdPhase  { label: string; fields: SubField[]; }
interface RbLesson { label: string; lessons: string[]; }

// ─── Helper ──────────────────────────────────────────────────────────────────
function nums(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}
function pick(...ns: (number | string)[]): string[] { return ns.map(String); }

// ─── Trompete (metais-01) — Almeida Dias ─────────────────────────────────────
// Columns: CROMÁTICA | RITMO E POSIÇÕES | ESCALAS E ARPEJOS | INTERVALOS | FLEXIBILIDADE | INTERPRETAÇÃO
// '---' means no lessons for that phase/field
const AD_TROMPETE_PHASES: AdPhase[] = (() => {
  const raw: [string, string[], string[], string[], string[], string[], string[]][] = [
    ['Fase 1',  [],      [],         ['1','2'],                        ['1'],                  [],      []          ],
    ['Fase 2',  ['1'],   ['1','2'],  ['3','4'],                        ['2'],                  ['1'],   ['1','2']   ],
    ['Fase 3',  ['1'],   ['3'],      ['5','6','7'],                    ['3'],                  ['1'],   ['3']       ],
    ['Fase 4',  ['1'],   ['4'],      ['8','9','10'],                   ['4','5'],              ['1'],   ['4']       ],
    ['Fase 5',  ['2'],   ['5'],      ['11','12','13'],                 ['6'],                  ['2'],   ['5']       ],
    ['Fase 6',  ['2'],   ['6'],      ['14','15','16'],                 ['7'],                  ['2'],   ['6']       ],
    ['Fase 7',  ['2'],   ['7'],      ['17','18'],                      ['8'],                  ['2'],   ['7']       ],
    ['Fase 8',  ['2'],   ['8'],      ['19'],                           ['8'],                  ['3'],   ['7']       ],
    ['Fase 9',  ['2'],   ['8'],      ['20'],                           ['9'],                  ['3'],   ['8']       ],
    ['Fase 10', ['2'],   ['9'],      ['21'],                           ['9'],                  ['3'],   ['8']       ],
    ['Fase 11', ['2'],   ['9'],      ['22'],                           ['9'],                  ['3'],   ['9']       ],
    ['Fase 12', ['3'],   ['10'],     ['23'],                           ['10'],                 ['4'],   ['9']       ],
    ['Fase 13', ['3'],   ['10'],     ['24'],                           ['10'],                 ['4'],   ['11']      ],
    ['Fase 14', ['3'],   ['11'],     ['25','26'],                      ['10'],                 ['4'],   ['11']      ],
    ['Fase 15', ['3'],   ['11'],     ['27'],                           ['11'],                 ['4'],   ['10']      ],
    ['Fase 16', ['3'],   ['12'],     ['28'],                           ['11'],                 ['4'],   ['10']      ],
    ['Fase 17', ['3'],   ['12'],     ['29','30'],                      ['12'],                 ['4'],   ['12']      ],
    ['Fase 18', ['4'],   ['13'],     ['31'],                           ['12'],                 ['4'],   ['12']      ],
    ['Fase 19', ['4'],   ['13'],     ['32'],                           ['13'],                 ['5'],   ['13']      ],
    ['Fase 20', ['4'],   ['14'],     ['33','34'],                      ['13'],                 ['5'],   ['13']      ],
    ['Fase 21', ['4'],   ['14'],     ['35'],                           ['14'],                 ['5'],   ['14']      ],
    ['Fase 22', ['4'],   ['15'],     ['36'],                           ['14'],                 ['5'],   ['14']      ],
    ['Fase 23', ['4'],   ['15'],     ['37','38'],                      ['15'],                 ['5'],   ['15']      ],
    ['Fase 24', ['5'],   ['16'],     ['39'],                           ['15'],                 ['5'],   ['15']      ],
    ['Fase 25', ['5'],   ['16'],     ['40'],                           ['16'],                 ['6'],   ['16']      ],
    ['Fase 26', ['5'],   ['17'],     ['41','42'],                      ['16'],                 ['6'],   ['16']      ],
    ['Fase 27', ['5'],   ['17'],     ['43'],                           ['17'],                 ['6'],   ['17']      ],
    ['Fase 28', ['5'],   ['18'],     ['44'],                           ['17'],                 ['6'],   ['18']      ],
    ['Fase 29', ['5'],   ['18'],     ['45'],                           ['18'],                 ['6'],   ['19']      ],
    ['Fase 30', ['5'],   ['18'],     ['46'],                           ['18'],                 ['6'],   ['20']      ],
  ];
  const FIELD_NAMES = ['CROMÁTICA','RITMO E POSIÇÕES','ESCALAS E ARPEJOS','INTERVALOS','FLEXIBILIDADE','INTERPRETAÇÃO'];
  return raw.map(([label, ...cols]) => ({
    label: label as string,
    fields: FIELD_NAMES.map((name, i) => ({ name, lessons: cols[i] as string[] })).filter(f => f.lessons.length > 0),
  }));
})();

// ─── Clarinete (madeiras) — Almeida Dias ─────────────────────────────────────
// Columns: CROMÁTICA | PROGRESSIVOS MECANISMO | ESCALAS E ARPEJOS | INTERVALOS | INTERPRETAÇÃO
const AD_CLARINETE_PHASES: AdPhase[] = (() => {
  const raw: [string, string[], string[], string[], string[], string[]][] = [
    ['Fase 1',  [],      ['1'],              [],                ['1'],           ['1']      ],
    ['Fase 2',  [],      ['2','3','4'],      [],                ['2','3','4'],   ['2']      ],
    ['Fase 3',  [],      ['5'],              ['1'],             ['5'],           ['2']      ],
    ['Fase 4',  ['1'],   ['6'],              ['2'],             ['6'],           ['3']      ],
    ['Fase 5',  ['1'],   ['6'],              ['3','4'],         ['6'],           ['4']      ],
    ['Fase 6',  ['1'],   ['7'],              ['5'],             ['7'],           ['4']      ],
    ['Fase 7',  ['2'],   ['7'],              ['6'],             ['7'],           ['5']      ],
    ['Fase 8',  ['2'],   ['8'],              ['7'],             ['7'],           ['6']      ],
    ['Fase 9',  ['2'],   ['8'],              ['8'],             ['8'],           ['7']      ],
    ['Fase 10', ['2'],   ['9'],              ['9'],             ['8'],           ['8']      ],
    ['Fase 11', ['2'],   ['9'],              ['10'],            ['8'],           ['8']      ],
    ['Fase 12', ['3'],   ['10'],             ['11','12','13'],  ['9'],           ['9']      ],
    ['Fase 13', ['3'],   ['11'],             ['14','15','16'],  ['9'],           ['10']     ],
    ['Fase 14', ['3'],   ['12'],             ['17','18','19'],  ['10'],          ['10']     ],
    ['Fase 15', ['3'],   ['13'],             ['20','21','22'],  ['10'],          ['11']     ],
    ['Fase 16', ['3'],   ['13'],             ['23','24'],       ['11'],          ['11']     ],
    ['Fase 17', ['3'],   ['14'],             ['25','26'],       ['11'],          ['12']     ],
    ['Fase 18', ['4'],   ['14'],             ['27','28'],       ['12'],          ['12']     ],
    ['Fase 19', ['4'],   ['15'],             ['29','30'],       ['12'],          ['13']     ],
    ['Fase 20', ['4'],   ['15'],             ['31','32','33'],  ['13'],          ['13']     ],
    ['Fase 21', ['4'],   ['16'],             ['34','35','36'],  ['13'],          ['14']     ],
    ['Fase 22', ['4'],   ['16'],             ['37','38'],       ['14'],          ['14']     ],
    ['Fase 23', ['4'],   ['17'],             ['39','40'],       ['14'],          ['15']     ],
    ['Fase 24', ['5'],   ['17'],             ['41','42'],       ['15'],          ['15']     ],
    ['Fase 25', ['5'],   ['18'],             ['43','44'],       ['15'],          ['16']     ],
    ['Fase 26', ['5'],   ['18'],             ['45','46'],       ['16'],          ['16']     ],
    ['Fase 27', ['5'],   ['19'],             ['47','48'],       ['17'],          ['17']     ],
    ['Fase 28', ['5'],   ['19'],             ['49','50'],       ['17'],          ['18']     ],
    ['Fase 29', ['5'],   ['20'],             ['51','52'],       ['18'],          ['19']     ],
    ['Fase 30', ['5'],   ['21'],             ['53','54'],       ['18'],          ['20']     ],
  ];
  const FIELD_NAMES = ['CROMÁTICA','PROGRESSIVOS MECANISMO','ESCALAS E ARPEJOS','INTERVALOS','INTERPRETAÇÃO'];
  return raw.map(([label, ...cols]) => ({
    label: label as string,
    fields: FIELD_NAMES.map((name, i) => ({ name, lessons: cols[i] as string[] })).filter(f => f.lessons.length > 0),
  }));
})();

// ─── Rubank Trompete ─────────────────────────────────────────────────────────
const RB_TROMPETE: RbLesson[] = [
  { label: 'PRELIMINARY LESSON I',   lessons: ['1','2','3','4','5','6'] },
  { label: 'PRELIMINARY LESSON II',  lessons: ['1','2','3','4','5','6','7'] },
  { label: 'PRELIMINARY LESSON III', lessons: ['1','2','3','4','5','6','7','8'] },
  { label: 'PRELIMINARY LESSON IV',  lessons: ['1','2','3','4','5','6','7','8','9','10'] },
  { label: 'INTRODUÇÃO',             lessons: ['Fingering Chart','Table of Harmonics'] },
  { label: 'LESSON 1',  lessons: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { label: 'LESSON 2',  lessons: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { label: 'LESSON 3',  lessons: ['1','2','3','4','5','6','7','8','9','10','11'] },
  { label: 'LESSON 4',  lessons: ['1','2','3','4','5','6','7','8','9','10','11'] },
  { label: 'LESSON 5',  lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 6',  lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 7',  lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 8',  lessons: ['1','2','3','4','5','6','7','8'] },
  { label: 'LESSON 9',  lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 10', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 11', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 11 - SUPPLEMENTARY', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 12', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 13', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 14', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 15', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 16', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 17', lessons: ['1','2','3','4','5','6','7','8','9'] },
  { label: 'LESSON 18', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 19', lessons: ['1','2','3','4','5','6','7','8'] },
  { label: 'LESSON 20', lessons: ['1','2','3','4','5','6','7','8'] },
  { label: 'LESSON 20 - SUPPLEMENTARY', lessons: ['1','2','3','4'] },
  { label: 'LESSON 21', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 22', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 23', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 24', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 25', lessons: ['1','2','3','4','5','6','7','8'] },
  { label: 'LESSON 26', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 27', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 27 - SUPPLEMENTARY', lessons: ['1','2','3','4'] },
  { label: 'LESSON 28', lessons: ['1','2','3','4','5','6','7','8'] },
  { label: 'LESSON 29', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 30', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 31', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 32', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 33', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 34', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 35', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 35 - SUPPLEMENTARY', lessons: ['1','2','3','4'] },
  { label: 'LESSON 36', lessons: ['1','2','3','4'] },
  { label: 'LESSON 37', lessons: ['1','2','3'] },
  { label: 'LESSON 38', lessons: ['1','2','3','4','5'] },
  { label: 'PARTE FINAL', lessons: ["L'Elisire D'Amore",'Lucia di Lammermoor','March','Don Juan','Bolero','Air by Mozart','Der Freischütz'] },
];

// ─── Rubank Clarinete ─────────────────────────────────────────────────────────
const RB_CLARINETE: RbLesson[] = [
  { label: 'INTRODUÇÃO - Registro Grave',     lessons: ['Registro Grave'] },
  { label: 'INTRODUÇÃO - Registro Médio',     lessons: ['Registro Médio'] },
  { label: 'INTRODUÇÃO - Registro Agudo',     lessons: ['Registro Agudo'] },
  { label: 'INTRODUÇÃO - Registro Agudíssimo',lessons: ['Registro Agudíssimo'] },
  { label: 'LESSON 1',  lessons: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { label: 'LESSON 2',  lessons: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { label: 'LESSON 3',  lessons: ['1','2','3','4','5','6','7','8','9'] },
  { label: 'LESSON 4',  lessons: ['1','2','3','4','5','6','7','8','9','10'] },
  { label: 'LESSON 5',  lessons: ['1','2','3','4','5','6','7','8','9'] },
  { label: 'LESSON 6',  lessons: ['1','2','3','4','5','6','7','8','9'] },
  { label: 'LESSON 7',  lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 8',  lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 9',  lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 10', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 11', lessons: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { label: 'LESSON 12', lessons: ['1','2','3','4','5','6','7'] },
  { label: 'LESSON 12 - SUPPLEMENTARY', lessons: ['1','2','3','4'] },
  { label: 'LESSON 13', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 14', lessons: ['1','2','3','4'] },
  { label: 'LESSON 15', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 16', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 17', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 18', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 19', lessons: ['1','2','3','4'] },
  { label: 'LESSON 20', lessons: ['1','2','3','4'] },
  { label: 'LESSON 21', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 21 - SUPPLEMENTARY', lessons: ['1','2','3','4'] },
  { label: 'LESSON 22', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 23', lessons: ['1','2','3','4'] },
  { label: 'LESSON 24', lessons: ['1','2','3','4','5','6'] },
  { label: 'LESSON 25', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 26', lessons: ['1','2','3','4','5'] },
  { label: 'LESSON 27', lessons: ['1','2','3','4'] },
  { label: 'LESSON 28', lessons: ['1','2','3','4'] },
];

const CLARKS_SUGGESTIONS = Array.from({ length: 190 }, (_, i) => `Lição ${String(i + 1).padStart(2, '0')}`);

@Component({
  selector: 'app-engine-metais-madeiras',
  standalone: true,
  imports: [AutocompleteInputComponent, StatusSelectorComponent, HistoryAccumulatorComponent],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Tab buttons -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        @for (t of availableTabs; track t.key) {
          <button type="button" (click)="tab.set(t.key)"
            [style.border-color]="tab() === t.key ? 'var(--primary)' : 'var(--board-border)'"
            [style.border-style]="tab() === t.key ? 'solid' : 'dashed'"
            [style.background]="tab() === t.key ? 'rgba(212,175,55,0.1)' : 'transparent'"
            [style.color]="tab() === t.key ? 'var(--primary)' : 'var(--muted-foreground)'"
            style="flex: 1; border-radius: 0.5rem; border-width: 2px; padding: 0.625rem 0.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s;"
            class="font-chalk">{{ t.label }}</button>
        }
      </div>

      <!-- ALMEIDA DIAS -->
      @if (tab() === 'almeida-dias') {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label class="font-chalk" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Fase</label>
          <app-autocomplete-input [suggestions]="adPhaseSuggestions" placeholder="Selecione a fase..."
            [blockedValues]="[]" [value]="adPhase()" (confirmed)="adPhase.set($event)" (cleared)="adPhase.set(null)" />

          @if (adSelectedPhase(); as phase) {
            @for (field of phase.fields; track field.name) {
              <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 0.75rem;">
                <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--foreground);">{{ field.name }}</span>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  @for (lesson of field.lessons; track lesson) {
                    <button type="button" (click)="toggleFieldLesson(adPhase()!, field.name, lesson)"
                      [disabled]="isFieldLessonBlocked(adPhase()!, field.name, lesson)"
                      [style.border-color]="isFieldLessonSelected(adPhase()!, field.name, lesson) ? 'var(--primary)' : isFieldLessonBlocked(adPhase()!, field.name, lesson) ? 'rgba(58,56,53,0.3)' : 'var(--board-border)'"
                      [style.border-style]="isFieldLessonSelected(adPhase()!, field.name, lesson) ? 'solid' : 'dashed'"
                      [style.background]="isFieldLessonSelected(adPhase()!, field.name, lesson) ? 'rgba(212,175,55,0.1)' : 'transparent'"
                      [style.color]="isFieldLessonBlocked(adPhase()!, field.name, lesson) ? 'rgba(138,135,128,0.3)' : isFieldLessonSelected(adPhase()!, field.name, lesson) ? 'var(--primary)' : 'var(--foreground)'"
                      [style.cursor]="isFieldLessonBlocked(adPhase()!, field.name, lesson) ? 'not-allowed' : 'pointer'"
                      style="display: flex; min-width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 0.5rem; border-width: 2px; padding: 0 0.375rem; font-size: 0.875rem; font-weight: 700; transition: all 0.2s;"
                      class="font-chalk">{{ lesson }}</button>
                  }
                </div>
                <app-status-selector [value]="getFieldStatus(adPhase()!, field.name)" (statusChange)="setFieldStatus(adPhase()!, field.name, $event)" />
                <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                  <textarea [value]="getFieldObs(adPhase()!, field.name)" (input)="setFieldObs(adPhase()!, field.name, asInput($event).value)"
                    placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="1" class="font-chalk"
                    style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; padding-right: 6rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                  <button type="button" (click)="setFieldObs(adPhase()!, field.name, 'Não houve')"
                    style="position:absolute;right:0.375rem;top:50%;transform:translateY(-50%);font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
                    Não houve
                  </button>
                </div>
                <button type="button" [disabled]="!canAddField(adPhase()!, field.name)" (click)="addFieldEntry(adPhase()!, field)"
                  [style.border-color]="canAddField(adPhase()!, field.name) ? 'rgba(94,196,160,0.4)' : 'rgba(58,56,53,0.4)'"
                  [style.color]="canAddField(adPhase()!, field.name) ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
                  [style.cursor]="canAddField(adPhase()!, field.name) ? 'pointer' : 'not-allowed'"
                  style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.5rem; border: 2px dashed; padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; background: transparent;"
                  class="font-chalk">+ Adicionar {{ field.name }}</button>
              </div>
            }
          }
        </div>
      }

      <!-- RUBANK -->
      @if (tab() === 'rubank') {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label class="font-chalk" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Lesson</label>
          <app-autocomplete-input [suggestions]="rbLessonSuggestions" placeholder="Selecione a lição..."
            [blockedValues]="[]" [value]="rbPhase()" (confirmed)="onRbPhaseConfirmed($event)" (cleared)="onRbPhaseCleared()" />

          @if (rbSelectedLesson(); as lesson) {
            <div style="display: flex; flex-direction: column; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--board-border); background: var(--muted); padding: 0.75rem;">
              <span class="font-chalk" style="font-size: 0.875rem; font-weight: 700; color: var(--foreground);">{{ lesson.label }}</span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                @for (l of lesson.lessons; track l) {
                  <button type="button" (click)="toggleRbLesson(l)" [disabled]="isRbLessonBlocked(l)"
                    [style.border-color]="rbSelected().has(l) ? 'var(--primary)' : isRbLessonBlocked(l) ? 'rgba(58,56,53,0.3)' : 'var(--board-border)'"
                    [style.border-style]="rbSelected().has(l) ? 'solid' : 'dashed'"
                    [style.background]="rbSelected().has(l) ? 'rgba(212,175,55,0.1)' : 'transparent'"
                    [style.color]="isRbLessonBlocked(l) ? 'rgba(138,135,128,0.3)' : rbSelected().has(l) ? 'var(--primary)' : 'var(--foreground)'"
                    [style.cursor]="isRbLessonBlocked(l) ? 'not-allowed' : 'pointer'"
                    style="display: flex; min-width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 0.5rem; border-width: 2px; padding: 0 0.375rem; font-size: 0.875rem; font-weight: 700; transition: all 0.2s;"
                    class="font-chalk">{{ l }}</button>
                }
              </div>
              <app-status-selector [value]="rbStatus()" (statusChange)="rbStatus.set($event)" />
              <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
                <textarea [value]="rbObs()" (input)="rbObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="1" class="font-chalk"
                  style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.375rem 0.75rem; padding-right: 6rem; font-size: 0.75rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
                <button type="button" (click)="rbObs.set('Não houve')"
                  style="position:absolute;right:0.375rem;top:50%;transform:translateY(-50%);font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
                  Não houve
                </button>
              </div>
              <button type="button" [disabled]="!canAddRb()" (click)="addRbEntry()"
                [style.border-color]="canAddRb() ? 'rgba(94,196,160,0.4)' : 'rgba(58,56,53,0.4)'"
                [style.color]="canAddRb() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
                [style.cursor]="canAddRb() ? 'pointer' : 'not-allowed'"
                style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.5rem; border: 2px dashed; padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; background: transparent;"
                class="font-chalk">+ Adicionar Lições</button>
            </div>
          }
        </div>
      }

      <!-- CLARK'S -->
      @if (tab() === 'clarks') {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label class="font-chalk" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">Lição (Clark's)</label>
          @if (!clarksSelected()) {
            <app-autocomplete-input [suggestions]="clarksSuggestions" placeholder="Digite o número da lição..."
              [blockedValues]="clarksBlocked()" duplicateMessage="Esta lição já foi adicionada."
              (confirmed)="clarksSelected.set($event)" />
          }
          @if (clarksSelected()) {
            <div style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(212,175,55,0.4); background: rgba(212,175,55,0.05); padding: 0.5rem 0.75rem;">
              <span class="font-chalk" style="flex: 1; font-size: 0.875rem; font-weight: 700; color: var(--primary);">Selecionado: {{ clarksSelected() }}</span>
              <button type="button" (click)="clarksSelected.set(null)"
                style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0; display: flex; align-items: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <app-status-selector [value]="clarksStatus()" (statusChange)="clarksStatus.set($event)" />
            <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
              <textarea [value]="clarksObs()" (input)="clarksObs.set(asInput($event).value)" placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="2" class="font-chalk"
                style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.5rem 0.75rem; padding-right: 6rem; font-size: 0.875rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"></textarea>
              <button type="button" (click)="clarksObs.set('Não houve')"
                style="position:absolute;right:0.375rem;top:0.75rem;font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
                Não houve
              </button>
            </div>
          }
          <app-history-accumulator [entries]="[]" [addLabel]="'Adicionar ' + (clarksSelected() || '...')" [addDisabled]="!canAddClarks()" (add)="addClarks()" />
        </div>
      }

      <!-- Combined history -->
      @if (entries().length > 0) {
        <div style="border-top: 1px solid var(--board-border); padding-top: 1rem;">
          <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
            Registros Acumulados
          </label>
          <app-history-accumulator [entries]="entries()" addLabel="" [addDisabled]="true" [canRemoveLast]="true"
            (removeLast)="handleRemoveLast()" (removeAt)="handleRemoveAt($event)" (editAt)="handleEditAt($event)" />
        </div>
      }

      <button type="button" [disabled]="entries().length === 0" (click)="handleSave()"
        [style.border-color]="entries().length > 0 ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
        [style.color]="entries().length > 0 ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
        [style.cursor]="entries().length > 0 ? 'pointer' : 'not-allowed'"
        style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px dashed; padding: 1rem 1.5rem; font-size: 1.25rem; font-weight: 700; transition: all 0.2s; background: transparent;"
        class="font-chalk">SALVAR</button>
    </div>
  `,
})
export class EngineMetaisMadeirasComponent implements OnInit {
  private dataService = inject(DataService);

  @Input() turmaId = '';
  @Input() initialEntries: HistoryEntry[] = [];
  @Output() save = new EventEmitter<HistoryEntry[]>();
  @Output() entriesChange = new EventEmitter<HistoryEntry[]>();

  // ── Getters puros — lidos fresh a cada render, sem signals intermediários ──
  // Mesmo padrão do projeto antigo, mas com lookup dinâmico em vez de IDs hardcoded.
  private get turmaType(): string {
    const t = this.dataService.getTurmaData(this.turmaId);
    if (!t) return '';
    if (t.type) return t.type.trim();
    // Fallback para dados antigos no localStorage sem campo 'type'
    if (t.engineType === 'metais-madeiras') {
      const inst = (t.instrument ?? '').trim().toUpperCase();
      return MADEIRAS_INSTRUMENTS.has(inst) ? 'Madeiras' : 'Metais';
    }
    return '';
  }

  private get turmaInstrument(): string {
    return (this.dataService.getTurmaData(this.turmaId)?.instrument ?? '').trim().toUpperCase();
  }

  get isMadeiras(): boolean {
    return this.turmaType === 'Madeiras' || MADEIRAS_INSTRUMENTS.has(this.turmaInstrument);
  }

  get isTrompeteFamily(): boolean {
    const inst = this.turmaInstrument;
    return inst !== '' && inst !== 'A DEFINIR' && TROMPETE_FAMILY.has(inst);
  }

  get availableTabs(): { key: Tab; label: string }[] {
    const tabs: { key: Tab; label: string }[] = [{ key: 'almeida-dias', label: 'Almeida Dias' }];
    if (this.isTrompeteFamily) { tabs.push({ key: 'rubank', label: 'Rubank' }, { key: 'clarks', label: "Clark's" }); }
    else if (this.isMadeiras)  { tabs.push({ key: 'rubank', label: 'Rubank' }); }
    return tabs;
  }

  get adPhases(): AdPhase[] {
    return this.isMadeiras ? AD_CLARINETE_PHASES : AD_TROMPETE_PHASES;
  }
  get adPhaseSuggestions(): string[] { return this.adPhases.map(p => p.label); }

  get rbLessons(): RbLesson[] {
    return this.isMadeiras ? RB_CLARINETE : RB_TROMPETE;
  }
  get rbLessonSuggestions(): string[] { return this.rbLessons.map(l => l.label); }

  clarksSuggestions = CLARKS_SUGGESTIONS;

  entries = signal<HistoryEntry[]>([]);
  tab = signal<Tab>('almeida-dias');
  existingSources = computed(() => this.entries().map(e => e.source));

  // ── Almeida Dias state ──
  adPhase = signal<string | null>(null);
  adSelectedPhase = computed(() => this.adPhases.find(p => p.label === this.adPhase()) ?? null);

  fieldLessons: Record<string, Set<string>> = {};
  fieldStatuses: Record<string, StatusLevel | null> = {};
  fieldObs: Record<string, string> = {};

  private fKey(phase: string, field: string): string { return `${phase}||${field}`; }

  getFieldLessons(phase: string, field: string): Set<string> {
    return this.fieldLessons[this.fKey(phase, field)] ?? new Set();
  }
  getFieldStatus(phase: string, field: string): StatusLevel | null {
    return this.fieldStatuses[this.fKey(phase, field)] ?? null;
  }
  getFieldObs(phase: string, field: string): string {
    return this.fieldObs[this.fKey(phase, field)] ?? '';
  }
  setFieldStatus(phase: string, field: string, st: StatusLevel): void {
    this.fieldStatuses[this.fKey(phase, field)] = st;
  }
  setFieldObs(phase: string, field: string, obs: string): void {
    this.fieldObs[this.fKey(phase, field)] = obs;
  }

  isFieldLessonSelected(phase: string, field: string, lesson: string): boolean {
    return this.getFieldLessons(phase, field).has(lesson);
  }

  isFieldLessonBlocked(phase: string, field: string, lesson: string): boolean {
    const prefix = `Almeida Dias ${phase} ${field} `;
    return this.existingSources().some(src => src.startsWith(prefix) && src.includes(`[${lesson}]`));
  }

  toggleFieldLesson(phase: string, field: string, lesson: string): void {
    const key = this.fKey(phase, field);
    const cur = this.fieldLessons[key] ?? new Set<string>();
    const next = new Set(cur);
    next.has(lesson) ? next.delete(lesson) : next.add(lesson);
    this.fieldLessons[key] = next;
  }

  canAddField(phase: string, field: string): boolean {
    return this.getFieldLessons(phase, field).size > 0 && this.getFieldStatus(phase, field) !== null
      && this.getFieldObs(phase, field).trim().length > 0;
  }

  addFieldEntry(phase: string, field: SubField): void {
    const lessons = this.getFieldLessons(phase, field.name);
    const status = this.getFieldStatus(phase, field.name);
    if (lessons.size === 0 || !status) return;
    // preserve original order
    const sorted = field.lessons.filter(l => lessons.has(l));
    const lessonsStr = sorted.map(l => `[${l}]`).join(' ');
    const source = `Almeida Dias ${phase} ${field.name} ${lessonsStr}`;
    const obs = this.getFieldObs(phase, field.name);
    const cleanObs = (obs.trim() === 'Não houve' || obs.trim() === 'Nao houve') ? '' : obs;
    this.entries.update(prev => [...prev, { source, status, observation: cleanObs || undefined }]);
    const key = this.fKey(phase, field.name);
    this.fieldLessons[key] = new Set();
    this.fieldStatuses[key] = null;
    this.fieldObs[key] = '';
    this.entriesChange.emit(this.entries());
  }

  // ── Rubank state ──
  rbPhase    = signal<string | null>(null);
  rbSelected = signal<Set<string>>(new Set());
  rbStatus   = signal<StatusLevel | null>(null);
  rbObs      = signal('');

  rbSelectedLesson = computed(() => this.rbLessons.find(l => l.label === this.rbPhase()) ?? null);

  isRbLessonBlocked(lesson: string): boolean {
    const phase = this.rbPhase();
    if (!phase) return false;
    return this.existingSources().some(src => src.startsWith(`Rubank ${phase} `) && src.includes(`[${lesson}]`));
  }

  toggleRbLesson(l: string): void {
    this.rbSelected.update(prev => {
      const next = new Set(prev);
      next.has(l) ? next.delete(l) : next.add(l);
      return next;
    });
  }

  canAddRb(): boolean { return this.rbSelected().size > 0 && this.rbStatus() !== null && this.rbObs().trim().length > 0; }

  addRbEntry(): void {
    const phase = this.rbPhase(), st = this.rbStatus();
    const lesson = this.rbSelectedLesson();
    if (!phase || !st || !lesson || this.rbSelected().size === 0) return;
    const sorted = lesson.lessons.filter(l => this.rbSelected().has(l));
    const source = `Rubank ${phase} ${sorted.map(l => `[${l}]`).join(' ')}`;
    const rbObsClean = (this.rbObs().trim() === 'Não houve' || this.rbObs().trim() === 'Nao houve') ? '' : this.rbObs();
    this.entries.update(prev => [...prev, { source, status: st, observation: rbObsClean || undefined }]);
    this.rbPhase.set(null); this.rbSelected.set(new Set()); this.rbStatus.set(null); this.rbObs.set('');
    this.entriesChange.emit(this.entries());
  }

  // ── Clark's state ──
  clarksSelected = signal<string | null>(null);
  clarksStatus   = signal<StatusLevel | null>(null);
  clarksObs      = signal('');

  clarksBlocked = computed(() =>
    this.existingSources().filter(s => s.startsWith("Clarks ")).map(s => s.replace("Clarks ", ''))
  );
  canAddClarks = computed(() => this.clarksSelected() !== null && this.clarksStatus() !== null && this.clarksObs().trim().length > 0);

  addClarks(): void {
    const sel = this.clarksSelected(), st = this.clarksStatus();
    if (!sel || !st || !this.clarksObs().trim()) return;
    const source = `Clarks ${sel}`;
    if (this.existingSources().includes(source)) return;
    const clarksObsClean = (this.clarksObs().trim() === 'Não houve' || this.clarksObs().trim() === 'Nao houve') ? '' : this.clarksObs().trim();
    this.entries.update(prev => [...prev, { source, status: st, observation: clarksObsClean || undefined }]);
    this.clarksSelected.set(null); this.clarksStatus.set(null); this.clarksObs.set('');
    this.entriesChange.emit(this.entries());
  }

  handleEditAt(e: { index: number; entry: HistoryEntry }): void {
    this.entries.update(prev => prev.map((en, i) => i === e.index ? e.entry : en));
    this.entriesChange.emit(this.entries());
  }

  constructor() {
    effect(() => {
      const phase = this.adSelectedPhase();
      if (!phase) return;
      for (const field of phase.fields) {
        this.autoSelectIfSingle(phase.label, field);
      }
    }, { allowSignalWrites: true });
  }

  // ── Lifecycle ──
  ngOnInit(): void {
    this.entries.set([...this.initialEntries]);
  }

  // Auto-selects field lesson if only one option exists and it's not blocked
  autoSelectIfSingle(phase: string, field: SubField): void {
    if (field.lessons.length === 1 && !this.isFieldLessonBlocked(phase, field.name, field.lessons[0])) {
      const key = this.fKey(phase, field.name);
      const cur = this.fieldLessons[key] ?? new Set<string>();
      if (!cur.has(field.lessons[0])) {
        this.fieldLessons[key] = new Set([field.lessons[0]]);
      }
    }
  }

  // ── Template event handlers ──
  onRbPhaseConfirmed(v: string): void {
    this.rbPhase.set(v);
    this.rbStatus.set(null);
    // Auto-select if only one lesson and none blocked
    const lesson = this.rbLessons.find(l => l.label === v);
    if (lesson && lesson.lessons.length === 1 && !this.isRbLessonBlocked(lesson.lessons[0])) {
      this.rbSelected.set(new Set([lesson.lessons[0]]));
    } else {
      this.rbSelected.set(new Set());
    }
  }
  onRbPhaseCleared(): void { this.rbPhase.set(null); this.rbSelected.set(new Set()); this.rbStatus.set(null); }

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