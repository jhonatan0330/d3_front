import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BuscadorComponent } from 'app/authorization/profile/buscador';

@Component({
    selector: 'app-search-pop-button',
    template: `
    <button mat-icon-button (click)="openDashboard()" matTooltip="Ir al inicio">
        <mat-icon svgIcon="home"></mat-icon>
    </button>
    `
})
export class SearchPopButtonComponent {

    private dialog = inject(MatDialog);

     openDashboard() {
    this.dialog.open(BuscadorComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '1200px',
      panelClass: 'dashboard-dialog-panel',
    });
  }
}