import { Component, OnInit, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DocumentoPlantillaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { TemplateService } from "app/modules/full/neuron/service/template.service";
import { UtilsService } from "app/modules/full/neuron/service/utils.service";
import { PlantillaHelper } from "app/shared/plantilla-helper";
import Swal from "sweetalert2";
import { DocumentTransitionService } from "../document-transition.service";
import { DocumentoRelacionGestorDTO, DocumentoRelacionGestorFilterDTO } from "../document-transition.types";
import { PropiedadDTO } from "app/shared/shared.domain";

@Component({
  selector: 'trazability',
  templateUrl: './trazability.component.html',
  exportAs: 'trazability'
})
export class TrazabilityComponent implements OnInit {

  // TRACE
  pagina = 1; // Indica que pagina estamos buscando
  cantidadPagina = 30; // Indica cuantos registros estamos buscando por pagina
  isLoading = false;
  isEnd = false;
  dataProvider: DocumentoRelacionGestorDTO[]; // Conjunto de documentos a visualizar

  fCheckDocuments: FormControl = new FormControl(true);
  fCheckAssignations: FormControl = new FormControl(false);
  fCheckMessage: FormControl = new FormControl(false);
  fCheckInventary: FormControl = new FormControl(false);
  fCheckAutomaticas: FormControl = new FormControl(false);
  fCheckApi: FormControl = new FormControl(false);
  fCheckReportes: FormControl = new FormControl(false);

  plantilla: DocumentoPlantillaDTO; // Contiene la estructura del formulario

  isFilterVisible = false;
  documentName;
  documentState;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TrazabilityComponent>,
    private _traceService: DocumentTransitionService,
    private templateService: TemplateService,
    private utilsService: UtilsService
  ) {

  }

  ngOnInit(): void {
    this.plantilla = this.templateService.getTemplate(
      this.data.template, this.data.server
    );
    this.documentName = this.data.documentName;
    this.documentState = this.data.documentState;
    if (
      !this.plantilla ||
      !this.data.document
    ) {
      Swal.fire('No estados', 'Esta plantilla no tiene existe', 'warning');
      this.dialogRef.close(false);
      return;
    }

    // Colocar los valores iniciales de la consulta historica
    const checksHistorial: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(this.plantilla.propiedades, PlantillaHelper.PLANTILLA_HISTORIAL_ACTIVO);
    if (checksHistorial && checksHistorial.length != 0) {
      for (let i = 0; i < checksHistorial.length; i++) {
        switch (checksHistorial[i].valor) {
          case "1":
            this.fCheckDocuments.setValue(true);
            break;
          case "2":
            this.fCheckAssignations.setValue(true);
            break;
          case "3":
            this.fCheckMessage.setValue(true);
            break;
          case "4":
            this.fCheckInventary.setValue(true);
            break;
          case "5":
            this.fCheckAutomaticas.setValue(true);
            break;
          case "6":
            this.fCheckReportes.setValue(true);
            break;
          case "7":
            this.fCheckApi.setValue(true);
            break;
        }
      }
    }
    this.listar(1);
  }

  /*******************************  TRACE *********************/
  getDateFormat(oldDate: any) {
    return oldDate.toDateString() + ' ' + oldDate.toLocaleTimeString();
  }

  listar(_pagina: number) {
    if (this.isLoading) {
      return;
    }
    const entity: DocumentoRelacionGestorFilterDTO = new DocumentoRelacionGestorFilterDTO();
    entity.documentoPrincipal = this.data.document;
    const docs: string = this.fCheckDocuments.value ? '1' : '0';
    const asg: string = this.fCheckAssignations.value ? '1' : '0';
    const msj: string = this.fCheckMessage.value ? '1' : '0';
    const inv: string = this.fCheckInventary.value ? '1' : '0';
    const rep: string = this.fCheckReportes.value ? '1' : '0';
    const aut: string = this.fCheckAutomaticas.value ? '1' : '0';
    const api: string = this.fCheckApi.value ? '1' : '0';
    entity.estado = docs + asg + msj + inv + rep + aut + api;

    if (_pagina === 1) {
      this.dataProvider = [];
      this.isEnd = false;
    }
    entity.paginacionRegistroInicial = this.cantidadPagina * (_pagina - 1);
    entity.paginacionRegistroFinal = this.cantidadPagina;
    this.pagina = _pagina;
    this.isLoading = true;
    this._traceService.getTrace(entity, this.plantilla.server).subscribe({
      next: (dataResult: DocumentoRelacionGestorDTO[]) => {
        if (this.pagina === 1) {
          this.dataProvider = dataResult;
        } else {
          this.dataProvider = this.dataProvider.concat(dataResult);
        }
        if (dataResult.length === this.cantidadPagina) {
          this.pagina++;
        } else {
          this.isEnd = true;
          this.pagina = 1;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
      }
    });
  }

  showTraceField2Document(_gestor: DocumentoRelacionGestorDTO) {
    this._traceService.getTraceFields(_gestor.documentoPrincipal, _gestor.transaccion, this.plantilla.server).subscribe({
      next: (_dataResult: PedidoVentaCaracteristicaDTO[]) => {
        _gestor.campos = _dataResult;
      }
    });
  }

  showTraceDocument(_id: string, _template: string) {
    const _doc: PedidoVentaDTO = new PedidoVentaDTO();
    _doc.plantilla = _template;
    _doc.llaveTabla = _id;
    _doc.server = this.plantilla.server;
    this.utilsService.modalWithParams(_doc);
  }

  changeVisibilityOfFilters(){
    this.isFilterVisible = ! this.isFilterVisible;
  }

}