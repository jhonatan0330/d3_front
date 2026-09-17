import { Component, Input, forwardRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';

@Component({
    selector: 'app-process-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProcessSelectorComponent), multi: true }
    ],
    templateUrl: './process-selector.component.html',
    styleUrl: './process-selector.component.scss'
})
export class ProcessSelectorComponent implements ControlValueAccessor, OnInit {
    private processService = inject(ProcessService);
    private cdr = inject(ChangeDetectorRef);

    @Input() label = 'Proceso';
    @Input() placeholder = 'Buscar proceso...';

    procesos: ProcesoDTO[] = [];
    filteredProcesos: ProcesoDTO[] = [];
    displayValue = '';
    query = '';
    showDropdown = false;
    disabled = false;
    private selectedKey = '';
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit(): void {
        this.loadProcesses();
    }

    private loadProcesses(): void {
        this.processService.getProcesses({
            estado: 'A',
            nombre: '',
            codigo: '',
            tipo: '',
            imagen: '',
            prioridad: 0,
            macroproceso: '',
            macroNombre: '',
            paginacionRegistroInicial: 0,
            paginacionRegistroFinal: 1000,
            filtroParametro: '',
            llaveTabla: ''
        }).subscribe({
            next: (res) => {
                this.procesos = res;
                this.applyFilter();
                if (this.selectedKey) this.setDisplayFromList();
                this.cdr.markForCheck();
            },
            error: () => { this.procesos = []; this.cdr.markForCheck(); }
        });
    }

    onInput(event: Event): void {
        this.query = (event.target as HTMLInputElement).value;
        this.applyFilter();
    }

    onFocus(): void {
        this.onTouched();
        this.showDropdown = true;
    }

    onBlur(): void {
        setTimeout(() => { this.showDropdown = false; }, 200);
    }

    private applyFilter(): void {
        const q = this.query.trim().toLowerCase();
        if (!q) {
            this.filteredProcesos = this.procesos;
        } else {
            this.filteredProcesos = this.procesos.filter(p =>
                (p.nombre || '').toLowerCase().includes(q) ||
                (p.codigo || '').toLowerCase().includes(q)
            );
        }
    }

    selectProcess(process: ProcesoDTO): void {
        this.onTouched();
        this.selectedKey = process.llaveTabla;
        this.displayValue = process.nombre;
        this.query = '';
        this.showDropdown = false;
        this.onChange(this.selectedKey);
    }

    clear(event: Event): void {
        event.stopPropagation();
        this.selectedKey = '';
        this.displayValue = '';
        this.query = '';
        this.showDropdown = false;
        this.onChange('');
    }

    private setDisplayFromList(): void {
        const found = this.procesos.find(p => p.llaveTabla === this.selectedKey);
        this.displayValue = found ? found.nombre : this.selectedKey;
    }

    private loadDisplay(key: string): void {
        this.processService.getProcessById(key).subscribe({
            next: (process) => { this.displayValue = process.nombre; this.cdr.markForCheck(); },
            error: () => { this.displayValue = key; this.cdr.markForCheck(); }
        });
    }

    writeValue(value: string): void {
        this.selectedKey = value || '';
        this.displayValue = '';
        this.query = '';
        if (this.selectedKey) {
            if (this.procesos.length > 0) this.setDisplayFromList();
            else this.loadDisplay(this.selectedKey);
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}