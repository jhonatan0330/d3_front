import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TarifaDTO, TariffOptionDTO } from './tariff.domain';
import { TariffService } from './tariff.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import Swal from 'sweetalert2';
import { FieldHelper, MVCTranslate } from 'app/shared/plantilla-helper';
import { FeeFormComponent } from './fee-form/fee-form.component';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, debounceTime } from 'rxjs';


@Component({
    selector: 'tariff',
    templateUrl: './tariff.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class TariffComponent implements OnInit {

    plantillaId: string;
    tariffId: string;

    plantilla: DocumentoPlantillaDTO;
    tariffDocument: PedidoVentaDTO; // Contiene la data del tarifario

    title: string;
    isLoading = false;

    displayedColumns: string[] = ['valor'];
    titleDim1: string;
    titleDim2: string;
    titleDim3: string;
    titleDim4: string;
    viewProduct = false;
    form: UntypedFormGroup;

    data: TarifaDTO[] = [];

    public filteredOptionsP: Observable<TariffOptionDTO[]>;
    public filteredOptions1: Observable<TariffOptionDTO[]>;
    public filteredOptions2: Observable<TariffOptionDTO[]>;
    public filteredOptions3: Observable<TariffOptionDTO[]>;
    public filteredOptions4: Observable<TariffOptionDTO[]>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private templateService: TemplateService,
        private dialog: MatDialog,
        private api: ApiService,
        private _formBuilder: UntypedFormBuilder,
        public tariffService: TariffService) {
    }

    ngOnInit(): void {

        this.form = this._formBuilder.group({
            productoNombre: [''],
            recursoNombre: [''],
            dimension2Nombre: [''],
            dimension3Nombre: [''],
            dimension4Nombre: ['']
        });

        this.route.params.subscribe((params: Params) => {
            this.plantillaId = params.templateId;
            this.tariffId = params.tariffId;
            if (this.plantillaId) {
                this.plantilla = this.templateService.getTemplate(this.plantillaId, null);
                this.startForm();
                this.configureFormActions();
            } else {
                this.router.navigate(['/main']);
            }
        });
        this.dialog.closeAll();
    }

    startForm() {
        if (!this.plantilla || !this.tariffId) {
            this.router.navigate(['/main']);
        } else {
            const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
            entity.llaveTabla = this.tariffId;
            this.api.consultarDocumento(entity, this.plantilla.server).subscribe({
                next: (_value: PedidoVentaDTO) => {
                    this.tariffDocument = _value;
                    this.title = FieldHelper.getValueText(this.tariffDocument, "NOMBRE");
                    if (FieldHelper.getValueBool(this.tariffDocument, "RANGO_CANTIDADES")) {
                        this.displayedColumns.unshift('cantidadMinima');
                    }
                    if (FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_4")) {
                        this.displayedColumns.unshift('dimension4Nombre');
                        this.titleDim4 = FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_4");
                    }
                    if (FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_3")) {
                        this.displayedColumns.unshift('dimension3Nombre');
                        this.titleDim3 = FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_3");
                    }
                    if (FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_2")) {
                        this.displayedColumns.unshift('dimension2Nombre');
                        this.titleDim2 = FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_2");
                    }
                    if (FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_1")) {
                        this.displayedColumns.unshift('recursoNombre');
                        this.titleDim1 = FieldHelper.getValueText(this.tariffDocument, "NOMBRE_DIM_1");
                    }
                    if (!FieldHelper.getValueBool(this.tariffDocument, "PRODUCTO_OPCIONAL")) {
                        this.viewProduct = true;
                        this.displayedColumns.unshift('productoNombre');
                    }
                },
                error: () => {
                    Swal.fire('No data', 'No se identifica el tarifario');
                }
            });
        }
    }

    getFees() {
        const filter: TarifaDTO = new TarifaDTO();
        filter.documento = this.tariffId;
        if (this.form.controls['productoNombre'].value && this.form.controls['productoNombre'].value.productId)
            filter.producto = this.form.controls['productoNombre'].value.productId;
        if (this.form.controls['recursoNombre'].value && this.form.controls['recursoNombre'].value.key)
            filter.recurso = this.form.controls['recursoNombre'].value.key;
        if (this.form.controls['dimension2Nombre'].value && this.form.controls['dimension2Nombre'].value.key)
            filter.dimension2 = this.form.controls['dimension2Nombre'].value.key;
        if (this.form.controls['dimension3Nombre'].value && this.form.controls['dimension3Nombre'].value.key)
            filter.dimension3 = this.form.controls['dimension3Nombre'].value.key;
        if (this.form.controls['dimension4Nombre'].value && this.form.controls['dimension4Nombre'].value.key)
            filter.dimension4 = this.form.controls['dimension4Nombre'].value.key;
        this.isLoading = true;
        this.tariffService.getFeesFromTariff(filter).subscribe({
            next: (_tarifas: TarifaDTO[]) => {
                this.data = _tarifas;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    showFee(fee: TarifaDTO) {
        if (!this.tariffDocument) { return; }
        const dialogRef = this.dialog.open(FeeFormComponent, {
            data: { tariff: this.tariffDocument, parentId: fee.llaveTabla },
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => this.getFees());
    }

    createFee() {
        if (!this.tariffDocument) { return; }
        const dialogRef = this.dialog.open(FeeFormComponent, {
            data: { tariff: this.tariffDocument },
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => this.getFees());
    }

    // Copiado de fee form
    configureFormActions() {
        this.form.controls['productoNombre'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    return;
                } else {
                    if (text.length < 3) return;
                }
                this.filteredOptionsP = this.tariffService.getDimensionToTariff(this.tariffId, "P", text);
            });

        this.form.controls['recursoNombre'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    return;
                } else {
                    if (text.length < 3) return;
                }
                this.filteredOptions1 = this.tariffService.getDimensionToTariff(this.tariffId, "1", text);
            });

        this.form.controls['dimension2Nombre'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    return;
                } else {
                    if (text.length < 3) return;
                }
                this.filteredOptions2 = this.tariffService.getDimensionToTariff(this.tariffId, "2", text);
            });

        this.form.controls['dimension3Nombre'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    return;
                } else {
                    if (text.length < 3) return;
                }
                this.filteredOptions3 = this.tariffService.getDimensionToTariff(this.tariffId, "3", text);
            });

        this.form.controls['dimension4Nombre'].valueChanges
            .pipe(debounceTime(500))
            .subscribe((text) => {
                if (!text) { return; }
                if (text.key) {
                    return;
                } else {
                    if (text.length < 3) return;
                }
                this.filteredOptions4 = this.tariffService.getDimensionToTariff(this.tariffId, "4", text);
            });
    }

    displayFn(acc): string {
        if (!acc) return '';
        if (acc.key) {
            if(!acc.code) return acc.name;
            return acc.code + " | " +  acc.name;
        }
        return acc;
    }

}
