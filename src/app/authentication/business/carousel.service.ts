import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from 'app/document/document.api';
import { OrganizacionDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/document/document.types';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private apiService = inject(ApiService);

  readonly slides = signal<string[]>([]);
  readonly landing = signal<string[]>([]);
  readonly headerSection = signal<string[]>([]);

  private sanitizeLayoutHtml(value: string): string {
    if (!value) { return ''; }

    const documentFragment = new DOMParser().parseFromString(value, 'text/html');
    const allowedTags = new Set([
      'A', 'B', 'BR', 'CAPTION', 'CODE', 'COL', 'COLGROUP', 'DIV', 'EM', 'FIGCAPTION',
      'FIGURE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'IMG', 'LI', 'OL', 'P',
      'PRE', 'S', 'SMALL', 'SPAN', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH',
      'THEAD', 'TR', 'U', 'UL'
    ]);
    const allowedAttributes = new Set([
      'alt', 'class', 'colspan', 'height', 'href', 'rel', 'rowspan', 'src', 'target', 'width'
    ]);
    const safeUrl = /^(?:https?:|mailto:|tel:|\/|#)/i;

    for (const element of Array.from(documentFragment.body.querySelectorAll('*'))) {
      if (!allowedTags.has(element.tagName)) {
        element.remove();
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (!allowedAttributes.has(name)) {
          element.removeAttribute(attribute.name);
          continue;
        }
        if ((name === 'href' || name === 'src') && !safeUrl.test(attribute.value.trim())) {
          element.removeAttribute(attribute.name);
        }
      }
    }

    return documentFragment.body.innerHTML;
  }

  loadFromOrganization(_company: OrganizacionDTO, isAuthenticated: boolean) {
    const slides: string[] = [];
    const landing: string[] = [];
    let headerSection: string[] = [];

    if (_company.propiedades) {
      const backImages = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.COVERAGE_IMAGE);
      if (backImages) {
        backImages.forEach(element => {
          slides.push(element.valor);
        });
      }

      if (PlantillaHelper.buscarValor(_company.propiedades, PlantillaHelper.COVERAGE_TEMPLATE) && isAuthenticated) {
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.plantilla = PlantillaHelper.buscarValor(_company.propiedades, PlantillaHelper.COVERAGE_TEMPLATE);
        this.apiService.listarDocumentos(entity).subscribe({
          next: (dataResult: PedidoVentaDTO[]) => {
            if (dataResult) {
              this.slides.update(current => [...current, ...dataResult.map(element => element.imagen)]);
            }
          },
          error: () => {},
        });
      }

      const _iHeaders = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.LANDING_PAGE);
      if (_iHeaders && _iHeaders.length !== 0) {
        _iHeaders.forEach((element: PropiedadDTO) => {
          landing.push(this.sanitizeLayoutHtml(element.valor));
        });
      }
      const _iFooters = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.HEADER_PAGE);
      if (_iFooters && _iFooters.length !== 0) {
        headerSection = [];
        _iFooters.forEach((element: PropiedadDTO) => {
          headerSection.push(this.sanitizeLayoutHtml(element.valor));
        });
      }
    }

    this.slides.set(slides);
    this.landing.set(landing);
    this.headerSection.set(headerSection);
  }
}
