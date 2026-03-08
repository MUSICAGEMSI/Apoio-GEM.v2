import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { AutocompleteInputComponent } from './autocomplete-input.component';
import { StatusSelectorComponent, StatusLevel } from './status-selector.component';
import { HistoryAccumulatorComponent, HistoryEntry } from './history-accumulator.component';

// Item 10: updated scale list as specified
const ESCALA_SUGGESTIONS: string[] = [
  'Cromática',
  'Dó M + arpejo', 'Sol M + arpejo', 'Ré M + arpejo', 'Lá M + arpejo',
  'Mi M + arpejo', 'Si M + arpejo', 'Fá# M + arpejo', 'Dó# M + arpejo',
  'Fá M + arpejo', 'Sib M + arpejo', 'Mib M + arpejo', 'Láb M + arpejo',
  'Réb M + arpejo', 'Solb M + arpejo',
  'lá m (harmônica) + arpejo', 'mi m (harmônica) + arpejo', 'si m (harmônica) + arpejo',
  'fá# m (harmônica) + arpejo', 'dó# m (harmônica) + arpejo', 'sol# m (harmônica) + arpejo',
  'ré# m (harmônica) + arpejo', 'lá# m (harmônica) + arpejo',
  'ré m (harmônica) + arpejo', 'sol m (harmônica) + arpejo', 'dó m (harmônica) + arpejo',
  'fá m (harmônica) + arpejo', 'sib m (harmônica) + arpejo', 'mib m (harmônica) + arpejo',
];

@Component({
  selector: 'app-engine-escalas',
  standalone: true,
  imports: [AutocompleteInputComponent, StatusSelectorComponent, HistoryAccumulatorComponent],
  template: `
    <div style="display:flex;flex-direction:column;gap:1rem;">
      <div>
        <label class="font-chalk" style="display:block;margin-bottom:0.5rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
          Selecionar Escala
        </label>
        <app-autocomplete-input [suggestions]="suggestions" placeholder="Digite ou selecione a escala..."
          [blockedValues]="blockedScales()" duplicateMessage="Esta escala ja foi adicionada."
          [value]="confirmedScale()" (confirmed)="onScaleConfirmed($event)" (cleared)="confirmedScale.set(null)" />
      </div>

      @if (confirmedScale()) {
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <app-status-selector [value]="status()" (statusChange)="status.set($event)" />
          <!-- Obs required with "Não houve" button -->
          <div style="position:relative;overflow:hidden;border-radius:0.5rem;border:1px solid var(--board-border);background:var(--card);">
            <textarea [value]="observation()" (input)="observation.set(asInput($event).value)"
              placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido" rows="2" class="font-chalk"
              style="position:relative;z-index:1;width:100%;resize:none;background:transparent;padding:0.5rem 0.75rem;padding-right:6rem;font-size:0.875rem;line-height:1.75rem;color:var(--foreground);border:none;outline:none;"></textarea>
            <button type="button" (click)="observation.set('Não houve')"
              style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--muted);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.45rem;cursor:pointer;white-space:nowrap;z-index:2;">
              Não houve
            </button>
          </div>
        </div>
      }

      <app-history-accumulator [entries]="[]" addLabel="Adicionar Escala" [addDisabled]="!canAdd()"
        (add)="handleAdd()" />

      @if (entries().length > 0) {
        <div style="border-top:1px solid var(--board-border);padding-top:1rem;margin-top:1rem;">
          <label class="font-chalk" style="display:block;margin-bottom:0.75rem;font-size:0.875rem;font-weight:700;color:var(--foreground);">
            Registro do aluno na aula
          </label>
          <app-history-accumulator [entries]="entries()" addLabel="" [addDisabled]="true"
            [canRemoveLast]="entries().length > 0"
            (removeLast)="handleRemoveLast()" (removeAt)="handleRemoveAt($event)"
            (editAt)="handleEditAt($event)" />
        </div>
      }

      <button type="button" [disabled]="entries().length === 0" (click)="handleSave()"
        [style.border-color]="entries().length > 0 ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
        [style.color]="entries().length > 0 ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
        [style.cursor]="entries().length > 0 ? 'pointer' : 'not-allowed'"
        style="display:flex;width:100%;align-items:center;justify-content:center;gap:0.5rem;border-radius:0.75rem;border:2px dashed;padding:1rem 1.5rem;font-size:1.25rem;font-weight:700;transition:all 0.2s;background:transparent;"
        class="font-chalk">SALVAR</button>
    </div>
  `,
})
export class EngineEscalasComponent {
  @Input() initialEntries: HistoryEntry[] = [];
  @Output() save = new EventEmitter<HistoryEntry[]>();
  @Output() entriesChange = new EventEmitter<HistoryEntry[]>();

  suggestions = ESCALA_SUGGESTIONS;
  entries = signal<HistoryEntry[]>([]);
  confirmedScale = signal<string | null>(null);
  status = signal<StatusLevel | null>(null);
  observation = signal('');

  blockedScales = computed(() => this.entries().map(e => e.source));
  canAdd = computed(() => this.confirmedScale() !== null && this.status() !== null && this.observation().trim().length > 0);

  ngOnInit(): void { this.entries.set([...this.initialEntries]); }

  onScaleConfirmed(val: string): void { this.confirmedScale.set(val); }

  handleAdd(): void {
    const scale = this.confirmedScale(), st = this.status();
    if (!scale || !st || !this.observation().trim()) return;
    this.entries.update(prev => [...prev, { source: scale, status: st, observation: this.observation().trim() }]);
    this.confirmedScale.set(null); this.status.set(null); this.observation.set('');
    this.entriesChange.emit(this.entries());
  }

  handleRemoveLast(): void { this.entries.update(prev => prev.slice(0, -1)); this.entriesChange.emit(this.entries()); }
  handleRemoveAt(index: number): void { this.entries.update(prev => prev.filter((_, i) => i !== index)); this.entriesChange.emit(this.entries()); }
  handleEditAt(e: { index: number; entry: HistoryEntry }): void {
    this.entries.update(prev => prev.map((en, i) => i === e.index ? e.entry : en));
    this.entriesChange.emit(this.entries());
  }
  handleSave(): void { this.save.emit(this.entries()); }
  asInput(ev: Event): HTMLInputElement { return ev.target as HTMLInputElement; }
}