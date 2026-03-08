// =============================================
// FreeTextEngine - Lined notebook textarea + save
// Angular 19 Standalone - single file
// =============================================

import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-free-text-engine',
  standalone: true,
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="position: relative; overflow: hidden; border-radius: 0.75rem; border: 2px dashed var(--board-border); background: var(--card); transition: border-color 0.2s;"
        [style.border-color]="focused ? 'rgba(94,196,160,0.6)' : 'var(--board-border)'"
      >
        <!-- Ruled lines -->
        <div
          style="position: absolute; inset: 0; opacity: 0.06; pointer-events: none;"
          [style.background-image]="'repeating-linear-gradient(0deg, transparent, transparent 31px, currentColor 31px, currentColor 32px)'"
          [style.background-position]="'0 12px'"
        ></div>
        <textarea
          [value]="text()"
          (input)="text.set(asTextarea($event).value)"
          (focus)="focused = true"
          (blur)="focused = false"
          placeholder="Registre aqui, com o máximo de detalhes, o que foi trabalhado na aula, dificuldades encontradas e o que precisa ser desenvolvido"
          rows="5"
          class="font-chalk"
          style="position: relative; z-index: 1; width: 100%; resize: none; background: transparent; padding: 1rem 1.25rem; font-size: 1rem; line-height: 2; color: var(--foreground); border: none; outline: none;"
        ></textarea>
      </div>
      <button
        type="button"
        [disabled]="!text().trim()"
        (click)="handleSave()"
        [style.border-color]="text().trim() ? 'rgba(94,196,160,0.6)' : 'rgba(58,56,53,0.4)'"
        [style.color]="text().trim() ? 'rgb(94,196,160)' : 'rgba(138,135,128,0.4)'"
        [style.cursor]="text().trim() ? 'pointer' : 'not-allowed'"
        style="display: flex; width: 100%; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 2px dashed; padding: 1rem 1.5rem; font-size: 1.25rem; font-weight: 700; transition: all 0.2s; background: transparent;"
        class="font-chalk"
      >SALVAR</button>
    </div>
  `,
})
export class FreeTextEngineComponent implements OnInit, OnChanges {
  @Input() initial = '';
  @Input() studentName = ''; // optional: used to reset state on student change
  @Output() save = new EventEmitter<string>();

  text = signal('');
  focused = false;

  ngOnInit(): void {
    this.text.set(this.initial);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset text when the student changes (individual mode)
    if (changes['studentName'] && !changes['studentName'].firstChange) {
      this.text.set(this.initial ?? '');
    }
    // Also reset when initial changes alongside student
    if (changes['initial'] && !changes['initial'].firstChange && changes['studentName']) {
      this.text.set(changes['initial'].currentValue ?? '');
    }
  }

  handleSave(): void {
    this.save.emit(this.text());
  }

  asTextarea(e: Event): HTMLTextAreaElement { return e.target as HTMLTextAreaElement; }
}
