// =============================================
// StatusSelector - Estudar / Regular / Bom radio-circle selector
// Angular 19 Standalone - single file with inline template+styles
// =============================================

import { Component, Input, Output, EventEmitter } from '@angular/core';

export type StatusLevel = 'estudar' | 'regular' | 'bom';

export const STATUS_LABELS: Record<StatusLevel, string> = {
  estudar: 'Estudar',
  regular: 'Regular',
  bom: 'Bom',
};

export const RAW_COLORS: Record<StatusLevel, string> = {
  estudar: 'rgb(220, 70, 70)',
  regular: 'rgb(230, 160, 50)',
  bom: 'rgb(60, 185, 80)',
};

@Component({
  selector: 'app-status-selector',
  standalone: true,
  template: `
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <span class="font-chalk" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground);">
        Selecione o STATUS do desempenho
      </span>
      <div style="display: flex; align-items: center; gap: 1rem;">
        @for (s of statuses; track s) {
          <button
            type="button"
            (click)="select(s)"
            style="display: flex; flex-direction: column; align-items: center; gap: 0.375rem; background: none; border: none; cursor: pointer; padding: 0;"
          >
            <div
              [style.width.rem]="2.5"
              [style.height.rem]="2.5"
              [style.border-radius]="'50%'"
              [style.border]="value === s ? '2px solid ' + getColor(s) : '2px dashed var(--board-border)'"
              [style.background]="value === s ? getColor(s) + '33' : 'transparent'"
              [style.box-shadow]="value === s ? '0 0 12px ' + getColor(s) + '40' : 'none'"
              [style.display]="'flex'"
              [style.align-items]="'center'"
              [style.justify-content]="'center'"
              [style.transition]="'all 0.2s'"
            >
              @if (value === s) {
                <div
                  [style.width.rem]="1"
                  [style.height.rem]="1"
                  [style.border-radius]="'50%'"
                  [style.background]="getColor(s)"
                ></div>
              }
            </div>
            <span
              class="font-chalk"
              [style.font-size.rem]="0.75"
              [style.font-weight]="700"
              [style.color]="value === s ? getColor(s) : 'var(--muted-foreground)'"
            >
              {{ getLabel(s) }}
            </span>
          </button>
        }
      </div>
    </div>
  `,
})
export class StatusSelectorComponent {
  @Input() value: StatusLevel | null = null;
  @Output() statusChange = new EventEmitter<StatusLevel>();

  statuses: StatusLevel[] = ['estudar', 'regular', 'bom'];

  select(s: StatusLevel): void {
    this.statusChange.emit(s);
  }

  getColor(s: StatusLevel): string {
    return RAW_COLORS[s];
  }

  getLabel(s: StatusLevel): string {
    return STATUS_LABELS[s];
  }
}
