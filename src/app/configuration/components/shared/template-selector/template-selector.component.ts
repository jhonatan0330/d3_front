import { Component, Input, forwardRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentoPlantillaDTO } from 'app/document/document.types';
import { DocumentTemplateService } from 'app/configuration/configuracion.api';
import { DocumentoPlantillaFilterDTO } from 'app/configuration/domain/DocumentoPlantillaFilterDTO';

@Component({
    selector: 'app-template-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TemplateSelectorComponent), multi: true }
    ],
    templateUrl: './template-selector.component.html'
})
export class TemplateSelectorComponent implements ControlValueAccessor, OnInit {
    private templateService = inject(DocumentTemplateService);
    private cdr = inject(ChangeDetectorRef);

    @Input() label = 'Plantilla';
    @Input() placeholder = 'Buscar plantilla...';

    templates: DocumentoPlantillaDTO[] = [];
    filteredTemplates: DocumentoPlantillaDTO[] = [];
    displayValue = '';
    query = '';
    showDropdown = false;
    disabled = false;
    private selectedKey = '';
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit(): void {
        this.loadTemplates();
    }

    private loadTemplates(): void {
        const filter = new DocumentoPlantillaFilterDTO();
        filter.estado = 'A';
        this.templateService.getTemplates(filter).subscribe({
            next: (res) => {
                this.templates = res;
                this.applyFilter();
                if (this.selectedKey) this.setDisplayFromList();
                this.cdr.markForCheck();
            },
            error: () => { this.templates = []; this.cdr.markForCheck(); }
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
            this.filteredTemplates = this.templates;
        } else {
            this.filteredTemplates = this.templates.filter(t =>
                (t.nombre || '').toLowerCase().includes(q) ||
                (t.codigo || '').toLowerCase().includes(q)
            );
        }
    }

    selectTemplate(template: DocumentoPlantillaDTO): void {
        this.onTouched();
        this.selectedKey = template.llaveTabla;
        this.displayValue = template.nombre;
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
        const found = this.templates.find(t => t.llaveTabla === this.selectedKey);
        this.displayValue = found ? found.nombre : this.selectedKey;
    }

    private loadDisplay(key: string): void {
        this.templateService.getTemplateById(key).subscribe({
            next: (template) => { this.displayValue = template.nombre; this.cdr.markForCheck(); },
            error: () => { this.displayValue = key; this.cdr.markForCheck(); }
        });
    }

    writeValue(value: string): void {
        this.selectedKey = value || '';
        this.displayValue = '';
        this.query = '';
        if (this.selectedKey) {
            if (this.templates.length > 0) this.setDisplayFromList();
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
