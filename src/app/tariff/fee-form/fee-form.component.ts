import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TariffService } from '../tariff.service';
import { TarifaDTO, TarifarioDTO } from '../tariff.domain';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Component({
    selector: 'tariff-fee-form',
    templateUrl: './fee-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FeeFormComponent implements OnInit {

    form: UntypedFormGroup;
    loading = false;
    key: string;
    fee: TarifaDTO;

    private tariff: PedidoVentaDTO;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<FeeFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        private tariffService: TariffService
    ) {
    }

    ngOnInit(): void {
        if (!this.data || !this.data.tariff) { 
            this.matDialogRef.close();
            return; 
        }
        this.tariff = this.data.tariff;
        this.key = this.data.parentId;
        
        this.form = this._formBuilder.group({
            tarifario: [this.tariff.llaveTabla],
            tarifarioNombre: [this.tariff.descripcion],
            producto: [''],
            productoNombre: [''],
            recurso: [''],
            recursoNombre: [''],
            rangoPrecios: [''],
            valorMinimo: [''],
            valor: [''],
            valorMaximo: [''],
            cantidadMinima: [''],
            cantidadMaxima: [''],
            totalMinimo: [''],
            dimension2: [''],
            dimension2Nombre: [''],
            dimension3: [''],
            dimension3Nombre: [''],
            dimension4: [''],
            dimension4Nombre: [''],
            createdAt: [''],
            createdUser: [''],
            updatedAt: [''],
            updatedUser: ['']
        });

        if (this.key) {
            this.tariffService.getFee(this.key)
                .subscribe(x => this.form.patchValue(x));
        }
    }

    send(): void {
        this.loading = true;

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
        this.tariffService.createFee(this.form.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                    this.loading = false;
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    private update() {
        this.tariffService.updateFee(this.form.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                    this.loading = false;
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

}
