import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
  PedidoVentaFilterDTO,
} from 'app/document/document.types';
import { StatesEnum } from 'app/document/form/form.enum';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { ImageFormatPipe } from 'app/shared/local-image';
import type { Cruds2DialogData } from 'app/document/cruds/cruds2.component';

export interface RelatedTemplate {
  key: string;
  templateId: string;
  templateName: string;
  templateImage: string;
  property: PropiedadDTO;
}

@Component({
  selector: 'app-relations',
  templateUrl: './relations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ImageFormatPipe],
})
export class RelationsComponent {
  private readonly templateService = inject(TemplateService);
  private readonly dialog = inject(MatDialog);

  readonly plantilla = input<DocumentoPlantillaDTO | null>(null);
  readonly documento = input<PedidoVentaDTO | null>(null);
  readonly closed = output<void>();

  readonly related = computed(() => this.resolveRelatedTemplates());

  async selectTemplate(entry: RelatedTemplate): Promise<void> {
    const document = this.documento();
    if (!document?.llaveTabla) {
      return;
    }

    const template = this.templateService.getTemplate(entry.templateId);
    const dialogTemplate = template ?? new DocumentoPlantillaDTO();
    dialogTemplate.llaveTabla = dialogTemplate.llaveTabla || entry.templateId;
    dialogTemplate.nombre = dialogTemplate.nombre || entry.templateName;

    const fieldFilter = new PedidoVentaCaracteristicaFilterDTO();
    fieldFilter.campo = entry.property.llaveTabla;
    fieldFilter.valorOpcion = document.llaveTabla;

    const filter = new PedidoVentaFilterDTO();
    filter.plantilla = entry.templateId;
    filter.filtersByFields = [fieldFilter];
    filter.estado = `${StatesEnum.ACTIVE};${StatesEnum.INACTIVE};${StatesEnum.FINALIZADO}`;

    const data: Cruds2DialogData = { plantilla: dialogTemplate, filtro: filter };
    const { Cruds2Component } = await import('app/document/cruds/cruds2.component');
    this.dialog.open(Cruds2Component, {
      data,
      width: '96vw',
      height: '90vh',
      maxWidth: '98vw',
      maxHeight: '96vh',
      autoFocus: false,
    });
  }

  private resolveRelatedTemplates(): RelatedTemplate[] {
    const plantilla = this.plantilla();
    if (!plantilla?.propiedades) {
      return [];
    }

    const result: RelatedTemplate[] = [];
    const used = new Set<string>();

    for (const property of plantilla.propiedades) {
      if (property.key !== PlantillaHelper.RELATIONS_FORMS) {
        continue;
      }

      const templateId = property.valor;
      const fieldId = property.llaveTabla;
      if (!templateId || !fieldId) {
        continue;
      }

      const key = `${templateId}|${fieldId}`;
      if (used.has(key)) {
        continue;
      }

      const template = this.templateService.getTemplate(templateId);
      used.add(key);
      result.push({
        key,
        templateId,
        templateName: template?.nombre ?? property.codigo,
        templateImage: template?.imagen ?? '',
        property,
      });
    }

    return result;
  }
}
