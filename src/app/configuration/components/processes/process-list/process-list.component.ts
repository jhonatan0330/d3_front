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
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { ProcesoDTO, ProcesoFilterDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';
import { ProcessFormComponent } from '../process-form/process-form.component';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

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
    templateUrl: './process-list.component.html',
})
export class ProcessListComponent implements OnInit, AfterViewInit, OnDestroy {
    private notificationCenter = inject(NotificationCenterService);
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
        llaveTabla: ''
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
        const dialogRef = this.dialog.open(ProcessFormComponent, { width: '900px', maxWidth: '95vw', maxHeight: '95vh', disableClose: true, data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: ProcesoDTO) => { if (result) { this.reload(); if (this.activeTab() === 1) this.loadTree(); } });
    }

    openTransitions(process: ProcesoDTO): void {
        // Navegar a transiciones - se implementará en el routing
    }

    openProperties(item: ProcesoDTO): void {
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: item.llaveTabla, tipoOrigen: 'P', titulo: item.nombre }
        });
    }

    toggleStatus(item: ProcesoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} proceso?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateProcess(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Proceso ${action}do correctamente`, 'success'); this.reload(); if (this.activeTab() === 1) this.loadTree(); }, error: () => this.notificationCenter.fire('Error', `No se pudo ${action} el proceso`, 'error') }); }});
    }
}
