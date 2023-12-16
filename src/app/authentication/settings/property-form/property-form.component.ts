import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PropertyService } from 'app/authentication/property.service';
import { PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';


@Component({
    selector: 'core-property-form',
    templateUrl: './property-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class PropertyForm implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    key: string;
    type: PropiedadValorDefinidoDTO;
    typeValue: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<PropertyForm>,
        private _formBuilder: UntypedFormBuilder,
        private propertyService: PropertyService
    ) {
    }

    ngOnInit(): void {
        if (!this.data) { this.matDialogRef.close(); }

        if (!this.data.type && !this.data.key) {
            this.matDialogRef.close();
        }
        this.type = this.data.type;
        if (this.type) { this.typeValue = this.type.llaveTabla; }
        this.key = this.data.key;

        this.form = this._formBuilder.group({
            llaveTabla: [this.key],
            propiedadValor: [this.typeValue],
            tipo: [''],
            nombre: [''],
            key: [''],
            campo: [''],
            valor: [''],
            texto: [''],
            motivo: [''],
            bloqueo: [''],
            fechaFinal: [''],
            fechaInicial: [''],
            rol: [''],
            rolNombre: [''],
            rolExcluyente: [''],
            rolExcluyenteNombre: [''],
            usuario: [''],
            usuarioNombre: [''],
            usuarioExcluyente: [''],
            usuarioExcluyenteNombre: ['']
        });

        if (!this.key) {
            this.propertyService.getProperty(this.key)
                .subscribe(x => this.form.patchValue(x));
        }
    }

    send(): void {
        this.loading = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (!this.key) {
            this.create();
        } else {
            this.update();
        }


    }

    private create() {
        this.propertyService.createProperty(this.form.value)
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
        this.matDialogRef.close();
    }

}
