import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationCenterService {

  info(title: string, text?: string) {
    Swal.fire({ title, text, icon: 'info', confirmButtonText: 'Aceptar' });
  }

  success(title: string, text?: string) {
    Swal.fire({ title, text, icon: 'success', confirmButtonText: 'Aceptar' });
  }

  warn(title: string, text?: string) {
    Swal.fire({ title, text, icon: 'warning', confirmButtonText: 'Aceptar' });
  }

  error(title: string, text?: string) {
    Swal.fire({ title, text, icon: 'error', confirmButtonText: 'Aceptar' });
  }

  // Confirm dialog that resolves to true/false
  confirm(title: string, text?: string): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then(result => !!result.isConfirmed);
  }

  // Specialized notification for date events; can be changed to return a Promise if needed
  notifyDate(received: Date) {
    const text = `Se recibió la fecha ${received.toLocaleString()}.`;
    this.info('Fecha recibida', text);
  }

  // Forward any swal options directly and return the promise
  fire(options: any): Promise<any> {
    return Swal.fire(options);
  }

  // Simple toast helper (uses Swal's toast mode)
  toast(title: string, text?: string, opts: any = {}) {
    const options = Object.assign({
      toast: true,
      position: opts.position || 'top-end',
      showConfirmButton: false,
      timer: opts.timer || 3000,
      icon: opts.icon || 'info',
      title,
      text
    }, opts);
    Swal.fire(options);
  }

}
