import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/document/document.types';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { ImageFormatPipe } from 'app/shared/local-image';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { QuickAction } from './indicators.types';

@Component({
  selector: 'quick-actions',
  templateUrl: './quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ImageFormatPipe],
})
export class QuickActionsComponent {
  private readonly templateService = inject(TemplateService);
  private readonly utilsService = inject(UtilsService);

  readonly actionClick = output<QuickAction>();

  readonly acciones = computed<QuickAction[]>(() => {
    const templates = this.templateService.template();

    return (templates ?? [])
      .filter((template: DocumentoPlantillaDTO) => {
        const accesoRapido = PlantillaHelper.buscarPropiedad(
          template.propiedades,
          PlantillaHelper.PLANTILLA_ACCESO_RAPIDO
        );
        const permisoCrear = PlantillaHelper.buscarPropiedad(
          template.propiedades,
          PlantillaHelper.PERMISO_PLANTILLA_CREAR
        );

        return !!accesoRapido && !!permisoCrear;
      })
      .slice(0, 4)
      .map((template: DocumentoPlantillaDTO, index: number) => ({
        id: template.llaveTabla,
        nombre: template.nombre || `Plantilla ${index + 1}`,
        icono: template.imagen || this.getQuickActionIcon(index),
        color: this.getQuickActionColor(index),
      }));
  });

  private readonly defaultQuickActions: QuickAction[] = [
    { id: 'cierre-caja', nombre: 'Cierre de Caja', icono: '💰', color: '#1B2A4A' },
    { id: 'anular-pedido', nombre: 'Anular Pedido', icono: '🚫', color: '#DC2626' },
    { id: 'calculo-pollo', nombre: 'Calculadora Costo Pollo', icono: '🧮', color: '#0E7C7B' },
    { id: 'ajuste-inventario', nombre: 'Ajuste Inventario', icono: '📦', color: '#3C4B8C' },
  ];

  protected onAction(accion: QuickAction): void {
    const template = this.templateService.getTemplate(accion.id);
    if (!template) {
      this.actionClick.emit(accion);
      return;
    }

    const pedidoVenta = new PedidoVentaDTO();
    pedidoVenta.plantilla = template.llaveTabla;
    this.utilsService.modalWithParams(pedidoVenta, true);
    this.actionClick.emit(accion);
  }

  private getQuickActionIcon(index: number): string {
    const icons = ['📄', '🧾', '📦', '⚙️'];
    return icons[index % icons.length];
  }

  private getQuickActionColor(index: number): string {
    const palette = ['#1B2A4A', '#0E7C7B', '#3C4B8C', '#C2760C'];
    return palette[index % palette.length];
  }
}
