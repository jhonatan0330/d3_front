// file-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { VisorPdfDialogComponent } from './components/visor-pdf-dialog/visor-pdf-dialog.component';


@Injectable({ providedIn: 'root' })
export class FileHandlerService {

  constructor(private dialog: MatDialog) {}

  handleResponse(response: HttpResponse<Blob>) {
    const contentType = response.headers.get('Content-Type') || '';
    const blob = response.body!;

    const filename = this.getFileName(response) || this.getDefaultName(contentType);

    if (this.isPdf(contentType)) {
      this.openPdf(blob);
    } else {
      this.downloadFile(blob, filename);
    }
  }

  // ========================
  // 🧠 Helpers
  // ========================

  private isPdf(contentType: string): boolean {
    return contentType.includes('application/pdf');
  }

  private isExcel(contentType: string): boolean {
    return contentType.includes('spreadsheet') ||
           contentType.includes('excel');
  }

  private getFileName(response: HttpResponse<Blob>): string | null {
    const disposition = response.headers.get('Content-Disposition');

    if (!disposition) return null;

    const match = disposition.match(/filename="?(.+?)"?$/);
    return match ? match[1] : null;
  }

  private getDefaultName(contentType: string): string {
    if (this.isPdf(contentType)) return 'reporte.pdf';
    if (this.isExcel(contentType)) return 'reporte.xlsx';
    return 'archivo';
  }

  // ========================
  // 📄 Acciones
  // ========================

  private openPdf(blob: Blob) {
    this.dialog.open(VisorPdfDialogComponent, {
      width: '80%',
      height: '90%',
      data: { blob }
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}
