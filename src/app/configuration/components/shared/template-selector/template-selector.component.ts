import { Component, Input, forwardRef, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
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
    private destroyRef = inject(DestroyRef);

    @Input() label = 'Plantilla';
    @Input() placeholder = 'Buscar plantilla...';

    templates: DocumentoPlantillaDTO[] = [];
    filteredTemplates: DocumentoPlantillaDTO[] = [];
    displayValue = '';
    query = '';
    showDropdown = false;
    disabled = false;
    loading = false;
    noResults = false;
    private selectedKey = '';
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};
    private search$ = new Subject<string>();

    constructor() {
        this.search$.pipe(
            debounceTime(250),
            distinctUntilChanged(),
            switchMap((texto) => {
                const termino = texto.trim();
                if (!termino || termino.length < 2) {
                    this.filteredTemplates = [];
                    this.loading = false;
                    this.noResults = false;
                    return EMPTY;
                }

                this.loading = true;
                this.noResults = false;

                const filter = new DocumentoPlantillaFilterDTO();
                filter.estado = 'A';
                filter.filtroParametro = termino;

                return this.templateService.getTemplates(filter).pipe(
                    map((result) => result ?? []),
                    catchError(() => of([] as DocumentoPlantillaDTO[]))
                );
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((items) => {
            this.filteredTemplates = items;
            this.loading = false;
            this.noResults = this.query.trim().length >= 2 && items.length === 0;
            this.cdr.markForCheck();
        });
    }

    ngOnInit(): void {
        if (this.selectedKey) {
            this.loadDisplay(this.selectedKey);
        }
    }

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.query = value;
        this.showDropdown = true;
        if (value.trim().length < 2) {
            this.filteredTemplates = [];
            this.loading = false;
            this.noResults = false;
            return;
        }
        this.search$.next(value);
    }

    onFocus(): void {
        this.onTouched();
        this.showDropdown = true;
    }

    onBlur(): void {
        setTimeout(() => { this.showDropdown = false; }, 200);
    }

    selectTemplate(template: DocumentoPlantillaDTO): void {
        this.onTouched();
        this.selectedKey = template.llaveTabla;
        this.displayValue = template.nombre || template.codigo || template.llaveTabla;
        this.query = '';
        this.showDropdown = false;
        this.noResults = false;
        this.onChange(this.selectedKey);
    }

    clear(event: Event): void {
        event.stopPropagation();
        this.selectedKey = '';
        this.displayValue = '';
        this.query = '';
        this.filteredTemplates = [];
        this.showDropdown = false;
        this.noResults = false;
        this.onChange('');
    }

    private loadDisplay(key: string): void {
        if (!key) {
            this.displayValue = '';
            return;
        }

        this.templateService.getTemplateById(key).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (template) => {
                this.displayValue = template?.nombre || template?.codigo || key;
                this.cdr.markForCheck();
            },
            error: () => {
                this.displayValue = key;
                this.cdr.markForCheck();
            }
        });
    }

    writeValue(value: string): void {
        this.selectedKey = value || '';
        this.displayValue = '';
        this.query = '';
        this.filteredTemplates = [];
        this.noResults = false;
        if (this.selectedKey) {
            this.loadDisplay(this.selectedKey);
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
