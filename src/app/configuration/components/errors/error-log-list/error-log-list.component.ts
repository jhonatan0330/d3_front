import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ErrorLogService } from 'app/configuration/configuracion.api';
import {
    ReporteEjecucionDTO,
    TransaccionErrorDTO,
    UsuarioSesionErrorDTO,
} from 'app/configuration/domain/ErrorLogDTO';

type ErrorTab = 'session' | 'report' | 'transaction';

@Component({
    selector: 'app-error-log-list',
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
    templateUrl: './error-log-list.component.html',
})
export class ErrorLogListComponent implements AfterViewInit, OnDestroy {
    private service = inject(ErrorLogService);
    @ViewChild('loadMoreErrors') loadMoreErrorsRef!: ElementRef<HTMLDivElement>;
    private observer?: IntersectionObserver;

    private readonly pageSize = 50;

    activeTab = signal<ErrorTab>('session');
    loading = signal(false);
    hasMore = signal(true);
    searched = signal(false);
    errorMessage = signal('');

    fechaDesde: Date | null = null;
    fechaHasta: Date | null = null;

    sessionRows = signal<UsuarioSesionErrorDTO[]>([]);
    reportRows = signal<ReporteEjecucionDTO[]>([]);
    transactionRows = signal<TransaccionErrorDTO[]>([]);

    sessionFilter = { sesion: '', ip: '' };
    reportFilter = { reporte: '', documento: '', usuario: '' };
    transactionFilter = { usuario: '' };

    sessionColumns = ['sesion', 'ip', 'fecha', 'error'];
    reportColumns = ['reporte', 'documento', 'usuario', 'fechaInicio', 'fechaFin', 'url', 'error'];
    transactionColumns = ['usuario', 'fechaInicio', 'fechaFin', 'entrada', 'error'];

    ngAfterViewInit(): void {
        this.observer = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) this.loadNext();
        });
        this.observer.observe(this.loadMoreErrorsRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }

    datesValid(): boolean {
        return !!(this.fechaDesde && this.fechaHasta);
    }

    selectTab(tab: ErrorTab): void {
        if (this.activeTab() === tab) return;
        this.activeTab.set(tab);
        this.reset();
        if (this.datesValid()) this.loadNext();
    }

    search(): void {
        if (!this.datesValid()) return;
        this.reset();
        this.loadNext();
    }

    clearFilters(): void {
        this.fechaDesde = null;
        this.fechaHasta = null;
        this.sessionFilter = { sesion: '', ip: '' };
        this.reportFilter = { reporte: '', documento: '', usuario: '' };
        this.transactionFilter = { usuario: '' };
        this.reset();
    }

    loadNext(): void {
        if (!this.datesValid() || this.loading() || !this.hasMore()) return;
        this.loading.set(true);
        this.searched.set(true);
        this.errorMessage.set('');

        const desde = this.startOfDay(this.fechaDesde!);
        const hasta = this.endOfDay(this.fechaHasta!);
        const offset = this.currentRows().length;
        const pagination = {
            paginacionRegistroInicial: offset,
            paginacionRegistroFinal: this.pageSize
        };

        switch (this.activeTab()) {
            case 'session':
                this.service.getSessionErrors({
                    ...this.clean(this.sessionFilter),
                    fechaMin: desde,
                    fechaMax: hasta,
                    ...pagination
                }).subscribe({
                    next: (res) => {
                        this.sessionRows.update(rows => [...rows, ...res]);
                        this.afterLoad(res.length);
                    },
                    error: (err) => this.onError(err)
                });
                break;
            case 'report':
                this.service.getReportErrors({
                    ...this.clean(this.reportFilter),
                    fechaInicioMin: desde,
                    fechaInicioMax: hasta,
                    ...pagination
                }).subscribe({
                    next: (res) => {
                        this.reportRows.update(rows => [...rows, ...res]);
                        this.afterLoad(res.length);
                    },
                    error: (err) => this.onError(err)
                });
                break;
            case 'transaction':
                this.service.getTransactionErrors({
                    ...this.clean(this.transactionFilter),
                    fechaInicioMin: desde,
                    fechaInicioMax: hasta,
                    ...pagination
                }).subscribe({
                    next: (res) => {
                        this.transactionRows.update(rows => [...rows, ...res]);
                        this.afterLoad(res.length);
                    },
                    error: (err) => this.onError(err)
                });
                break;
        }
    }

    currentRows(): Array<UsuarioSesionErrorDTO | ReporteEjecucionDTO | TransaccionErrorDTO> {
        switch (this.activeTab()) {
            case 'session': return this.sessionRows();
            case 'report': return this.reportRows();
            case 'transaction': return this.transactionRows();
        }
    }

    private reset(): void {
        this.loading.set(false);
        this.hasMore.set(true);
        this.searched.set(false);
        this.errorMessage.set('');
        this.sessionRows.set([]);
        this.reportRows.set([]);
        this.transactionRows.set([]);
    }

    private afterLoad(count: number): void {
        this.loading.set(false);
        if (count < this.pageSize) this.hasMore.set(false);
        this.checkMore();
    }

    private onError(err: unknown): void {
        this.loading.set(false);
        this.errorMessage.set(typeof err === 'string' ? err : 'No fue posible consultar los errores');
    }

    private checkMore(): void {
        requestAnimationFrame(() => {
            if (this.loading() || !this.hasMore() || this.currentRows().length === 0) return;
            const rect = this.loadMoreErrorsRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadNext();
        });
    }

    private clean(filter: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(filter)) {
            if (value !== '' && value !== null && value !== undefined) result[key] = value;
        }
        return result;
    }

    private startOfDay(date: Date): Date {
        const value = new Date(date);
        value.setHours(0, 0, 0, 0);
        return value;
    }

    private endOfDay(date: Date): Date {
        const value = new Date(date);
        value.setHours(23, 59, 59, 999);
        return value;
    }
}
