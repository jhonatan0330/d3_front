import { Injectable, inject } from '@angular/core';

import { AuthenticationApi } from 'app/authentication/authentication.api';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { CarouselService } from '../authentication/business/carousel.service';
import { OrganizacionDTO } from 'app/document/document.types';

@Injectable({ providedIn: 'root' })
export class OrganizationLayoutService {
  private readonly authenticationService = inject(AuthenticationApi);
  private readonly carouselService = inject(CarouselService);
  private readonly templateService = inject(TemplateService);

  readonly slides = this.carouselService.slides;
  readonly landing = this.carouselService.landing;
  readonly headerSection = this.carouselService.headerSection;

  loadCurrentOrganization(
    isAuthenticated: boolean,
    onOrganizationLoaded?: (organization: OrganizacionDTO) => void
  ): void {
    this.authenticationService.getOrganization().subscribe({
      next: (organization) => {
        if (!organization) {
          return;
        }

        this.carouselService.loadFromOrganization(organization, isAuthenticated);

        if (organization.propiedades) {
          this.templateService.setModules(
            PlantillaHelper.buscarValorMultiple(
              organization.propiedades,
              PlantillaHelper.APP_MODULES
            ) ?? []
          );
        }

        onOrganizationLoaded?.(organization);
      },
      error: () => {
      }
    });
  }

  validateAccessModule(company: OrganizacionDTO | null | undefined, moduleKey: string): boolean {
    if (!company) {
      return false;
    }

    const modules = PlantillaHelper.buscarValorMultiple(
      company.propiedades,
      PlantillaHelper.APP_MODULES
    );

    if (!modules) {
      return false;
    }

    return modules.some((element) => element.valor === moduleKey);
  }
}
