import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { DocumentoPlantillaDTO } from 'app/document/document.types';
import { DocumentoPlantillaTipoLabel } from 'app/document/form/form.enum';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { DocumentTemplateFormComponent } from '../document-template-form/document-template-form.component';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { DocumentoPlantillaFilterDTO } from 'app/configuration/domain/DocumentoPlantillaFilterDTO';

@Component({
    selector: 'app-document-template-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, MatInputModule, MatFormFieldModule, MatSelectModule, DropdownComponent, DropdownItemComponent, ProcessSelectorComponent],
    templateUrl: './document-template-list.component.html',
})
export class DocumentTemplateListComponent implements OnInit, AfterViewInit, OnDestroy {
    private notificationCenter = inject(NotificationCenterService);
    private service = inject(DocumentTemplateService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMore') loadMoreRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    loading = signal(false);
    data = signal<DocumentoPlantillaDTO[]>([]);
    currentPage = signal(0);
    hasMore = signal(true);
    private readonly pageSize = 25;
    private debounceTimer: any;

    filter: DocumentoPlantillaFilterDTO = {
        estado: 'A',
        nombre: '',
        consecutivo: '',
        imagen: '',
        codigo: '',
        proceso: '',
        tipo: '',
        padre: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: ''
    };

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
        this.service.getTemplates(f).subscribe({ next: (res) => { this.data.update(items => [...items, ...res]); this.currentPage.update(p => p + 1); if (res.length < this.pageSize) this.hasMore.set(false); this.loading.set(false); this.checkMore(); }, error: () => this.loading.set(false) });
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

    onFilterChange(): void { this.reload(); }
    onFilterInput(): void { clearTimeout(this.debounceTimer); this.debounceTimer = setTimeout(() => { this.reload(); }, 200); }

    openForm(item?: DocumentoPlantillaDTO): void {
        const dialogRef = this.dialog.open(DocumentTemplateFormComponent, { width: '900px', maxWidth: '95vw', maxHeight: '95vh', disableClose: true, data: item ? { ...item } : null });
        dialogRef.afterClosed().subscribe((result: DocumentoPlantillaDTO) => { if (result) this.reload(); });
    }

    openProperties(item: DocumentoPlantillaDTO): void {
        this.dialog.open(PropertyPanelComponent, {
            width: '800px', maxWidth: '95vw', maxHeight: '90vh', disableClose: true,
            data: { campoKey: item.llaveTabla, tipoOrigen: 'L', titulo: item.nombre }
        });
    }

    tipoLabel(tipo: string): string {
        return DocumentoPlantillaTipoLabel[tipo] || tipo || '';
    }

    duplicateTemplate(item: DocumentoPlantillaDTO): void {
        this.notificationCenter.fire({ title: '¿Duplicar plantilla?', text: 'Se creará una copia con los mismos campos y reportes.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, duplicar', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { this.service.duplicateTemplate(item.llaveTabla).subscribe({ next: () => { this.notificationCenter.fire('Duplicado', 'Plantilla duplicada correctamente', 'success'); this.reload(); }, error: () => this.notificationCenter.fire('Error', 'No se pudo duplicar la plantilla', 'error') }); }});
    }

    toggleStatus(item: DocumentoPlantillaDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateTemplate(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.reload(); }, error: () => this.notificationCenter.fire('Error', `No se pudo ${action} la plantilla`, 'error') }); }});
    }
}
