import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import {
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
  PedidoVentaFilterDTO,
} from 'app/document/document.types';
import { StatesEnum } from 'app/document/form/form.enum';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { ImageFormatPipe } from 'app/shared/local-image';
import { DocumentListComponent } from 'app/document/cruds/document-list.component';

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
  imports: [MatIcon, ImageFormatPipe, DocumentListComponent],
})
export class RelationsComponent {
  private readonly templateService = inject(TemplateService);
  private readonly utilsService = inject(UtilsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plantilla = input<DocumentoPlantillaDTO | null>(null);
  readonly documento = input<PedidoVentaDTO | null>(null);
  readonly closed = output<void>();

  readonly related = computed(() => this.resolveRelatedTemplates());
  readonly selected = signal<RelatedTemplate | null>(null);
  readonly selectedTemplate = computed(() => {
    const selected = this.selected();
    if (!selected) {
      return null;
    }
    const template = this.templateService.getTemplate(selected.templateId);
    if (template) {
      return template;
    }
    const fallback = new DocumentoPlantillaDTO();
    fallback.llaveTabla = selected.templateId;
    fallback.nombre = selected.templateName;
    return fallback;
  });
  readonly selectedFilter = computed(() => {
    const selected = this.selected();
    const document = this.documento();
    if (!selected || !document?.llaveTabla) {
      return null;
    }

    const fieldFilter = new PedidoVentaCaracteristicaFilterDTO();
    fieldFilter.campo = selected.property.llaveTabla;
    fieldFilter.valorOpcion = document.llaveTabla;

    const filter = new PedidoVentaFilterDTO();
    filter.plantilla = selected.templateId;
    filter.filtersByFields = [fieldFilter];
    filter.estado = `${StatesEnum.ACTIVE};${StatesEnum.INACTIVE};${StatesEnum.FINALIZADO}`;
    return filter;
  });
  readonly documentList = viewChild(DocumentListComponent);

  selectTemplate(entry: RelatedTemplate): void {
    this.selected.set(entry);
  }

  backToTemplates(): void {
    this.selected.set(null);
  }

  openDocument(document: PedidoVentaDTO): void {
    if (!document?.llaveTabla) {
      return;
    }
    const target = new PedidoVentaDTO();
    target.plantilla = document.plantilla;
    target.llaveTabla = document.llaveTabla;
    this.utilsService.modalWithParams(target, false)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.documentList()?.refresh();
        }
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
