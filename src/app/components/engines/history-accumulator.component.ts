import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

export interface HistoryEntry {
  source: string;
  status?: 'estudar' | 'regular' | 'bom';
  observation?: string;
  method?: string;
}

const STATUS_LABELS: Record<string, string> = {
  estudar: 'Estudar',
  regular: 'Regular',
  bom: 'Bom',
};

const STATUS_COLORS: Record<string, string> = {
  estudar: 'rgb(220,70,70)',
  regular: 'rgb(230,160,50)',
  bom: 'rgb(60,185,80)',
};

const METHOD_ORDER = ['Sacro', 'Suzuki', 'Almeida Dias', 'Rubank', "Clark's", 'Clarks', 'MSA', 'Apostila'];

function getMethodPrefix(source: string): string {
  for (const m of METHOD_ORDER) { if (source.startsWith(m)) return m; }
  return source.split(' ')[0] ?? source;
}

function sortEntries(entries: HistoryEntry[]): HistoryEntry[] {
  const methodOrder: string[] = [];
  for (const e of entries) { const m = getMethodPrefix(e.source); if (!methodOrder.includes(m)) methodOrder.push(m); }
  return [...entries].sort((a, b) => {
    const ia = methodOrder.indexOf(getMethodPrefix(a.source));
    const ib = methodOrder.indexOf(getMethodPrefix(b.source));
    if (ia !== ib) return ia - ib;
    return entries.indexOf(a) - entries.indexOf(b);
  });
}

export function isEntryDuplicate(a: HistoryEntry, b: HistoryEntry): boolean {
  return a.source === b.source && a.status === b.status && (a.observation ?? '') === (b.observation ?? '');
}

export function addEntryNoDuplicate(entries: HistoryEntry[], newEntry: HistoryEntry): HistoryEntry[] {
  if (entries.length > 0 && isEntryDuplicate(entries[entries.length - 1], newEntry)) return entries;
  return [...entries, newEntry];
}

@Component({
  selector: 'app-history-accumulator',
  standalone: true,
  styles: [`
    @keyframes editPop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
    .edit-btn:active { animation: editPop 0.2s ease; }
  `],
  template: `
    <!-- Edit modal overlay -->
    @if (editingIndex() !== null) {
      <div style="position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);padding:1rem;"
           (click)="closeEdit()">
        <div style="width:100%;max-width:22rem;border-radius:0.875rem;border:2px solid var(--board-border);background:var(--card);padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;"
             (click)="$event.stopPropagation()">
          <p class="font-chalk" style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">
            Editar registro
          </p>
          <p class="font-chalk" style="font-size:0.8rem;color:var(--foreground);border:1px dashed var(--board-border);border-radius:0.5rem;padding:0.5rem 0.75rem;">
            {{ editSource() }}
          </p>
          <!-- Status buttons -->
          <div style="display:flex;gap:0.5rem;">
            @for (s of statusOptions; track s.value) {
              <button type="button" (click)="editStatus.set(s.value)"
                [style.border-color]="editStatus() === s.value ? s.color : 'var(--board-border)'"
                [style.border-style]="editStatus() === s.value ? 'solid' : 'dashed'"
                [style.color]="editStatus() === s.value ? s.color : 'var(--muted-foreground)'"
                [style.background]="editStatus() === s.value ? s.bg : 'transparent'"
                style="flex:1;border-radius:0.5rem;border-width:2px;padding:0.5rem 0.25rem;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.2s;"
                class="font-chalk">{{ s.label }}</button>
            }
          </div>
          <!-- Observation -->
          <div style="position:relative;border-radius:0.5rem;border:1px solid var(--board-border);background:var(--muted);overflow:hidden;">
            <textarea [value]="editObs()" (input)="editObs.set(asInput($event).value)"
              placeholder="Observação..." rows="2" class="font-chalk"
              style="width:100%;resize:none;background:transparent;padding:0.375rem 0.75rem;padding-right:5.5rem;font-size:0.75rem;line-height:1.75rem;color:var(--foreground);border:none;outline:none;"></textarea>
            <button type="button" (click)="editObs.set('Não houve')"
              style="position:absolute;right:0.375rem;top:50%;transform:translateY(-50%);font-family:var(--font-chalk);font-size:0.65rem;font-weight:700;color:var(--muted-foreground);background:var(--card);border:1px dashed var(--board-border);border-radius:0.375rem;padding:0.2rem 0.4rem;cursor:pointer;white-space:nowrap;">
              Não houve
            </button>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button type="button" (click)="closeEdit()" class="font-chalk"
              style="flex:1;padding:0.625rem;border-radius:0.5rem;border:2px solid rgba(220,70,70,0.5);color:rgb(220,70,70);background:transparent;font-size:0.8rem;font-weight:700;cursor:pointer;">
              Cancelar
            </button>
            <button type="button" (click)="confirmEdit()" [disabled]="!editObs()" class="font-chalk"
              [style.border-color]="editObs() ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
              [style.color]="editObs() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
              [style.cursor]="editObs() ? 'pointer' : 'not-allowed'"
              style="flex:1;padding:0.625rem;border-radius:0.5rem;border:2px solid;background:transparent;font-size:0.8rem;font-weight:700;transition:all 0.2s;">
              Salvar
            </button>
          </div>
        </div>
      </div>
    }

    @if (entries.length > 0) {
      <div style="border-radius:0.75rem;border:1px solid var(--board-border);background:var(--card);padding:1rem;">
        @for (entry of sortedEntries(); track $index; let i = $index; let isLast = $last) {
          <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.25rem 0;">
            <span class="font-chalk" style="flex-shrink:0;font-size:0.75rem;color:var(--muted-foreground);">{{ i + 1 }}.</span>
            <span class="font-chalk" style="flex:1;font-size:0.875rem;line-height:1.6;color:var(--foreground);">
              {{ formatEntry(entry) }}{{ isLast ? '.' : ';' }}
            </span>
            <!-- Edit button -->
            <button type="button" (click)="openEdit(indexOf(entry))" title="Editar" class="edit-btn"
              style="flex-shrink:0;background:none;border:none;cursor:pointer;color:var(--muted-foreground);opacity:0.7;padding:0.125rem;display:flex;align-items:center;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <!-- Remove button -->
            <button type="button" (click)="removeAt.emit(indexOf(entry))" title="Remover"
              style="flex-shrink:0;background:none;border:none;cursor:pointer;color:var(--color-absent);opacity:0.7;padding:0.125rem;display:flex;align-items:center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        }
      </div>
    }

    @if (addLabel) {
      <button type="button" [disabled]="addDisabled" (click)="add.emit()"
        [style.border-color]="addDisabled ? 'rgba(58,56,53,0.4)' : 'rgba(94,196,160,0.4)'"
        [style.color]="addDisabled ? 'rgba(138,135,128,0.4)' : 'rgb(94,196,160)'"
        [style.cursor]="addDisabled ? 'not-allowed' : 'pointer'"
        style="display:flex;width:100%;align-items:center;justify-content:center;gap:0.5rem;border-radius:0.75rem;border:2px dashed;padding:0.75rem 1rem;transition:all 0.2s;background:transparent;"
        class="font-chalk">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        {{ addLabel }}
      </button>
    }
  `,
})
export class HistoryAccumulatorComponent {
  @Input() entries: HistoryEntry[] = [];
  @Input() addLabel = 'Adicionar';
  @Input() addDisabled = false;
  @Input() canRemoveLast = false;

