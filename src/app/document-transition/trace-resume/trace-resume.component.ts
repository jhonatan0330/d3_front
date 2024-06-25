import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DocumentoPlantillaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { UtilsService } from "app/modules/full/neuron/service/utils.service";
import { PlantillaHelper } from "app/shared/plantilla-helper";
import { DocumentTransitionService } from "../document-transition.service";
import { DocumentoRelacionGestorDTO, DocumentoRelacionGestorFilterDTO } from "../document-transition.types";
import { PropiedadDTO } from "app/shared/shared.domain";

interface OptionTrace {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'trace-resume',
  templateUrl: './trace-resume.component.html',
  exportAs: 'trace-resume'
})
export class TraceResumeComponent implements OnInit {

  // TRACE
  pagina = 1; // Indica que pagina estamos buscando
  cantidadPagina = 30; // Indica cuantos registros estamos buscando por pagina
  isLoading = false;
  isEnd = true;
  dataProvider: DocumentoRelacionGestorDTO[]; // Conjunto de documentos a visualizar
 
  optionsTrace: OptionTrace[] = [
    {value: '0', viewValue: 'Todos'},
    {value: '1', viewValue: 'Documentos'} ,
    {value: '2', viewValue: 'Asignaciones'} ,
    {value: '3', viewValue: 'Mensajes'} ,
    {value: '4', viewValue: 'Inventario'},
    {value: '5', viewValue: 'Automaticas'},
    {value: '6', viewValue: 'Reportes'},
    {value: '7', viewValue: 'APIs'}];
  selectedTrace = new FormControl(['1']);

  @Input() plantilla: DocumentoPlantillaDTO; // Contiene la estructura del formulario
  @Input() documentId: string;
  
  constructor(
    private _traceService: DocumentTransitionService,
    private utilsService: UtilsService
  ) {

  }

  ngOnInit(): void {
    // Colocar los valores iniciales de la consulta historica
    const checksHistorial: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(this.plantilla.propiedades, PlantillaHelper.PLANTILLA_HISTORIAL_ACTIVO);
    if (checksHistorial && checksHistorial.length != 0) {
      const initialOptions = ['1'];
      for (let i = 0; i < checksHistorial.length; i++) {
        switch (checksHistorial[i].valor) {
          case "1":
            initialOptions.push(this.optionsTrace[1].value);
            //initialOptions + "," + this.optionsTrace[2].value;
            break;
          case "2":
            initialOptions.push(this.optionsTrace[2].value);
            //initialOptions + "," + this.optionsTrace[2].value;
            break;
          case "3":
            //initialOptions + "," + this.optionsTrace[3].value;
            initialOptions.push(this.optionsTrace[3].value);
            break;
          case "4":
            //initialOptions + "," + this.optionsTrace[4].value;
            initialOptions.push(this.optionsTrace[4].value);
            break;
          case "5":
            //initialOptions + "," + this.optionsTrace[5].value;
            initialOptions.push(this.optionsTrace[5].value);
            break;
          case "6":
            //initialOptions + "," + this.optionsTrace[6].value;
            initialOptions.push(this.optionsTrace[6].value);
            break;
          case "7":
            //initialOptions + "," + this.optionsTrace[7].value;
            initialOptions.push(this.optionsTrace[7].value);
            break;
        }
      }
      this.selectedTrace.setValue(initialOptions);
    }
    //this.listar(1);
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
    entity.documentoPrincipal = this.documentId;

    /*const docs: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[1].value) ? '1' : '0';
    const asg: string = this.fCheckAssignations.value ? '1' : '0';
    const msj: string = this.fCheckMessage.value ? '1' : '0';
    const inv: string = this.fCheckInventary.value ? '1' : '0';
    const rep: string = this.fCheckReportes.value ? '1' : '0';
    const aut: string = this.fCheckAutomaticas.value ? '1' : '0';
    const api: string = this.fCheckApi.value ? '1' : '0';
    entity.estado = docs + asg + msj + inv + rep + aut + api;*/
    const docs: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[1].value) ? '1' : '0';
    const asg: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[2].value) ? '1' : '0';
    const msj: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[3].value) ? '1' : '0';
    const inv: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[4].value) ? '1' : '0';
    const rep: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[5].value) ? '1' : '0';
    const aut: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[6].value) ? '1' : '0';
    const api: string = this.selectedTrace.value.find((item)=> item === this.optionsTrace[7].value) ? '1' : '0';
    entity.estado = docs + asg + msj + inv + rep + aut + api;
    if( this.selectedTrace.value.find((item)=> item === this.optionsTrace[0].value)) {entity.estado = '1111111';}

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


}