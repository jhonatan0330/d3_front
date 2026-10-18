import { Component, Input, forwardRef, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProcesoEstadoDTO } from 'app/document/document.types';
import { ProcessService } from 'app/configuration/configuracion.api';

@Component({
    selector: 'app-state-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StateSelectorComponent), multi: true }
    ],
    templateUrl: './state-selector.component.html'
})
export class StateSelectorComponent implements ControlValueAccessor, OnInit, OnChanges {
    private processService = inject(ProcessService);
    private cdr = inject(ChangeDetectorRef);

    @Input() label = 'Estado';
    @Input() placeholder = 'Buscar estado...';
    @Input() processKey = '';

    estados: ProcesoEstadoDTO[] = [];
    filteredEstados: ProcesoEstadoDTO[] = [];
    displayValue = '';
    query = '';
    showDropdown = false;
    disabled = false;
    private selectedKey = '';
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit(): void {
        this.loadStates();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['processKey'] && !changes['processKey'].firstChange) {
            this.loadStates();
        }
    }

    private loadStates(): void {
        if (!this.processKey) {
            this.estados = [];
            this.filteredEstados = [];
            this.cdr.markForCheck();
            return;
        }
        this.processService.getStates(this.processKey).subscribe({
            next: (res) => {
                this.estados = res;
                this.applyFilter();
                if (this.selectedKey) this.setDisplayFromList();
                this.cdr.markForCheck();
            },
            error: () => { this.estados = []; this.filteredEstados = []; this.cdr.markForCheck(); }
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
            this.filteredEstados = this.estados;
        } else {
            this.filteredEstados = this.estados.filter(e =>
                (e.nombre || '').toLowerCase().includes(q) ||
                (e.codigo || '').toLowerCase().includes(q)
            );
        }
    }

    selectEstado(estado: ProcesoEstadoDTO): void {
        this.onTouched();
        this.selectedKey = estado.llaveTabla;
        this.displayValue = estado.nombre;
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
        const found = this.estados.find(e => e.llaveTabla === this.selectedKey);
        this.displayValue = found ? found.nombre : this.selectedKey;
    }

    writeValue(value: string): void {
        this.selectedKey = value || '';
        this.displayValue = '';
        this.query = '';
        if (this.selectedKey) {
            if (this.estados.length > 0) this.setDisplayFromList();
            else this.displayValue = this.selectedKey;
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
