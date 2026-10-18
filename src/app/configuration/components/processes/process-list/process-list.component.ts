import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { NestedTreeControl } from '@angular/cdk/tree';
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
    private debounceTimer: any;

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
    treeControl = new NestedTreeControl<TreeNode>(node => node.children);
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
        if (this.treeLoading()) return;
        this.treeLoading.set(true);
        const f: ProcesoFilterDTO = {
            ...this.filter,
            paginacionRegistroInicial: null as unknown as number,
            paginacionRegistroFinal: null as unknown as number
        };
        this.service.getProcesses(f).subscribe({
            next: (processes) => {
                const roots = this.buildTreeFromList(processes);
                roots.forEach(r => this.treeControl.expand(r));
                this.treeData.set(roots);
                this.treeLoading.set(false);
            },
            error: () => this.treeLoading.set(false)
        });
    }

    private buildTreeFromList(processes: ProcesoDTO[]): TreeNode[] {
        const byKey = new Map<string, ProcesoDTO>();
        processes.forEach(p => byKey.set(p.llaveTabla, p));
        const childrenMap = new Map<string, ProcesoDTO[]>();
        processes.forEach(p => {
            if (!p.macroproceso || p.macroproceso === p.llaveTabla) return;
            if (!childrenMap.has(p.macroproceso)) childrenMap.set(p.macroproceso, []);
            childrenMap.get(p.macroproceso)!.push(p);
        });
        const buildNode = (proceso: ProcesoDTO, level: number, visited: Set<string>): TreeNode => {
            visited.add(proceso.llaveTabla);
            const children = (childrenMap.get(proceso.llaveTabla) || [])
                .filter(c => !visited.has(c.llaveTabla))
                .map(c => buildNode(c, level + 1, visited));
            return { proceso, children, level, expanded: level === 0, isLoading: false };
        };
        const roots = processes.filter(p => !p.macroproceso || p.macroproceso === p.llaveTabla || !byKey.has(p.macroproceso));
        return roots.map(r => buildNode(r, 0, new Set()));
    }

    onTabChange(index: number): void {
        this.activeTab.set(index);
        if (index === 1 && !this.treeLoading()) {
            this.loadTree();
        }
    }

    toggleNode(node: TreeNode): void {
        if (this.treeControl.isExpanded(node)) {
            this.treeControl.collapse(node);
            node.expanded = false;
        } else {
            this.treeControl.expand(node);
            node.expanded = true;
        }
        this.treeData.update(nodes => [...nodes]);
    }

    onFilterChange(): void { this.reload(); if (this.activeTab() === 1) this.loadTree();}
    onFilterInput(): void { clearTimeout(this.debounceTimer); this.debounceTimer = setTimeout(() => { this.reload(); }, 200); }

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
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; const request$ = newEstado === 'A' ? this.service.activateProcess(updated) : this.service.inactivateProcess(updated); request$.subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Proceso ${action}do correctamente`, 'success'); this.reload(); if (this.activeTab() === 1) this.loadTree(); } }); }});
    }
}
