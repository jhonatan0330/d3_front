import { Component, Input, forwardRef, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { ProcesoDTO, ProcesoFilterDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';

@Component({
    selector: 'app-process-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, OverlayModule],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProcessSelectorComponent), multi: true }
    ],
    templateUrl: './process-selector.component.html'
})
export class ProcessSelectorComponent implements ControlValueAccessor, OnInit {
    private processService = inject(ProcessService);
    private cdr = inject(ChangeDetectorRef);

    @Input() label = 'Proceso';
    @Input() placeholder = 'Buscar proceso...';

    readonly showDropdown = signal(false);
    readonly query = signal('');
    readonly displayValue = signal('');
    readonly filteredProcesos = signal<ProcesoDTO[]>([]);
    readonly disabled = signal(false);

    readonly overlayPositions: ConnectedPosition[] = [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    ];

    private procesos: ProcesoDTO[] = [];
    private selectedKey = '';
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit(): void {
        this.loadProcesses();
    }

    private loadProcesses(): void {
        const filter = new ProcesoFilterDTO();
        filter.estado = 'A';
        filter.paginacionRegistroInicial = 0;
        filter.paginacionRegistroFinal = 1000;
        this.processService.getProcesses(filter).subscribe({
            next: (res) => {
                this.procesos = res ?? [];
                this.applyFilter();
                this.syncSelectedProcessDisplay();
                this.cdr.markForCheck();
            },
            error: () => {
                this.procesos = [];
                this.filteredProcesos.set([]);
                this.cdr.markForCheck();
            }
        });
    }

    onInput(event: Event): void {
        this.query.set((event.target as HTMLInputElement).value);
        this.applyFilter();
    }

    onFocus(): void {
        this.onTouched();
        this.applyFilter();
        this.showDropdown.set(true);
    }

    onBlur(): void {
        setTimeout(() => this.showDropdown.set(false), 200);
    }

    closeDropdown(): void {
        this.showDropdown.set(false);
    }

    private applyFilter(): void {
        const q = this.query().trim().toLowerCase();
        if (!q) {
            this.filteredProcesos.set(this.procesos);
        } else {
            this.filteredProcesos.set(this.procesos.filter(p =>
                (p.nombre || '').toLowerCase().includes(q) ||
                (p.codigo || '').toLowerCase().includes(q)
            ));
        }
    }

    selectProcess(process: ProcesoDTO): void {
        this.onTouched();
        this.selectedKey = process.llaveTabla;
        this.displayValue.set(process.nombre);
        this.query.set('');
        this.showDropdown.set(false);
        this.onChange(this.selectedKey);
    }

    clear(event: Event): void {
        event.stopPropagation();
        this.selectedKey = '';
        this.displayValue.set('');
        this.query.set('');
        this.showDropdown.set(false);
        this.onChange('');
    }

    private syncSelectedProcessDisplay(): void {
        if (!this.selectedKey) {
            this.displayValue.set('');
            return;
        }

        const found = this.procesos.find(p => p.llaveTabla === this.selectedKey);
        if (found) {
            this.displayValue.set(found.nombre || found.codigo || this.selectedKey);
            return;
        }

        this.loadDisplay(this.selectedKey);
    }

    private loadDisplay(key: string): void {
        this.processService.getProcessById(key).subscribe({
            next: (process) => {
                this.displayValue.set(process?.nombre || process?.codigo || key);
                this.cdr.markForCheck();
            },
            error: () => {
                this.displayValue.set(key);
                this.cdr.markForCheck();
            }
        });
    }

    writeValue(value: string): void {
        this.selectedKey = value || '';
        this.displayValue.set('');
        this.query.set('');
        if (this.selectedKey) {
            this.syncSelectedProcessDisplay();
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }
}
