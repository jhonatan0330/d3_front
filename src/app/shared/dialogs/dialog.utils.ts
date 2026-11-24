import { Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

export function closeOpenDialog<T>(dialog: MatDialog, component: Type<T>): void {
  dialog.openDialogs
    .filter(ref => ref.componentInstance instanceof component)
    .forEach(ref => ref.close());
}
