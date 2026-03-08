// =============================================
// EngineHinario - Hymn selection + voice toggle + status
// Angular 19 Standalone - single file
// =============================================

import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { AutocompleteInputComponent } from './autocomplete-input.component';
import { StatusSelectorComponent, StatusLevel } from './status-selector.component';
import { HistoryAccumulatorComponent, HistoryEntry } from './history-accumulator.component';

const HINARIO_SUGGESTIONS: string[] = [
  ...Array.from({ length: 480 }, (_, i) => String(i + 1)),
  'Coro 1', 'Coro 2', 'Coro 3', 'Coro 4', 'Coro 5', 'Coro 6',
];

type VoiceType = 'Principal' | 'Alternativa';

@Component({
  selector: 'app-engine-hinario',
  standalone: true,
  imports: [AutocompleteInputComponent, StatusSelectorComponent, HistoryAccumulatorComponent],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Hymn selection -->
      <div>
        <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
          Selecionar Hino
        </label>
        @if (!confirmedHymn()) {
          <app-autocomplete-input
            [suggestions]="suggestions"
            placeholder="Digite o número do hino ou Coro..."
            [blockedValues]="blockedHymns()"
            duplicateMessage="Este hino já foi adicionado."
            (confirmed)="onHymnConfirmed($event)"
          />
        }
        @if (confirmedHymn()) {
          <div style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(212,175,55,0.4); background: rgba(212,175,55,0.05); padding: 0.5rem 0.75rem;">
            <span class="font-chalk" style="flex: 1; font-size: 0.875rem; font-weight: 700; color: var(--primary);">
              Selecionado: {{ hymnLabel() }}
            </span>
            <button type="button" (click)="confirmedHymn.set(null)"
              style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0; display: flex; align-items: center;" title="Cancelar seleção">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        }
      </div>

      <!-- Voice + Status + Obs after confirmed -->
      @if (confirmedHymn()) {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Voice toggles -->
          <div>
            <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              Voz
            </label>
            <div style="display: flex; gap: 0.75rem;">
              @for (voice of voices; track voice) {
                <button
                  type="button"
                  (click)="toggleVoice(voice)"
                  [style.border-color]="hasVoice(voice) ? 'var(--color-present)' : 'var(--board-border)'"
                  [style.border-style]="hasVoice(voice) ? 'solid' : 'dashed'"
                  [style.background]="hasVoice(voice) ? 'var(--color-present-bg)' : 'transparent'"
                  [style.color]="hasVoice(voice) ? 'var(--color-present)' : 'var(--muted-foreground)'"
                  style="display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border-width: 2px; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.2s;"
                  class="font-chalk"
                >
                  <div
                    [style.border-color]="hasVoice(voice) ? 'var(--color-present)' : 'var(--board-border)'"
                    [style.background]="hasVoice(voice) ? 'var(--color-present)' : 'transparent'"
                    style="width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid; transition: all 0.2s;"
                  ></div>
                  {{ voice }}
                </button>
              }
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="font-chalk" style="display: block; margin-bottom: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
              Avaliação
            </label>
            <app-status-selector [value]="status()" (statusChange)="status.set($event)" />
          </div>

          <!-- Observation (obrigatória) -->
          <div style="position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card);">
            <textarea
              [value]="observation()"
              (input)="observation.set(asInput($event).value)"
              placeholder="Observação (obrigatório)..."
              rows="2"
              class="font-chalk"
              style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 0.5rem 0.75rem; padding-right: 6rem; font-size: 0.875rem; line-height: 1.75rem; color: var(--foreground); border: none; outline: none;"
            ></textarea>
            <button type="button" (click)="observation.set('Não houve')"
              style="position:absolute;right:0.375rem;top:50%;transform:translateY(-50%);font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
              Não houve
            </button>
          </div>
        </div>
      }

      <app-history-accumulator
        [entries]="[]"
        [addLabel]="'Adicionar Hino'"
        [addDisabled]="!canAdd()"
        (add)="handleAdd()"
      />

      <!-- History accumulator with label -->
      @if (entries().length > 0) {
        <div style="border-top: 1px solid var(--board-border); padding-top: 1rem; margin-top: 1rem;">
          <label class="font-chalk" style="display: block; margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 700; color: var(--foreground);">
            Registro do aluno na aula
          </label>
          <app-history-accumulator
            [entries]="entries()"
            addLabel=""
            [addDisabled]="true"
            [canRemoveLast]="entries().length > 0"
            (removeLast)="handleRemoveLast()"
            (removeAt)="handleRemoveAt($event)"
          />
        </div>
      }

      <!-- Save -->
      <button
        type="button"
        [disabled]="entries().length === 0"
        (click)="handleSave()"
        [style.border-color]="entries().length > 0 ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
        [style.color]="entries().length > 0 ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
        [style.cursor]="entries().length > 0 ? 'pointer' : 'not-allowed'"
        style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px dashed; padding: 1rem 1.5rem; font-size: 1.25rem; font-weight: 700; transition: all 0.2s; background: transparent;"
        class="font-chalk"
      >
        SALVAR
      </button>
    </div>
  `,
})
export class EngineHinarioComponent {
  @Input() initialEntries: HistoryEntry[] = [];
  @Output() save = new EventEmitter<HistoryEntry[]>();
  @Output() entriesChange = new EventEmitter<HistoryEntry[]>();

  suggestions = HINARIO_SUGGESTIONS;
  voices: VoiceType[] = ['Principal', 'Alternativa'];

  entries = signal<HistoryEntry[]>([]);
  confirmedHymn = signal<string | null>(null);
  selectedVoices = signal<Set<VoiceType>>(new Set());
  status = signal<StatusLevel | null>(null);
  observation = signal('');

  hymnLabel = computed(() => {
    const h = this.confirmedHymn();
    if (!h) return '';
    return /^\d+$/.test(h) ? `Hino ${h}` : h;
  });

  blockedHymns = computed(() =>
    this.entries().map(e => {
      const match = e.source.match(/^(?:Hino )?(.+?)(?: - .+)?$/);
      return match ? match[1] : e.source;
    })
  );

  canAdd = computed(() =>
    this.confirmedHymn() !== null &&
    this.selectedVoices().size > 0 &&
    this.status() !== null &&
    this.observation().trim().length > 0
  );

  ngOnInit(): void {
    this.entries.set([...this.initialEntries]);
  }

  onHymnConfirmed(val: string): void {
    this.confirmedHymn.set(val);
  }

  hasVoice(v: VoiceType): boolean {
    return this.selectedVoices().has(v);
  }

  toggleVoice(v: VoiceType): void {
    this.selectedVoices.update(prev => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  handleAdd(): void {
    const hymn = this.confirmedHymn();
    const st = this.status();
    if (!hymn || !st || this.selectedVoices().size === 0) return;
    const voiceStr = Array.from(this.selectedVoices()).join('/');
    const label = /^\d+$/.test(hymn) ? `Hino ${hymn}` : hymn;
    this.entries.update(prev => [...prev, {
      source: `${label} - ${voiceStr}`,
      status: st,
      observation: this.observation() || undefined,
    }]);
    this.confirmedHymn.set(null);
    this.selectedVoices.set(new Set());
    this.status.set(null);
    this.observation.set('');
    this.entriesChange.emit(this.entries());
  }

  handleRemoveLast(): void {
    this.entries.update(prev => prev.slice(0, -1));
    this.entriesChange.emit(this.entries());
  }

  handleRemoveAt(index: number): void {
    this.entries.update(prev => prev.filter((_, i) => i !== index));
    this.entriesChange.emit(this.entries());
  }

  handleSave(): void {
    this.save.emit(this.entries());
  }

  asInput(e: Event): HTMLInputElement { return e.target as HTMLInputElement; }
}