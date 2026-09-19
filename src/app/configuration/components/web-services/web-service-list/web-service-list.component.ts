import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { WebServiceDTO, WebServiceFilterDTO } from 'app/document/document.types';
import { WebServiceConfigService } from 'app/configuration/configuracion.api';
import { WebServiceFormComponent } from '../web-service-form/web-service-form.component';
import { WebServiceExecuteDialogComponent } from '../web-service-execute-dialog/web-service-execute-dialog.component';
import { PropertyPanelComponent } from '../../shared/property-panel/property-panel.component';
import { ProcessSelectorComponent } from '../../shared/process-selector/process-selector.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-web-service-list',
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        MatTabsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule, DropdownComponent, DropdownItemComponent, ProcessSelectorComponent
    ],
    templateUrl: './web-service-list.component.html',
})
export class WebServiceListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(WebServiceConfigService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMoreWs') loadMoreWsRef!: ElementRef<HTMLDivElement>;
    private wsObserver?: IntersectionObserver;
    private notificationCenter = inject(NotificationCenterService);   

    private readonly pageSize = 25;

    // Web Services
    wsLoading = signal(false);
    wsData = signal<WebServiceDTO[]>([]);
    wsCurrentPage = signal(0);
    wsHasMore = signal(true);
    wsFilter: WebServiceFilterDTO = { estado: 'A', nombre: '', codigo: '', proceso: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25, filtroParametro: '', llaveTabla: '' };

    ngOnInit(): void {
        this.loadWsNext();
    }

    ngAfterViewInit(): void {
        this.wsObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadWsNext(); });
        this.wsObserver.observe(this.loadMoreWsRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.wsObserver?.disconnect();
    }

    loadWsNext(): void {
        if (this.wsLoading() || !this.wsHasMore()) return;
        this.wsLoading.set(true);
        const f = this.wsFilter;
        f.paginacionRegistroInicial = this.wsCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.service.getWebServices(f).subscribe({
            next: (res) => { this.wsData.update(items => [...items, ...res]); this.wsCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.wsHasMore.set(false); this.wsLoading.set(false); this.checkWsMore(); },
            error: () => this.wsLoading.set(false)
        });
    }

    private checkWsMore(): void {
        requestAnimationFrame(() => {
            if (this.wsLoading() || !this.wsHasMore() || this.wsData().length === 0) return;
            const rect = this.loadMoreWsRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadWsNext();
        });
    }

    reload(): void {
        this.wsCurrentPage.set(0);
        this.wsHasMore.set(true);
        this.wsData.set([]);
        this.loadWsNext();
    }

    onWsFilterChange(): void { this.reload(); }

    openForm(item?: WebServiceDTO): void {
        const dialogRef = this.dialog.open(WebServiceFormComponent, {
            disableClose: true,
            width: '700px', maxWidth: '90vw', data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: WebServiceDTO) => { if (result) this.reload(); });
    }

    openExecuteDialog(ws: WebServiceDTO): void {
        const dialogRef = this.dialog.open(WebServiceExecuteDialogComponent, {
            disableClose: true,
            width: '600px', maxWidth: '90vw', data: { webService: ws }
        });
        dialogRef.afterClosed().subscribe((result) => { if (result) this.reload(); });
    }

    openProperties(item: WebServiceDTO): void {
        this.dialog.open(PropertyPanelComponent, {
            disableClose: true,
            width: '800px', maxWidth: '95vw', maxHeight: '90vh',
            data: { campoKey: item.llaveTabla, tipoOrigen: 'W', titulo: item.nombre }
        });
    }

    toggleStatus(item: WebServiceDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        this.notificationCenter.fire({ title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} web service?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' })
            .then((result) => { if (result.isConfirmed) { const updated = { ...item, estado: newEstado }; this.service.inactivateWebService(updated).subscribe({ next: () => { this.notificationCenter.fire('Éxito', `Web Service ${action}do correctamente`, 'success'); this.reload(); }, error: () => this.notificationCenter.fire('Error', `No se pudo ${action} el web service`, 'error') }); }});
    }
}
