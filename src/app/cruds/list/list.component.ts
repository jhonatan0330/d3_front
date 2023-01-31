import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import {
    DocumentoPlantillaDTO,
    PedidoVentaDTO,
    ReporteBaseDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { SelectionModel } from '@angular/cdk/collections';
import {
    LocalConstants,
    LocalStoreService,
} from 'app/shared/services/local-store.service';
import Swal from 'sweetalert2';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { CrudsService } from '../cruds.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'cruds-list',
    templateUrl: './list.component.html'
})
export class CrudsListComponent implements OnInit, OnDestroy {
    @Input("sidebar") _crudsComponent: MatDrawer;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public plantilla: DocumentoPlantillaDTO; // Estructura base de la lista
    public dataProvider: PedidoVentaDTO[] = []; // Conjunto de documentos a visualizar

    viewMode = 'grid-view';
    displayedColumns: string[] = [
        'select',
        'nombre',
        'descripcion',
        'estadoExpediente',
        'fecha',
        'valor',
        'detalles',
        'acciones',
    ];
    selection = new SelectionModel<PedidoVentaDTO>(true, []);
    lastSelectedSegmentRow: PedidoVentaDTO; // this is the variable which holds the last selected row index


    /**
     * Constructor
     */
    constructor(
        private _crudsService: CrudsService,
        private templateService: TemplateService,
        private ls: LocalStoreService,
        private utilsService: UtilsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the drawer
     */
    toggleDrawer(): void {
        // Toggle the drawer
        this._crudsComponent.toggle();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------


    ngOnInit(): void {
        this._crudsService.plantilla$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((plantilla: DocumentoPlantillaDTO) => {
                this.plantilla = plantilla;
                this.refreshTemplate();
            });

        this._crudsService.dataProvider$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result: PedidoVentaDTO[]) => {
                this.dataProvider = result;

            });
    }

    refreshTemplate() {
        if (
            PlantillaHelper.isEmpty(
                this.plantilla.propiedades,
                PlantillaHelper.FORM_DESCRIPCION
            )
        ) {
            this.removeColumn('descripcion');
        }
        if (
            PlantillaHelper.isEmpty(
                this.plantilla.propiedades,
                PlantillaHelper.FORM_TOTAL
            )
        ) {
            this.removeColumn('valor');
        }

        if (!this.plantilla.reportes || this.plantilla.reportes.length === 0) {
            this.removeColumn('acciones');
            this.removeColumn('select');
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    removeColumn(pColumn: string) {
        const index = this.displayedColumns.indexOf(pColumn, 0);
        if (index > -1) {
            this.displayedColumns.splice(index, 1);
        }
    }

    openDialog() {
        if (!this.plantilla) {
            return;
        }
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = this.plantilla.llaveTabla;
        pedidoVenta.serverUrl = this.plantilla.server;
        this.utilsService.modalWithParams(pedidoVenta);
    }

    getColor(pEstado: string) {
        return this.templateService.getColor(pEstado);
    }

    listar(_pagina: number) {

    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataProvider.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataProvider.forEach((row) => this.selection.select(row));
    }

    multipleSelect(event, row) {
        if (event.shiftKey) {
            let start = 0;
            if (this.lastSelectedSegmentRow) {
                start = this.dataProvider.findIndex((element) => element.llaveTabla === this.lastSelectedSegmentRow.llaveTabla);
            }
            let end = this.dataProvider.findIndex((element) => element.llaveTabla === row.llaveTabla);

            if (start > end) {
                end = start;
                start = this.dataProvider.findIndex((element) => element.llaveTabla === row.llaveTabla);
            }

            let obj: PedidoVentaDTO[] = Object.assign([], this.dataProvider.slice(start, end));

            obj.forEach(e => this.selection.select(e))
        }
        this.lastSelectedSegmentRow = row;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: PedidoVentaDTO): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre
            }`;
    }

    openDocument(pDocument: PedidoVentaDTO) {
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = pDocument.plantilla;
        pedidoVenta.llaveTabla = pDocument.llaveTabla;
        pedidoVenta.serverUrl = this.plantilla.server;
        this.utilsService.modalWithParams(pedidoVenta, false);
    }

    /************** ESTO ES COPIADO DE ACTIONS **************/

    showReport(reporte: ReporteBaseDTO, pDocument: PedidoVentaDTO) {
        if (!reporte) {
            return;
        }
        let stringURL = reporte.servidorUrl;
        if (!stringURL) {
            stringURL = this.ls.getItem(LocalConstants.URL_CONF);
        }
        stringURL = stringURL + '/reporte?nombre=' + reporte.llaveTabla;
        if (pDocument) {
            stringURL = stringURL + '&P_KEY=' + pDocument.llaveTabla;
        }
        stringURL =
            stringURL +
            '&P_TOKEN=' +
            this.ls.getItem(LocalConstants.JWT_TOKEN).toString();
        if (reporte.variables) {
            stringURL = stringURL + '&' + reporte.variables;
        }
        if (this.selection && this.selection.selected.length >= 1) {
            if (this.selection.selected.length > 50) {
                Swal.fire({
                    icon: 'info',
                    title: 'Oops...',
                    text:
                        'Se puede imprimir maximo 50 documentos a la vez, Divide la impresion',
                });
                return;
            }
            let plantillaIdMultiple = '';
            for (let i = 0; i < this.selection.selected.length; i++) {
                const pdPrint = this.selection.selected[i];
                plantillaIdMultiple = plantillaIdMultiple + pdPrint.llaveTabla + ';';
            }
            stringURL = stringURL + '&P_MULTIPLE=' + plantillaIdMultiple;
        }
        window.open(stringURL, '_blank');
    }
}

