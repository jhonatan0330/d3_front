import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

interface Estado {
  id: string;
  nombre: string;
}

interface Transicion {
  from: string;
  to: string;
  nombre?: string;
}

@Component({
    selector: 'bpm-leaf-diagram',
    imports: [ ],
    templateUrl: './bpm-leaf-diagram.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./bpm-leaf-diagram.component.scss']
})
export class BpmLeafDiagramComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<BpmLeafDiagramComponent>>(MatDialogRef);
  private api = inject(ApiService);
  private utils = inject(UtilsService);

  procesoId: string;
  server: string | null = null;

  estados: Estado[] = [];
  transiciones: Transicion[] = [];

  // visual layout
  spacingX = 140;
  radius = 22;

  constructor() {
    const data = this.data;

    if (data) {
      this.procesoId = data.procesoId;
      this.server = data.server || null;
    }
  }

  ngOnInit(): void {
    if (!this.procesoId) return;
    // fetch latest version of the process (template) using API
    this.api.obtenerCampos(this.procesoId, this.server ?? '').subscribe({
      next: (tpl) => {
        // tpl.estados and tpl.transiciones expected
        const anyTpl: any = tpl as any;
        if (anyTpl && anyTpl.estados) {
          this.estados = anyTpl.estados.map((e: any) => ({ id: e.id || e.llave || e.codigo || e.nombre, nombre: e.nombre || e.id || e.llave || '' }));
        }
        if (anyTpl && anyTpl.transiciones) {
          this.transiciones = anyTpl.transiciones.map((t: any) => ({ from: t.from || t.origen || t.estadoOrigen, to: t.to || t.destino || t.estadoDestino, nombre: t.nombre || t.id }));
        }
      },
      error: () => {
        // fallback: try TemplateService local get (not implemented here)
      }
    });
  }

  // compute x position for a state index
  xFor(i: number) { return i * this.spacingX; }

  svgWidth() {
    const cnt = Math.max(0, this.estados.length - 1);
    return Math.max(400, cnt * this.spacingX + 200);
  }

  onStateClick(s: Estado, ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    // emit or close with selected state
    this.dialogRef.close({ selectedState: s });
  }

  onActionClick(t: Transicion, ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    // open form modal via UtilsService using minimal data structure expected by FormComponent
    const pedido: any = { plantilla: this.procesoId, server: this.server };
    this.utils.modalWithParams(pedido, false, null, false).subscribe(() => {
      // optionally refresh after form closed
    });
  }

}
