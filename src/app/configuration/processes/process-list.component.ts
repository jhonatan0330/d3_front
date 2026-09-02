import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CdkTreeModule } from '@angular/cdk/tree';
import { ProcesoDTO, ProcesoFilterDTO } from 'app/document/model/sw42.domain';
import { ProcessService } from '../configuracion.api';
import { ProcessFormComponent } from './process-form.component';
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
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatTabsModule, CdkTreeModule],
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
                <mat-form-field appearance="outline" class="w-full"><mat-label>Objetivo</mat-label><input matInput [(ngModel)]="filter.objetivo" (ngModelChange)="onFilterChange()" placeholder="Filtrar por objetivo" /></mat-form-field>
                <mat-form-field appearance="outline" class="w-full"><mat-label>Estado</mat-label><mat-select [(ngModel)]="filter.estado" (ngModelChange)="onFilterChange()"><mat-option value="A">Activo</mat-option><mat-option value="I">Inactivo</mat-option><mat-option value="">Todos</mat-option></mat-select></mat-form-field>
              </div>
            </div>

            @if (loading()) { <div class="flex justify-center py-12"><div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div class="h-full bg-primary rounded animate-pulse" style="width: 40%;"></div></div></div> } @else {
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="data()" class="w-full">
                  <ng-container matColumnDef="codigo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Código</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-mono text-sm">{{ element.codigo }}</td></ng-container>
                  <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre</th><td mat-cell *matCellDef="let element" class="px-4 py-3 font-medium">{{ element.nombre }}</td></ng-container>
                  <ng-container matColumnDef="descripcion"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Descripción</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm truncate max-w-xs">{{ element.descripcion }}</td></ng-container>
                  <ng-container matColumnDef="consecutivo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Consecutivo</th><td mat-cell *matCellDef="let element" class="px-4 py-3">{{ element.consecutivo }}</td></ng-container>
                  <ng-container matColumnDef="color"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Color</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="w-6 h-6 rounded border" [style.background-color]="element.color"></div></td></ng-container>
                  <ng-container matColumnDef="objetivo"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Objetivo</th><td mat-cell *matCellDef="let element" class="px-4 py-3 text-sm truncate max-w-xs">{{ element.objetivo }}</td></ng-container>
                  <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Estado</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><span class="badge" [class.badge-success]="element.estado === 'A'" [class.badge-secondary]="element.estado === 'I'">{{ element.estado === 'A' ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
                  <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th><td mat-cell *matCellDef="let element" class="px-4 py-3"><div class="flex items-center justify-end gap-1"><button type="button" class="btn-icon btn-flat-primary" (click)="openForm(element)" aria-label="Editar"><mat-icon>edit</mat-icon></button><button type="button" class="btn-icon" (click)="openTransitions(element)" aria-label="Transiciones" title="Transiciones" matTooltip="Transiciones"><mat-icon>swap_horiz</mat-icon></button><button type="button" class="btn-icon btn-flat-accent" (click)="toggleStatus(element)" aria-label="{{ element.estado === 'A' ? 'Inactivar' : 'Activar' }}"><mat-icon>{{ element.estado === 'A' ? 'block' : 'check_circle' }}</mat-icon></button></div></td></ng-container>
                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr><tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
              <mat-paginator [length]="totalItems()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 25, 50, 100]" (page)="onPageChange($event)" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"></mat-paginator>
            }
            @if (!loading() && data().length === 0) { <div class="text-center py-12 text-gray-500 dark:text-gray-400">No hay procesos registrados</div> }
          </div>
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
                        <div class="w-3 h-3 rounded-full" [style.background-color]="node.proceso.color"></div>
                        <span class="font-medium truncate">{{ node.proceso.nombre }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ node.proceso.codigo }}</span>
                        <span class="badge" [class.badge-success]="node.proceso.estado === 'A'" [class.badge-secondary]="node.proceso.estado === 'I'">{{ node.proceso.estado === 'A' ? 'Activo' : 'Inactivo' }}</span>
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
                        <div class="w-3 h-3 rounded-full" [style.background-color]="node.proceso.color"></div>
                        <span class="font-medium truncate">{{ node.proceso.nombre }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ node.proceso.codigo }}</span>
                        <span class="badge" [class.badge-success]="node.proceso.estado === 'A'" [class.badge-secondary]="node.proceso.estado === 'I'">{{ node.proceso.estado === 'A' ? 'Activo' : 'Inactivo' }}</span>
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
export class ProcessListComponent implements OnInit {
    private service = inject(ProcessService);
    private dialog = inject(MatDialog);

    activeTab = signal(0);
    loading = signal(false);
    data = signal<ProcesoDTO[]>([]);
    totalItems = signal(0);
    pageSize = signal(25);
    currentPage = signal(0);

    filter: ProcesoFilterDTO = {
        estado: 'A',
        nombre: '',
        codigo: '',
        objetivo: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
        securityToken: ''
    };

    displayedColumns = ['codigo', 'nombre', 'descripcion', 'consecutivo', 'color', 'objetivo', 'estado', 'acciones'];

    // Tree
    treeLoading = signal(false);
    treeControl = new FlatTreeControl<TreeNode>(
        node => node.level,
        node => node.expanded
    );
    treeData = signal<TreeNode[]>([]);

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading.set(true);
        const f = this.filter;
        f.paginacionRegistroInicial = this.currentPage() * this.pageSize();
        f.paginacionRegistroFinal = f.paginacionRegistroInicial + this.pageSize();

        this.service.getProcesses(f).subscribe({
            next: (res) => { this.data.set(res); this.totalItems.set(res.length); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    loadTree(): void {
        this.treeLoading.set(true);
        this.service.getProcessTree().subscribe({
            next: (processes) => {
                const roots = processes.filter(p => !p.proceso || p.proceso === p.llaveTabla);
                this.treeData.set(this.buildTree(roots, processes));
                this.treeLoading.set(false);
            },
            error: () => this.treeLoading.set(false)
        });
    }

    buildTree(roots: ProcesoDTO[], all: ProcesoDTO[]): TreeNode[] {
        const childrenMap = new Map<string, ProcesoDTO[]>();
        all.forEach(p => {
            const parentKey = p.proceso || p.llaveTabla;
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

    onFilterChange(): void { this.currentPage.set(0); this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage.set(event.pageIndex); this.pageSize.set(event.pageSize); this.loadData(); }

    openForm(item?: ProcesoDTO): void {
        const dialogRef = this.dialog.open(ProcessFormComponent, { width: '900px', maxWidth: '95vw', maxHeight: '95vh', data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ProcesoDTO) => { if (result) { this.loadData(); if (this.activeTab() === 1) this.loadTree(); } });
    }

    openTransitions(process: ProcesoDTO): void {
        // Navegar a transiciones - se implementará en el routing
    }

    toggleStatus(item: ProcesoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} proceso?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateProcess(updated).subscribe({ next: () => { Swal.fire('Éxito', `Proceso ${action}do correctamente`, 'success'); this.loadData(); if (this.activeTab() === 1) this.loadTree(); }, error: () => Swal.fire('Error', `No se pudo ${action} el proceso`, 'error') }); }});
    }
}