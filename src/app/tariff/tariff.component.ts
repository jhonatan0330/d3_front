import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TarifaDTO } from './tariff.domain';
import { TariffService } from './tariff.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import Swal from 'sweetalert2';
import { FieldHelper, MVCTranslate } from 'app/shared/plantilla-helper';
import { FeeFormComponent } from './fee-form/fee-form.component';


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
    titleDim1: string = 'DIMENSION 1';
    titleDim2: string = 'DIMENSION 2';
    titleDim3: string = 'DIMENSION 3';
    titleDim4: string = 'DIMENSION 4';

    data: TarifaDTO[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private templateService: TemplateService,
        private dialog: MatDialog,
        private api: ApiService,
        public tariffService: TariffService) {
    }

    ngOnInit(): void {

        this.route.params.subscribe((params: Params) => {
            this.plantillaId = params.templateId;
            this.tariffId = params.tariffId;
            if (this.plantillaId) {
                this.plantilla = this.templateService.getTemplate(this.plantillaId, null);
                this.startForm();
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

    showFee(fee: TarifaDTO){
        if (!this.tariffDocument) { return; }
        const dialogRef = this.dialog.open(FeeFormComponent, {
            data: { tariff: this.tariffDocument, parentId: fee.llaveTabla },
            disableClose: true, 
        });
        dialogRef.afterClosed().subscribe(() => this.getFees());
    }

}
