import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { PropiedadDTO } from 'app/shared/shared.domain';

@Component({
  selector: 'app-document-action-menu',
  standalone: true,
  templateUrl: './document-action-menu.component.html',
  imports: [DropdownComponent, DropdownItemComponent, MatIcon, TitleCasePipe],
})
export class DocumentActionMenuComponent {
  @Input() acciones: PropiedadDTO[] | null = null;
  @Input() disabled = false;
  @Input() variant: 'icon' | 'button' = 'icon';
  @Input() buttonClass = 'btn-icon';
  @Input() buttonIcon = 'add_circle';
  @Input() ariaLabel = 'Crear documento';

  @Output() actionSelected = new EventEmitter<PropiedadDTO>();

  get visibleActions(): PropiedadDTO[] {
    return this.acciones ?? [];
  }

  getTriggerClass(): string {
    return this.variant === 'button' ? this.buttonClass || 'btn-flat-accent' : this.buttonClass || 'btn-icon';
  }

  getActionLabel(item: PropiedadDTO): string {
    const text = item?.texto?.trim() || item?.valor || 'documento';
    return `Crear ${text}`;
  }

  onActionSelected(item: PropiedadDTO): void {
    this.actionSelected.emit(item);
  }
}
