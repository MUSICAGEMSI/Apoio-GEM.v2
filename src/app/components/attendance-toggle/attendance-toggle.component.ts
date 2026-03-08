// =============================================
// AttendanceToggle - F/P toggle preserving partial state
// =============================================

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-attendance-toggle',
  standalone: true,
  template: `
    <div class="toggle-group">
      <button
        class="toggle-btn"
        [class.absent]="value === false"
        (click)="toggle(false)"
        [attr.aria-label]="'Marcar falta'"
      >F</button>
      <button
        class="toggle-btn"
        [class.present]="value === true"
        (click)="toggle(true)"
        [attr.aria-label]="'Marcar presente'"
      >P</button>
    </div>
  `,
})
export class AttendanceToggleComponent implements OnInit {
  @Input() defaultValue: boolean | null = null;
  @Output() attendanceChange = new EventEmitter<boolean>();

  value: boolean | null = null;

  ngOnInit(): void {
    this.value = this.defaultValue;
  }

  toggle(present: boolean): void {
    this.value = present;
    this.attendanceChange.emit(present);
  }
}
