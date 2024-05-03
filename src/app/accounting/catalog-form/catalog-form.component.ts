import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountingService } from '../accounting.service';
import { CatalogDTO } from '../accounting.domain';

@Component({
    selector: 'account-catalog-form',
    templateUrl: './catalog-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CatalogFormComponent implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    key: string;
    tituloAccion: string = "Nuevo Catalogo";
    botonAccion: string = "Guardar";

    constructor(
        public matDialogRef: MatDialogRef<CatalogFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        private accountingService: AccountingService,
        @Inject(MAT_DIALOG_DATA) public catalog: CatalogDTO
    ) {
        if (this.catalog != null) {
            this.tituloAccion = "Editar Catalogo";
            this.botonAccion = "Actualizar";
        }
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            name: [''],
            code: [''],
            initialDate: [''],
            finalDate: ['']
        });


        if (!this.key) {
            this.accountingService.getCatalog(this.key)
                .subscribe(x => this.form.patchValue(x));
        }

        if (this.catalog != null) {

            this.form = this._formBuilder.group({
                name: [this.catalog.name],
                code: [this.catalog.code],
                initialDate: [this.catalog.initialDate],
                finalDate: [this.catalog.finalDate]
            });
        }


    }

    send(): void {
        this.loading = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.catalog == null) {
            this.create();
        } else {
            this.update();
        }

    }

    private create() {
        this.accountingService.createCatalog(this.form.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    private update() {
        this.accountingService.updateCatalog(this.form.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

}
