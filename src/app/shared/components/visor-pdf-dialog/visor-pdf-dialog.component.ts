import { Component, Inject, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer } from '@angular/platform-browser';

import { PdfService } from 'app/shared/pdf.service';


@Component({
    selector: 'app-visor-pdf-dialog',
    imports: [
    MatDialogModule,
    MatButtonModule
],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './visor-pdf-dialog.component.html'
})
export class VisorPdfDialogComponent implements OnDestroy {

  @ViewChild('iframe') iframe!: ElementRef;

  pdfUrl: any = null;
  loading = true;
  private objectUrl: string | null = null;

  constructor(
    private pdfService: PdfService,
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<VisorPdfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.cargarPdf();
  }

  cargarPdf() {
    this.pdfService.obtenerPdf(this.data?.params).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
        this.loading = false;
this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.orimi.com/pdf-test.pdf');  
        //setTimeout(() => this.imprimir(), 800);
      },
      error: (err) => {
        console.error('Error cargando PDF', err);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.orimi.com/pdf-test.pdf');  
        this.loading = false;
      }
    });
  }

  imprimir() {
    try {
      this.iframe?.nativeElement?.contentWindow?.focus();
      this.iframe?.nativeElement?.contentWindow?.print();
    } catch (e) {
      console.warn('Print bloqueado por el navegador');
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
}