  @Output() add = new EventEmitter<void>();
  @Output() removeLast = new EventEmitter<void>();
  @Output() removeAt = new EventEmitter<number>();
  @Output() editAt = new EventEmitter<{ index: number; entry: HistoryEntry }>();

  // Edit modal state
  editingIndex = signal<number | null>(null);
  editSource = signal('');
  editStatus = signal<'estudar' | 'regular' | 'bom' | null>(null);
  editObs = signal('');

  statusOptions = [
    { value: 'estudar' as const, label: 'Estudar', color: 'rgb(220,70,70)', bg: 'rgba(220,70,70,0.1)' },
    { value: 'regular' as const, label: 'Regular', color: 'rgb(230,160,50)', bg: 'rgba(230,160,50,0.1)' },
    { value: 'bom'     as const, label: 'Bom',     color: 'rgb(60,185,80)',  bg: 'rgba(60,185,80,0.1)'  },
  ];

  openEdit(idx: number): void {
    const entry = this.entries[idx];
    if (!entry) return;
    this.editingIndex.set(idx);
    this.editSource.set(entry.source);
    this.editStatus.set(entry.status ?? null);
    this.editObs.set(entry.observation ?? '');
  }

  closeEdit(): void { this.editingIndex.set(null); }

  confirmEdit(): void {
    const idx = this.editingIndex();
    if (idx === null) return;
    const updated: HistoryEntry = {
      ...this.entries[idx],
      status: this.editStatus() ?? this.entries[idx].status,
      observation: this.editObs() || undefined,
    };
    this.editAt.emit({ index: idx, entry: updated });
    this.editingIndex.set(null);
  }

  sortedEntries(): HistoryEntry[] { return sortEntries(this.entries); }

  indexOf(entry: HistoryEntry): number { return this.entries.indexOf(entry); }

  formatEntry(entry: HistoryEntry): string {
    let str = entry.source;
    if (entry.status) str += ` - ${STATUS_LABELS[entry.status] ?? entry.status}`;
    if (entry.observation?.trim()) str += ` (${entry.observation.trim()})`;
    return str;
  }

  asInput(e: Event): HTMLInputElement { return e.target as HTMLInputElement; }
}