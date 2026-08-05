import { Component, OnDestroy, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageFormatPipe } from 'app/shared/local-image';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { LoginService } from 'app/authentication/login.service';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';


@Component({
  standalone: true,
  selector: 'app-buscador',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] overflow-hidden">
      <div class="flex justify-end p-2">
        <button matIconButton mat-dialog-close>
          <mat-icon svgIcon="x" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div class="flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-y-4">
          @if (loginService.user; as userData) {
            <div class="flex items-center gap-x-3 px-1 pb-2">
              <img
                class="size-10 rounded-full object-cover"
                [src]="userData.imagen || '/images/photos/brian-hughes.jpg'"
                alt=""
              />
              <div class="flex min-w-0 flex-auto flex-col">
                <div class="truncate font-semibold">{{ userData.nombre }}</div>
                @if (userData.correo) {
                  <div class="truncate text-sm text-neutral-500">{{ userData.correo }}</div>
                }
              </div>
            </div>
          }
          
          <div class="flex items-center gap-x-2 rounded-lg border border-neutral-200 px-4 py-2 dark:border-neutral-700">
            <mat-icon class="text-neutral-500 shrink-0" svgIcon="search" />
            <input
              class="w-full bg-transparent outline-none text-sm"
              [formControl]="searchControl"
              placeholder="Buscar plantillas o documentos..."
              (input)="filterItem()"
              (keyup.enter)="searchDocument()"
            />
            @if (isLoading()) {
              <mat-progress-bar mode="indeterminate" class="w-20"></mat-progress-bar>
            }
            @if (searchControl.value) {
              <button mat-icon-button (click)="clearSearch()" class="size-6">
                <mat-icon svgIcon="x" class="size-4"></mat-icon>
              </button>
            }
            <button mat-icon-button (click)="searchDocument()">
              <mat-icon svgIcon="move-right" />
            </button>
          </div>

          @if (filteredTemplates().length > 0) {
            <div class="flex flex-col gap-y-1">
              <div class="text-sm font-semibold text-neutral-500 px-1">Plantillas</div>
              @for (item of filteredTemplates(); track item.llaveTabla) {
                <button
                  class="flex items-center gap-x-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  (click)="selectItem(item)"
                >
                  <img class="size-8 rounded object-cover" [src]="item.imagen | imageFormat" alt="" />
                  <div class="flex-auto min-w-0">
                    <div class="truncate font-medium">{{ item.nombre }}</div>
                    <div class="text-xs text-neutral-500">{{ item.estado === 'R' ? 'Reporte' : 'Plantilla' }}</div>
                  </div>
                </button>
              }
            </div>
          }

          @if (searchResults().length > 0) {
            <div class="flex flex-col gap-y-1">
              <div class="text-sm font-semibold text-neutral-500 px-1">Resultados de busqueda</div>
              @for (doc of searchResults(); track doc.llaveTabla) {
                <button
                  class="flex items-center gap-x-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  (click)="openDocumentResult(doc)"
                >
                  <img class="size-8 rounded object-cover" [src]="doc.imagen" alt="" />
                  <div class="flex-auto min-w-0">
                    <div class="truncate font-medium">{{ doc.nombre }}</div>
                    <div class="text-xs text-neutral-500 truncate">{{ doc.descripcion }}</div>
                  </div>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class BuscadorComponent implements OnDestroy {
  private readonly templateService = inject(TemplateService);
  private readonly utilsService = inject(UtilsService);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<BuscadorComponent>);
  protected readonly loginService = inject(LoginService);

  protected readonly searchControl = new FormControl('');
  protected readonly templates = signal<DocumentoPlantillaDTO[]>([]);
  protected readonly filteredTemplates = signal<DocumentoPlantillaDTO[]>([]);
  protected readonly searchResults = signal<PedidoVentaDTO[]>([]);
  protected readonly isLoading = signal(false);

  private readonly templatesWatcher = effect(() => {
    const allTemplates = this.templateService.template;
    if (allTemplates && allTemplates.length > 0) {
      const items: DocumentoPlantillaDTO[] = [];
      for (const element of allTemplates) {
        if (!element.llaveTabla) {
          items.push(element);
          element.estado = 'T';
        }
        if (
          PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PLANTILLA_TIPO_REPORTE)
          && PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)
        ) {
          const reportElement = new DocumentoPlantillaDTO();
          reportElement.llaveTabla = element.llaveTabla;
          reportElement.nombre = element.nombre;
          reportElement.imagen = element.imagen;
          reportElement.proceso = element.proceso;
          reportElement.server = element.server;
          reportElement.estado = 'R';
          items.push(reportElement);
        }
        if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)) {
          element.estado = 'P';
          items.push(element);
        }
      }
      this.templates.set(items);
    }
  });

  ngOnDestroy() {
    this.templatesWatcher.destroy();
  }

  filterItem() {
    const value = this.searchControl.value ?? '';
    if (!value) {
      this.filteredTemplates.set([]);
      return;
    }
    this.filteredTemplates.set(
      this.templates().filter(
        (item) =>
          item.nombre && item.nombre.toLowerCase().indexOf(value.toLowerCase()) > -1
          && (item.estado === 'P' || item.estado === 'R'),
      ),
    );
  }

  searchDocument() {
    const texto = this.searchControl.value;
    if (!texto || texto.length === 0) return;

    this.isLoading.set(true);
    const entitySearch = new PedidoVentaFilterDTO();
    entitySearch.nombre = texto;
    this.apiService.listarDocumentos(entitySearch, null).subscribe({
      next: (value: PedidoVentaDTO[]) => {
        this.isLoading.set(false);
        if (!value || value.length === 0) return;
        if (value.length === 1) {
          this.openDocumentResult(value[0]);
          this.searchControl.setValue('');
          this.filteredTemplates.set([]);
          this.searchResults.set([]);
        } else {
          this.searchResults.set(value.filter((item) => item.estado !== 'I'));
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectItem(item: DocumentoPlantillaDTO) {
    this.dialogRef.close();
    if (item.estado === 'R') {
      const pedidoVenta = new PedidoVentaDTO();
      pedidoVenta.plantilla = item.llaveTabla;
      if (item.server) pedidoVenta.server = item.server;
      this.utilsService.modalWithParams(pedidoVenta, true);
    } else if (item.estado === 'T') {
      this.router.navigate(['/admin/list/process_crud/' + item.proceso]);
    } else {
      this.router.navigate(['/admin/list/list/' + item.llaveTabla]);
    }
  }

  openDocumentResult(doc: PedidoVentaDTO) {
    this.dialogRef.close();
    this.searchControl.setValue('');
    this.filteredTemplates.set([]);
    this.searchResults.set([]);
    if (this.templateService.getTemplate(doc.plantilla, null)) {
      this.utilsService.modalWithParams(doc, false);
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.filteredTemplates.set([]);
    this.searchResults.set([]);
  }
}
