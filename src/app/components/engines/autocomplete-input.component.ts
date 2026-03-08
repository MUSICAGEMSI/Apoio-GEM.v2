// =============================================
// AutocompleteInput - Filterable dropdown with confirm chip
// Angular 19 Standalone - single file
// =============================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [],
  template: `
    <!-- Controlled mode: show confirmed chip -->
    @if (value) {
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="flex: 1; display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(212,175,55,0.4); background: rgba(212,175,55,0.05); padding: 0.625rem 0.75rem;">
          <span class="font-chalk" style="flex: 1; font-size: 0.875rem; font-weight: 700; color: var(--primary);">
            Selecionado: {{ value }}
          </span>
          @if (clearable) {
            <button
              type="button"
              (click)="handleClear()"
              style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0; display: flex; align-items: center; transition: opacity 0.2s;"
              title="Cancelar seleção"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          }
        </div>
      </div>
    } @else {
      <!-- Input mode -->
      <div style="position: relative;" #wrapper>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="position: relative; flex: 1;">
            <input
              #inputEl
              type="text"
              [value]="inputText()"
              [placeholder]="placeholder"
              (input)="onInputEvent($event)"
              (focus)="isOpen.set(true)"
              (keydown)="onKeyDown($event)"
              class="font-chalk"
              style="width: 100%; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card); padding: 0.625rem 2rem 0.625rem 0.75rem; font-size: 0.875rem; color: var(--foreground); outline: none; transition: border-color 0.2s;"
            />
            @if (inputText()) {
              <button
                type="button"
                (click)="clearInput()"
                style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(138,135,128,0.6); padding: 0;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            }
          </div>
          <button
            type="button"
            (click)="tryConfirm(inputText())"
            [disabled]="!inputText().trim()"
            [style.border-color]="inputText().trim() ? 'rgba(94,196,160,0.5)' : 'rgba(58,56,53,0.4)'"
            [style.background]="inputText().trim() ? 'rgba(94,196,160,0.1)' : 'transparent'"
            [style.color]="inputText().trim() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.3)'"
            [style.cursor]="inputText().trim() ? 'pointer' : 'not-allowed'"
            style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; flex-shrink: 0; border-radius: 0.5rem; border: 2px solid; transition: all 0.2s;"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </button>
        </div>

        <!-- Duplicate warning -->
        @if (duplicateWarning()) {
          <p class="font-chalk" style="margin-top: 0.25rem; font-size: 0.75rem; color: var(--destructive-foreground, rgb(220,70,70));">
            {{ duplicateMessage }}
          </p>
        }

        <!-- Dropdown -->
        @if (isOpen() && visibleItems().length > 0) {
          <div style="position: absolute; z-index: 50; margin-top: 0.25rem; width: 100%; border-radius: 0.5rem; border: 1px solid var(--board-border); background: var(--card); box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <ul style="max-height: 16rem; overflow-y: auto; padding: 0.25rem 0; margin: 0; list-style: none;">
              @for (item of visibleItems(); track item; let i = $index) {
                <li>
                  <button
                    type="button"
                    (mousedown)="onItemMouseDown($event, item)"
                    class="font-chalk"
                    [style.background]="i === highlightIdx() ? 'rgba(212,175,55,0.1)' : 'transparent'"
                    style="width: 100%; text-align: left; padding: 0.375rem 0.75rem; font-size: 0.875rem; color: var(--foreground); border: none; cursor: pointer; transition: background 0.15s;"
                  >
                    {{ item }}
                  </button>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    input:focus { border-color: rgba(212,175,55,0.5) !important; }
    input::placeholder { color: rgba(138,135,128,0.6); }
  `],
  host: {
    '(document:mousedown)': 'onDocumentClick($event)',
  },
})
export class AutocompleteInputComponent implements OnDestroy {
  @Input() suggestions: string[] = [];
  @Input() placeholder = 'Digite ou selecione...';
  @Input() blockedValues: string[] = [];
  @Input() duplicateMessage = 'Já adicionado.';
  @Input() value: string | null = null; // controlled confirmed value
  @Input() clearable = true;

  @Output() confirmed = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  @ViewChild('wrapper') wrapperRef!: ElementRef;
  @ViewChild('inputEl') inputElRef!: ElementRef;

  inputText = signal('');
  isOpen = signal(false);
  highlightIdx = signal(-1);
  duplicateWarning = signal(false);

  private duplicateTimeout: ReturnType<typeof setTimeout> | null = null;

  visibleItems = computed(() => {
    const q = this.inputText().trim().toLowerCase();
    const blocked = this.blockedValues;
    let filtered: string[];
    if (q) {
      // Filtro estrito: apenas itens que contenham o texto digitado
      const startsWith = this.suggestions.filter(
        s => s.toLowerCase().startsWith(q) && !blocked.includes(s)
      );
      const contains = this.suggestions.filter(
        s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q) && !blocked.includes(s)
      );
      filtered = [...startsWith, ...contains];
    } else {
      // Se não há texto, mostra todos (exceto bloqueados)
      filtered = this.suggestions.filter(s => !blocked.includes(s));
    }
    return filtered.slice(0, 60);
  });

  ngOnDestroy(): void {
    if (this.duplicateTimeout) clearTimeout(this.duplicateTimeout);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.wrapperRef && !this.wrapperRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  onInputEvent(e: Event): void {
    this.inputText.set((e.target as HTMLInputElement).value);
    this.isOpen.set(true);
    this.highlightIdx.set(-1);
    this.duplicateWarning.set(false);
  }

  onInputChange(): void {
    this.isOpen.set(true);
    this.highlightIdx.set(-1);
    this.duplicateWarning.set(false);
  }

  clearInput(): void {
    this.inputText.set('');
    this.duplicateWarning.set(false);
    this.inputElRef?.nativeElement?.focus();
  }

  // Use mousedown to prevent blur closing dropdown before click registers
  onItemMouseDown(event: MouseEvent, item: string): void {
    event.preventDefault();
    this.tryConfirm(item);
  }

  tryConfirm(val: string): void {
    const trimmed = val.trim();
    if (!trimmed) return;
    // Only accept values from the suggestions list
    if (this.suggestions.length > 0 && !this.suggestions.includes(trimmed)) {
      return;
    }
    if (this.blockedValues.includes(trimmed)) {
      this.duplicateWarning.set(true);
      if (this.duplicateTimeout) clearTimeout(this.duplicateTimeout);
      this.duplicateTimeout = setTimeout(() => this.duplicateWarning.set(false), 2000);
      return;
    }
    this.confirmed.emit(trimmed);
    this.inputText.set('');
    this.isOpen.set(false);
    this.highlightIdx.set(-1);
  }

  handleClear(): void {
    this.cleared.emit();
  }

  onKeyDown(e: KeyboardEvent): void {
    const items = this.visibleItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.isOpen.set(true);
      this.highlightIdx.update(v => Math.min(v + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightIdx.update(v => Math.max(v - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = this.highlightIdx();
      if (idx >= 0 && items[idx]) {
        this.tryConfirm(items[idx]);
      } else if (items.length === 1) {
        this.tryConfirm(items[0]);
      }
    } else if (e.key === 'Escape') {
      this.isOpen.set(false);
    }
  }
}
