import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TariffService } from '../tariff.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FieldHelper } from 'app/shared/plantilla-helper';

@Component({
    selector: 'tariff-fee-form',
    templateUrl: './fee-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FeeFormComponent implements OnInit {

    form: UntypedFormGroup;
    loading = false;
    key: string;

    titleDim1: string;
    titleDim2: string;
    titleDim3: string;
    titleDim4: string;
    viewQuantity = false;
    range = false;
    viewProduct = false;

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

        this.titleDim1 = FieldHelper.getValueText(this.tariff, "NOMBRE_DIM_1");
        this.titleDim2 = FieldHelper.getValueText(this.tariff, "NOMBRE_DIM_2");
        this.titleDim3 = FieldHelper.getValueText(this.tariff, "NOMBRE_DIM_3");
        this.titleDim4 = FieldHelper.getValueText(this.tariff, "NOMBRE_DIM_4");

        this.viewQuantity = FieldHelper.getValueBool(this.tariff, "RANGO_CANTIDADES");
        this.range = FieldHelper.getValueBool(this.tariff, "RANGO_VALORES");
        this.viewProduct = !FieldHelper.getValueBool(this.tariff, "PRODUCTO_OPCIONAL");
        
        this.form = this._formBuilder.group({
            llaveTabla: [this.key],
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
            this.loading = true;
            this.tariffService.getFee(this.key)
                .subscribe({
                    next: (value) => {
                        this.form.patchValue(value);
                        //this.fee = 
                        this.loading = false;
                    },
                    error:() => {
                        this.loading = false;
                    }
                });
        }
    }

    send(): void {
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
