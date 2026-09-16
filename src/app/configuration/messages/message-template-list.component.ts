import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO } from 'app/document/document.types';
import { MessageTemplateService } from '../configuracion.api';
import { MessageTemplateFormComponent } from '../message-templates/message-template-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-template-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        DropdownComponent,
        DropdownItemComponent
    ],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Plantillas de Mensaje</h1>
        <button type="button" class="btn-flat-primary" (click)="openTemplateForm()">
          <mat-icon>add</mat-icon>
          Nueva Plantilla
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="tplFilter.nombre" (ngModelChange)="onTplFilterChange()" placeholder="Filtrar por nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Servidor</mat-label>
            <input matInput [(ngModel)]="tplFilter.servidor" (ngModelChange)="onTplFilterChange()" placeholder="Filtrar por servidor" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="tplFilter.estado" (ngModelChange)="onTplFilterChange()">
              <mat-option value="A">Activo</mat-option>
              <mat-option value="I">Inactivo</mat-option>
              <mat-option value="">Todos</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Lista Plantillas -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-4">
          @if (tplLoading() && tplData().length === 0) {
            <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (element of tplData(); track element.llaveTabla) {
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0 cursor-pointer rounded-lg p-1 -m-1 transition hover:bg-gray-900/5 dark:hover:bg-white/10" (click)="openTemplateForm(element)">
                      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <mat-icon class="text-primary">mail</mat-icon>
                      </div>
                      <div class="min-w-0">
                        <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                      </div>
                    </div>
                    <app-dropdown>
                      <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                      <app-dropdown-item (clicked)="openTemplateForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                      <app-dropdown-item (clicked)="toggleTemplateStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                    </app-dropdown>
                  </div>
                </div>
              }
            </div>
            <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ tplData().length }} registros</span>
              @if (tplLoading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
            </div>
          }
          @if (!tplLoading() && tplData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay plantillas registradas</div> }
        </div>
      </div>
      <div #loadMoreTpl></div>
    </div>
  `,
    styles: []
})
export class MessageTemplateListComponent implements OnInit, AfterViewInit, OnDestroy {
    private templateService = inject(MessageTemplateService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMoreTpl') loadMoreTplRef!: ElementRef<HTMLDivElement>;
    private tplObserver?: IntersectionObserver;

    private readonly pageSize = 25;

    tplLoading = signal(false);
    tplData = signal<MensajePlantillaCorreoDTO[]>([]);
    tplCurrentPage = signal(0);
    tplHasMore = signal(true);
    tplFilter: MensajePlantillaCorreoFilterDTO = {
        estado: 'A',
        nombre: '',
        servidor: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
    };

    ngOnInit(): void {
        this.loadTplNext();
    }

    ngAfterViewInit(): void {
        this.tplObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadTplNext(); });
        this.tplObserver.observe(this.loadMoreTplRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.tplObserver?.disconnect();
    }

    loadTplNext(): void {
        if (this.tplLoading() || !this.tplHasMore()) return;
        this.tplLoading.set(true);
        const f = this.tplFilter;
        f.paginacionRegistroInicial = this.tplCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.templateService.getTemplates(f).subscribe({
            next: (res) => { this.tplData.update(items => [...items, ...res]); this.tplCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.tplHasMore.set(false); this.tplLoading.set(false); this.checkTplMore(); },
            error: () => this.tplLoading.set(false)
        });
    }

    private checkTplMore(): void {
        requestAnimationFrame(() => {
            if (this.tplLoading() || !this.tplHasMore() || this.tplData().length === 0) return;
            const rect = this.loadMoreTplRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadTplNext();
        });
    }

    onTplFilterChange(): void { this.reload(); }

    reload(): void {
        this.tplCurrentPage.set(0);
        this.tplHasMore.set(true);
        this.tplData.set([]);
        this.loadTplNext();
    }

    openTemplateForm(item?: MensajePlantillaCorreoDTO): void {
        const dialogRef = this.dialog.open(MessageTemplateFormComponent, {
            width: '800px', maxWidth: '90vw', disableClose: true,
            data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: MensajePlantillaCorreoDTO) => { if (result) this.reload(); });
    }

    toggleTemplateStatus(item: MensajePlantillaCorreoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`,
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'Sí', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = { ...item, estado: newEstado };
                this.templateService.inactivateTemplate(updated).subscribe({
                    next: () => { Swal.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.reload(); },
                    error: () => Swal.fire('Error', `No se pudo ${action} la plantilla`, 'error')
                });
            }
        });
    }
}
