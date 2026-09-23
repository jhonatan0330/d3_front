import { Injectable, inject, signal } from '@angular/core';

import { AuthenticationApi } from 'app/authentication/authentication.api';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { CarouselService } from '../authentication/business/carousel.service';
import { OrganizacionDTO } from 'app/document/document.types';
import { UsersApi } from 'app/users/users.api';
import { TasksService } from 'app/task/business/task.service';
import { UsuarioDTO } from 'app/users/domain/UsuarioDTO';
import { DocumentApi } from 'app/document/document.api';
import { NotificationsService } from 'app/notification/notification.api';

@Injectable({ providedIn: 'root' })
export class LayoutService {

  readonly user = signal<UsuarioDTO>(new UsuarioDTO());
  readonly company = signal<OrganizacionDTO>(new OrganizacionDTO());


  private readonly usersService = inject(UsersApi);
  private readonly taskService = inject(TasksService);

  private readonly authenticationService = inject(AuthenticationApi);
  private readonly carouselService = inject(CarouselService);
  private readonly templateService = inject(TemplateService);
  private readonly documentApi = inject(DocumentApi);
  private readonly notificationService = inject(NotificationsService);


  readonly isAdmin = signal<boolean>(false);
  readonly isReader = signal<boolean>(false);

  loadCurrentOrganization(
    onOrganizationLoaded?: (organization: OrganizacionDTO) => void
  ): void {
    this.authenticationService.getOrganization().subscribe({
      next: (organization) => {
        if (!organization) {
          return;
        }

        this.carouselService.loadFromOrganization(organization);

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

  public setUser(userId: string | null) {
    if (userId == null) {
      this.templateService.clear();
      this.notificationService.clear();
    } else {
      if (userId === this.user().llaveTabla) return;
      this.usersService.getUserById(userId)
        .subscribe({
          next: (value) => {
            this.user.set(value);
            this.getOrganization();
            this.taskService.getTasks();
            if (!this.user().llaveTabla) { return; }
            this.documentApi.listarPlantillas("USER")
              .subscribe({
                next: (templates) => {
                  this.templateService.setTemplates(templates);
                }, error: () => { }
              });
          }, error: () => { }
        });
    }

  }

  getOrganization() {
    this.loadCurrentOrganization( (organization) => {
      if (!organization) {
        return;
      }

      if (organization.propiedades) {
        this.isAdmin.set(!PlantillaHelper.isEmpty(organization.propiedades, PlantillaHelper.APP_ADMIN));
        this.isReader.set(!PlantillaHelper.isEmpty(organization.propiedades, PlantillaHelper.APP_READER));
      }

      if (this.company() && this.company().llaveTabla === organization?.llaveTabla) {
        this.company().propiedades = organization.propiedades;
        return;
      }

      this.company.set(organization);

    });
  }


  validateAccessModule( moduleKey: string): boolean {
    if (!this.company()) {
      return false;
    }

    const modules = PlantillaHelper.buscarValorMultiple(
      this.company().propiedades,
      PlantillaHelper.APP_MODULES
    );

    if (!modules) {
      return false;
    }

    return modules.some((element) => element.valor === moduleKey);
  }

}
