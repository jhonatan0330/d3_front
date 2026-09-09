import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';
import { ProcesoDTO, ProcesoFilterDTO } from 'app/document/document.types';
import { ProcessService } from '../configuracion.api';
import { ProcessFormComponent } from './process-form.component';
import { PropertyPanelComponent } from '../shared/property-panel.component';
import Swal from 'sweetalert2';

interface TreeNode {
    proceso: ProcesoDTO;
    children: TreeNode[];
    level: number;
    expanded: boolean;
    isLoading: boolean;
}

@Component({
    selector: 'app-process-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatTabsModule, CdkTreeModule, DropdownComponent, DropdownItemComponent],
    template: `
    <div class="p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Procesos</h1>
        <button type="button" class="btn-flat-primary" (click)="openForm()"><mat-icon>add</mat-icon> Nuevo Proceso</button>
      </div>

      <mat-tab-group [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Tab Lista -->
        <mat-tab label="Lista">
          <div class="p-4">
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <mat-form-field appearance="outline" class="w-full"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="filter.nombre" (ngModelChange)="onFilterChange()" placeholder="Filtrar por nombre" /></mat-form-field>
                <mat-form-field appearance="outline" class="w-full"><mat-label>Código</mat-label><input matInput [(ngModel)]="filter.codigo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por código" /></mat-form-field>
                <mat-form-field appearance="outline" class="w-full"><mat-label>Tipo</mat-label><mat-select [(ngModel)]="filter.tipo" (ngModelChange)="onFilterChange()"><mat-option value="">Todos</mat-option><mat-option value="A">Agrupador</mat-option><mat-option value="E">Ejecutor</mat-option></mat-select></mat-form-field>
                <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
              </div>
            </div>

            @if (loading() && data().length === 0) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (element of data(); track element.llaveTabla) {
                  <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-3">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-3 min-w-0 cursor-pointer rounded-lg p-1 -m-1 transition hover:bg-gray-900/5 dark:hover:bg-white/10" (click)="openForm(element)">
                        @if (element.imagen) { <img [src]="element.imagen" class="w-10 h-10 rounded-lg object-cover shrink-0" alt="" /> } @else { <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><mat-icon class="text-primary">account_tree</mat-icon></div> }
                        <div class="min-w-0">
                          <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ element.codigo }}</p>
                          <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ element.nombre }}</h3>
                        </div>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" class="btn-icon btn-flat-primary" (click)="openProperties(element)" title="Propiedades" aria-label="Propiedades"><mat-icon>tune</mat-icon></button>
                        <app-dropdown>
                          <button type="button" class="btn-icon" trigger aria-label="Acciones"><mat-icon>more_vert</mat-icon></button>
                          <app-dropdown-item (clicked)="openForm(element)"><mat-icon class="text-base">edit</mat-icon> Editar</app-dropdown-item>
                          <app-dropdown-item (clicked)="openProperties(element)"><mat-icon class="text-base">tune</mat-icon> Propiedades</app-dropdown-item>
                          <app-dropdown-item (clicked)="openTransitions(element)"><mat-icon class="text-base">swap_horiz</mat-icon> Transiciones</app-dropdown-item>
                          <app-dropdown-item (clicked)="toggleStatus(element)"><mat-icon class="text-base">{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon> {{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}</app-dropdown-item>
                        </app-dropdown>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">Mostrando {{ data().length }} registros</span>
                @if (loading()) { <div class="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
              </div>
            }
            @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay procesos registrados</div> }
          </div>
          <div #loadMore></div>
        </mat-tab>

        <!-- Tab Árbol -->
        <mat-tab label="Vista Árbol">
          <div class="p-4">
            @if (treeLoading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
              <div class="space-y-1 max-h-[600px] overflow-y-auto">
                <cdk-tree [dataSource]="treeData()" [treeControl]="treeControl" class="w-full">
                  <cdk-nested-tree-node *cdkTreeNodeDef="let node; when: hasChild" class="py-1">
                    <div class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" [style.margin-left.px]="node.level * 24">
                      <button type="button" class="btn-icon-sm" (click)="toggleNode(node)" aria-label="{{ node.expanded ? 'Colapsar' : 'Expandir' }}">
                        <mat-icon>{{ node.expanded ? 'expand_more' : 'chevron_right' }}</mat-icon>
                      </button>
                      @if (node.isLoading) { <div class="w-4 h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-2"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div> }
                      <div class="flex-1 min-w-0 flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" [class.bg-blue-500]="node.proceso.tipo === 'A'" [class.bg-violet-500]="node.proceso.tipo === 'E'"></div>
                        <span class="font-medium truncate">{{ node.proceso.nombre }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ node.proceso.codigo }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" class="btn-icon btn-flat-primary" (click)="openForm(node.proceso)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
                        <button type="button" class="btn-icon" (click)="openTransitions(node.proceso)" aria-label="Transiciones" title="Transiciones"><mat-icon>swap_horiz</mat-icon></button>
                      </div>
                    </div>
                    <cdk-tree-node-outlet></cdk-tree-node-outlet>
                  </cdk-nested-tree-node>

                  <cdk-tree-node *cdkTreeNodeDef="let node; when: hasNoChild" class="py-1">
                    <div class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" [style.margin-left.px]="node.level * 24">
                      <span class="w-5"></span>
                      <div class="flex-1 min-w-0 flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" [class.bg-blue-500]="node.proceso.tipo === 'A'" [class.bg-violet-500]="node.proceso.tipo === 'E'"></div>
                        <span class="font-medium truncate">{{ node.proceso.nombre }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ node.proceso.codigo }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" class="btn-icon btn-flat-primary" (click)="openForm(node.proceso)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
                        <button type="button" class="btn-icon" (click)="openTransitions(node.proceso)" aria-label="Transiciones" title="Transiciones"><mat-icon>swap_horiz</mat-icon></button>
                      </div>
                    </div>
                  </cdk-tree-node>
                </cdk-tree>
              </div>
            }
            @if (!treeLoading() && treeData().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay procesos para mostrar en árbol</div> }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
    styles: []
})
export class ProcessListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(ProcessService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    activeTab = signal(0);
    loading = signal(false);
    data = signal<ProcesoDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;

    filter: ProcesoFilterDTO = {
        estado: 'A',
        nombre: '',
        codigo: '',
        tipo: '',
        macroproceso: '',
        macroNombre: '',
        imagen: '',
        prioridad: 0,
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
securityToken: ''
    };

    // Tree
    treeLoading = signal(false);
    treeControl = new FlatTreeControl<TreeNode>(
        node => node.level,
        node => node.expanded
    );
    treeData = signal<TreeNode[]>([]);

    ngOnInit(): void {
        this.loadNext();
    }

    ngAfterViewInit(): void {
        this.observer = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadNext(); });
        this.observer.observe(this.loadMoreRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }

    loadNext(): void {
        if (this.loading() || !this.hasMore()) return;
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;

        this.service.getProcesses(f).subscribe({
            next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); },
            error: () => this.loading.set(false)
        });
    }

    private checkMore(): void {
        requestAnimationFrame(() => {
            if (this.loading() || !this.hasMore() || this.data().length === 0) return;
            const rect = this.loadMoreRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadNext();
        });
    }

    reload(): void {
        this.currentPage.set(0);
        this.hasMore.set(true);
        this.data.set([]);
        this.loadNext();
    }

    loadTree(): void {
        this.treeLoading.set(true);
        this.service.getProcessTree().subscribe({
            next: (processes) => {
                const roots = processes.filter(p => !p.macroproceso || p.macroproceso === p.llaveTabla);
                this.treeData.set(this.buildTree(roots, processes));
                this.treeLoading.set(false);
            },
            error: () => this.treeLoading.set(false)
        });
    }

    buildTree(roots: ProcesoDTO[], all: ProcesoDTO[]): TreeNode[] {
        const childrenMap = new Map<string, ProcesoDTO[]>();
        all.forEach(p => {
            const parentKey = p.macroproceso || p.llaveTabla;
            if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, []);
            childrenMap.get(parentKey)!.push(p);
        });

        const buildNode = (proceso: ProcesoDTO, level: number): TreeNode => {
            const children = childrenMap.get(proceso.llaveTabla) || [];
            return {
                proceso,
                children: children.map(c => buildNode(c, level + 1)),
                level,
                expanded: level === 0,
                isLoading: false
            };
        };

        return roots.map(r => buildNode(r, 0));
    }

    hasChild = (_: number, node: TreeNode) => node.children.length > 0;
    hasNoChild = (_: number, node: TreeNode) => node.children.length === 0;

    toggleNode(node: TreeNode): void {
        node.expanded = !node.expanded;
        if (node.expanded && node.children.length === 0 && !node.isLoading) {
            node.isLoading = true;
            this.service.getTransitions(node.proceso.llaveTabla).subscribe({
                next: (transitions) => {
                    const children = transitions.map(t => ({
                        proceso: { ...t, nombre: `${t.nombre} (${t.estadoPartidaNombre} → ${t.estadoLlegadaNombre})` } as unknown as ProcesoDTO,
                        children: [],
                        level: node.level + 1,
                        expanded: false,
                        isLoading: false
                    }));
                    node.children = children;
                    node.isLoading = false;
                    this.treeData.set([...this.treeData()]);
                }
            });
        }
    }

    onFilterChange(): void { this.reload(); }

    openForm(item?: ProcesoDTO): void {
        const dialogRef = this.dialog.open(ProcessFormComponent, { width: '900px', maxWidth: '95vw', maxHeight: '95vh', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ProcesoDTO) => { if (result) { this.reload(); if (this.activeTab() === 1) this.loadTree(); } });
    }

    openTransitions(process: ProcesoDTO): void {
        // Navegar a transiciones - se implementará en el routing
    }

    openProperties(item: ProcesoDTO): void {
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: item.llaveTabla, tipoOrigen: 'P', titulo: item.nombre }
        });
    }

    toggleStatus(item: ProcesoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} proceso?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateProcess(updated).subscribe({ next: () => { Swal.fire('Éxito', `Proceso ${action}do correctamente`, 'success'); this.reload(); if (this.activeTab() === 1) this.loadTree(); }, error: () => Swal.fire('Error', `No se pudo ${action} el proceso`, 'error') }); }});
    }
}