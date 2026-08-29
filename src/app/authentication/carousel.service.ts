import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from 'app/document/service/api.service';
import { PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/document/model/sw42.domain';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { OrganizacionDTO } from './authentication.domain';

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private apiService = inject(ApiService);

  readonly slides = signal<string[]>([]);
  readonly landing = signal<string[]>([]);
  readonly headerSection = signal<string[]>([]);

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
        this.apiService.listarDocumentos(entity, null!).subscribe({
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
          landing.push(element.valor);
        });
      }
      const _iFooters = PlantillaHelper.buscarValorMultiple(_company.propiedades, PlantillaHelper.HEADER_PAGE);
      if (_iFooters && _iFooters.length !== 0) {
        headerSection = [];
        _iFooters.forEach((element: PropiedadDTO) => {
          headerSection.push(element.valor);
        });
      }
    }

    this.slides.set(slides);
    this.landing.set(landing);
    this.headerSection.set(headerSection);
  }
}
