import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TariffService } from '../tariff.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { FieldHelper } from 'app/shared/plantilla-helper';
import { Observable, debounceTime } from 'rxjs';
import { TariffOptionDTO } from '../tariff.domain';
import Swal from 'sweetalert2';

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

    public filteredOptionsP: Observable<TariffOptionDTO[]>;
    public filteredOptions1: Observable<TariffOptionDTO[]>;
    public filteredOptions2: Observable<TariffOptionDTO[]>;
    public filteredOptions3: Observable<TariffOptionDTO[]>;
    public filteredOptions4: Observable<TariffOptionDTO[]>;

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
            tarifario: [''],
            tarifarioNombre: [this.tariff.descripcion],
            documento: [this.tariff.llaveTabla],
            producto: [''],
            productoDTO: [''],
            productoNombre: [''],
            recurso: [''],
            recursoDTO: [''],
            recursoNombre: [''],
            rangoPrecios: [''],
            valorMinimo: [''],
            valor: [''],
            valorMaximo: [''],
            cantidadMinima: [''],
            cantidadMaxima: [''],
            totalMinimo: [''],
            dimension2: [''],
            dimension2DTO: [''],
            dimension2Nombre: [''],
            dimension3: [''],
            dimension3DTO: [''],
            dimension3Nombre: [''],
            dimension4: [''],
            dimension4DTO: [''],
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
                        if (value.producto) { value.productoDTO = value.productoNombre; }
                        if (value.recurso) { value.recursoDTO = value.recursoNombre; }
                        if (value.dimension2) { value.dimension2DTO = value.dimension2Nombre; }
                        if (value.dimension3) { value.dimension3DTO = value.dimension3Nombre; }
                        if (value.dimension4) { value.dimension4DTO = value.dimension4Nombre; }
                        this.form.patchValue(value);
                        this.loading = false;
                        this.configureFormActions();
                    },
                    error: () => {
                        this.loading = false;
                    }
                });
        } else { this.configureFormActions(); }
    }

    configureFormActions() {
        this.form.controls['productoDTO'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    this.form.controls['producto'].setValue(text.productId);
                    return;
                } else {
                    this.form.controls['producto'].setValue(null);
                    if (text.length < 3) return;
                }
                this.filteredOptionsP = this.tariffService.getDimensionToTariff(this.tariff.llaveTabla, "P", text);
            });

        this.form.controls['recursoDTO'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    this.form.controls['recurso'].setValue(text.key);
                    return;
                } else {
                    this.form.controls['recurso'].setValue(null);
                    if (text.length < 3) return;
                }
                this.filteredOptions1 = this.tariffService.getDimensionToTariff(this.tariff.llaveTabla, "1", text);
            });

        this.form.controls['dimension2DTO'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    this.form.controls['dimension2'].setValue(text.key);
                    return;
                } else {
                    this.form.controls['dimension2'].setValue(null);
                    if (text.length < 3) return;
                }
                this.filteredOptions2 = this.tariffService.getDimensionToTariff(this.tariff.llaveTabla, "2", text);
            });

        this.form.controls['dimension3DTO'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    this.form.controls['dimension3'].setValue(text.key);
                    return;
                } else {
                    this.form.controls['dimension3'].setValue(null);
                    if (text.length < 3) return;
                }
                this.filteredOptions3 = this.tariffService.getDimensionToTariff(this.tariff.llaveTabla, "3", text);
            });

        this.form.controls['dimension4DTO'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    this.form.controls['dimension4'].setValue(text.key);
                    return;
                } else {
                    this.form.controls['dimension4'].setValue(null);
                    if (text.length < 3) return;
                }
                this.filteredOptions4 = this.tariffService.getDimensionToTariff(this.tariff.llaveTabla, "4", text);
            });
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
                error: () => {
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
                error: () => {
                    this.loading = false;
                }
            });
    }

    displayFn(acc): string {
        if (!acc) return '';
        if (acc.key) {
            if (!acc.code) return acc.name;
            return acc.code + " | " + acc.name;
        }
        return acc;
    }

    deleteFee() {
        Swal.fire({
            title: "Estas seguro de eliminar?",
            showCancelButton: true,
            confirmButtonText: "Si, estoy seguro"
        }).then((result) => {
            if (result.isConfirmed) {
                this.tariffService.deleteFee(this.key)
                    .subscribe({
                        next: () => {
                            this.matDialogRef.close();
                            this.loading = false;
                        },
                        error: () => {
                            this.loading = false;
                        }
                    });
            }
        });
    }
}
