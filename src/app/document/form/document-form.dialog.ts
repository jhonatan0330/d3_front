import { MatDialogConfig } from '@angular/material/dialog';
import { PedidoVentaDTO } from 'app/document/document.types';

export interface DocumentFormDialogOptions {
  close2Save?: boolean;
  identificador?: string | null;
  saveInField?: boolean;
  openQuickTransitionAfterSave?: string | null;
}

export function documentFormDialogConfig(
  data: PedidoVentaDTO,
  options: DocumentFormDialogOptions = {}
): MatDialogConfig {
  return {
    maxHeight: '100vh',
    maxWidth: '98vw',
    disableClose: true,
    data: {
      data,
      close2Save: false,
      identificador: null,
      saveInField: false,
      openQuickTransitionAfterSave: null,
      ...options,
    },
  };
}
