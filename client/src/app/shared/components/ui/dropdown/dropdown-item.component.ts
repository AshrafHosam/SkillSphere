import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dropdown-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<button type="button" [ngClass]="className" (click)="handleClick($event)"><ng-content></ng-content></button>`
})
export class DropdownItemComponent {
  @Input() className = '';
  @Output() itemClick = new EventEmitter<void>();

  handleClick(event: Event) {
    event.preventDefault();
    this.itemClick.emit();
  }
}
