import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { DocumentoPlantillaDTO, ProcesoDTO } from 'app/document/document.types';
import { DocumentTemplateService, ProcessService } from '../configuracion.api';
import { DocumentTemplateFormComponent } from './document-template-form.component';
import Swal from 'sweetalert2';
import { DocumentoPlantillaFilterDTO } from '../configuration.types';

@Component({
    selector: 'app-document-template-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatAutocompleteModule, DropdownComponent, DropdownItemComponent],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Plantillas de Documento</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nueva Plantilla</button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full sm:col-span-2"><mat-label>Nombre o Código</mat-label><input matInput [(ngModel)]="filter.filtroParametro" (ngModelChange)="onFilterInput()" placeholder="Filtrar por nombre o código" /></mat-form-field>
           <mat-form-field appearance="outline" class="w-full"><mat-label>Proceso</mat-label><input matInput [matAutocomplete]="autoProceso" [(ngModel)]="processSearch" (ngModelChange)="onProcessSearch($event)" placeholder="Filtrar por proceso" /><mat-autocomplete #autoProceso="matAutocomplete" (optionSelected)="onProcessSelected($event)">@for (p of filteredProcesses(); track p.llaveTabla) { <mat-option [value]="p.nombre">{{ p.nombre }}</mat-option> }</mat-autocomplete></mat-form-field>
          <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (loading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (element of data(); track element.llaveTabla) {
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    @if (element.imagen) { <img [src]="element.imagen" class="w-10 h-10 rounded-lg object-cover shrink-0" alt="" /> } @else { <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">description</mat-icon></div> }
                    <div class="min-w-0">
                      <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ element.codigo }}</p>
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                    </div>
                  </div>
                  <app-dropdown>
                    <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                    <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                    <app-dropdown-item (clicked)="duplicateTemplate(element)"><mat-icon class="text-base">content_copy</mat-icon> Duplicar</app-dropdown-item>
                    <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                  </app-dropdown>
                </div>
              </div>
            }
          </div>
          <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
        }
        @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay plantillas registradas</div> }
      </div>
    </div>
  `,
    styles: []
})
export class DocumentTemplateListComponent implements OnInit {
    private service = inject(DocumentTemplateService);
    private processService = inject(ProcessService);
    private dialog = inject(MatDialog);

    loading = signal(false);
    data = signal<DocumentoPlantillaDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);
    private debounceTimer: any;
    processSearch = '';
    processes = signal<ProcesoDTO[]>([]);
    filteredProcesses = signal<ProcesoDTO[]>([]);

    filter: DocumentoPlantillaFilterDTO = {
        estado: 'A',
        nombre: '',
        consecutivo: '',
        imagen: '',
        codigo: '',
        proceso: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    ngOnInit(): void {
        this.loadData();
        this.processService.getProcessTree().subscribe({ next: (res) => { this.processes.set(res); this.filteredProcesses.set(res); } });
    }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();
        this.service.getTemplates(f).subscribe({ next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); }, error: () => this.loading.set(false) });
    }

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onFilterInput(): void { clearTimeout(this.debounceTimer); this.debounceTimer = setTimeout(() => { this.onFilterChange(); }, 200); }
    onProcessSearch(value: string): void {
        const term = value.toLowerCase();
        this.filteredProcesses.set(term ? this.processes().filter(p => p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)) : this.processes());
    }
    onProcessSelected(event: any): void {
        this.filter.proceso = event.option.value;
        this.onFilterChange();
    }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    openForm(item?: DocumentoPlantillaDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateFormComponent, { width: '900px', maxWidth: '95vw', maxHeight: '95vh', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: DocumentoPlantillaDTO) => { if (result) this.loadData(); });
    }

    duplicateTemplate(item: DocumentoPlantillaDTO): void {
        Swal.fire({ title: '¿Duplicar plantilla?', text: 'Se creará una copia con los mismos campos y reportes.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, duplicar', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { this.service.duplicateTemplate(item.llaveTabla).subscribe({ next: () => { Swal.fire('Duplicado', 'Plantilla duplicada correctamente', 'success'); this.loadData(); }, error: () => Swal.fire('Error', 'No se pudo duplicar la plantilla', 'error') }); }});
    }

    toggleStatus(item: DocumentoPlantillaDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateTemplate(updated).subscribe({ next: () => { Swal.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.loadData(); }, error: () => Swal.fire('Error', `No se pudo ${action} la plantilla`, 'error') }); }});
    }
}