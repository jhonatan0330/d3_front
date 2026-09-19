import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { WebServiceEjecucionDTO, WebServiceEjecucionFilterDTO } from 'app/document/document.types';
import { WebServiceConfigService } from 'app/configuration/configuracion.api';

@Component({
    selector: 'app-web-service-execute-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './web-service-execute-list.component.html',
})
export class WebServiceExecuteListComponent implements OnInit, AfterViewInit, OnDestroy {
    private service = inject(WebServiceConfigService);
    @ViewChild('loadMoreExec') loadMoreExecRef!: ElementRef<HTMLDivElement>;
    private execObserver?: IntersectionObserver;

    private readonly pageSize = 25;

    execLoading = signal(false);
    execData = signal<WebServiceEjecucionDTO[]>([]);
    execCurrentPage = signal(0);
    execHasMore = signal(true);
    execFilter: WebServiceEjecucionFilterDTO = { servicio: '', usuario: '', fechaEjecucionMin: undefined, fechaEjecucionMax: undefined, documento: '', modificador: '', transaccion: '', entrada: '', salida: '', masivo: '', textoRespuesta: '', sincrona: '', paginacionRegistroInicial: 0, paginacionRegistroFinal: 25, filtroParametro: '', llaveTabla: '', estado: 'A' };
    execDisplayedColumns = ['servicio', 'usuario', 'fechaEjecucion', 'entrada', 'salida', 'error', 'sincrona'];

    datesValid(): boolean {
        return !!(this.execFilter.fechaEjecucionMin && this.execFilter.fechaEjecucionMax);
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.execObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadExecNext(); });
        this.execObserver.observe(this.loadMoreExecRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.execObserver?.disconnect();
    }

    loadExecNext(): void {
        if (!this.datesValid()) return;
        if (this.execLoading() || !this.execHasMore()) return;
        this.execLoading.set(true);
        const f = this.execFilter;
        f.paginacionRegistroInicial = this.execCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.service.getExecutions(f).subscribe({
            next: (res) => { this.execData.update(items => [...items, ...res]); this.execCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.execHasMore.set(false); this.execLoading.set(false); this.checkExecMore(); },
            error: () => this.execLoading.set(false)
        });
    }

    private checkExecMore(): void {
        requestAnimationFrame(() => {
            if (this.execLoading() || !this.execHasMore() || this.execData().length === 0) return;
            const rect = this.loadMoreExecRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadExecNext();
        });
    }

    reload(): void {
        this.execCurrentPage.set(0);
        this.execHasMore.set(true);
        this.execData.set([]);
        if (this.datesValid()) {
            this.loadExecNext();
        }
    }

    onExecFilterChange(): void { this.reload(); }
}
