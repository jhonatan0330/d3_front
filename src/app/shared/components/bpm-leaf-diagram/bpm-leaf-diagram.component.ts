import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentApi } from 'app/document/document.api';
import { DocumentoPlantillaDTO, PedidoVentaDTO, ProcesoEstadoDTO, ProcesoTransicionDTO } from 'app/document/document.types';
import { UtilsService } from 'app/document/service/utils.service';
import { BpmCanvasComponent } from '../bpm-canvas/bpm-canvas.component';
import { BpmCanvasAction, BpmCanvasEdge, BpmCanvasMetadata, BpmCanvasNode, BPM_EDGE_COLORS } from '../bpm-canvas/bpm-canvas.types';

@Component({
    selector: 'bpm-leaf-diagram',
    imports: [BpmCanvasComponent],
    templateUrl: './bpm-leaf-diagram.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./bpm-leaf-diagram.component.scss']
})
export class BpmLeafDiagramComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA) as { procesoId?: string; server?: string | null };
  dialogRef = inject<MatDialogRef<BpmLeafDiagramComponent>>(MatDialogRef);
  private api = inject(DocumentApi);
  private utils = inject(UtilsService);

  readonly nodes = signal<BpmCanvasNode[]>([]);
  readonly edges = signal<BpmCanvasEdge[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  private readonly procesoId = this.data?.procesoId || null;

  ngOnInit(): void {
    this.loadTemplate();
  }

  loadTemplate(): void {
    if (!this.procesoId) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }
    this.isLoading.set(true);
    this.hasError.set(false);
    this.api.obtenerCampos(this.procesoId).subscribe({
      next: template => {
        this.normalizeTemplate(template);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  onStateActivated(node: BpmCanvasNode): void {
    this.dialogRef.close({ selectedState: node.source || node });
  }

  onActionActivated(action: BpmCanvasAction): void {
    if (!action.templateId) return;
    const pedido = new PedidoVentaDTO();
    pedido.plantilla = action.templateId;
    this.utils.modalWithParams(pedido, false, null, false).subscribe();
  }

  close(): void {
    this.dialogRef.close();
  }

  private normalizeTemplate(template: DocumentoPlantillaDTO): void {
    const states = (template.estados || []).filter(state => !!state.llaveTabla);
    const stateIds = new Set(states.map(state => state.llaveTabla));
    const actionsByState = new Map<string, BpmCanvasAction[]>();
    const edges: BpmCanvasEdge[] = [];

    states.forEach(state => {
      for (const [index, transition] of (state.transiciones || []).entries()) {
        const action = this.normalizeTransition(state, transition, index);
        if (action?.templateId) {
          const actions = actionsByState.get(state.llaveTabla) || [];
          actions.push(action);
          actionsByState.set(state.llaveTabla, actions);
        }

        const from = transition.estadoPartida || state.llaveTabla;
        const to = transition.estadoLLegada;
        if (!stateIds.has(from) || !to || !stateIds.has(to)) continue;
        edges.push({
          id: transition.llaveTabla || `${from}:${to}:${transition.plantilla || index}`,
          from,
          to,
          label: transition.nombre || transition.plantillaNombre || undefined,
          color: BPM_EDGE_COLORS[edges.length % BPM_EDGE_COLORS.length],
        });
      }
    });

    this.nodes.set(states.map(state => {
      const metadata: Array<BpmCanvasMetadata | null> = [
        state.tipo ? { label: 'Tipo', value: state.tipo } : null,
      ];
      return {
        id: state.llaveTabla,
        title: state.nombre || state.llaveTabla,
        subtitle: state.estadoDocumento || undefined,
        metadata: metadata.filter((item): item is BpmCanvasMetadata => item !== null),
        actions: actionsByState.get(state.llaveTabla) || [],
        source: state,
      };
    }));
    this.edges.set(edges);
  }

  private normalizeTransition(
    state: ProcesoEstadoDTO,
    transition: ProcesoTransicionDTO,
    index: number,
  ): BpmCanvasAction | null {
    if (!transition.plantilla) return null;
    return {
      id: transition.llaveTabla || `${state.llaveTabla}:action:${index}`,
      label: transition.nombre || transition.plantillaNombre || 'Continuar',
      targetId: transition.estadoLLegada || undefined,
      templateId: transition.plantilla,
      source: transition,
    };
  }
}
