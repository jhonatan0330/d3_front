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
import { IdResponse } from "app/modules/full/neuron/model/sw42.utils";
import { VoucherPrepareRequest } from "app/accounting/accounting.domain";
import { StatesEnum } from "app/modules/full/neuron/model/sw42.enum";

interface OptionTrace {
  value: string;
  viewValue: string;
}

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

  optionsTrace: OptionTrace[] = [
    { value: '0', viewValue: 'Todos' },
    { value: '1', viewValue: 'Documentos' },
    { value: '2', viewValue: 'Asignaciones' },
    { value: '3', viewValue: 'Mensajes' },
    { value: '4', viewValue: 'Inventario' },
    { value: '5', viewValue: 'Reportes' },
    { value: '6', viewValue: 'Automaticas' },
    { value: '7', viewValue: 'APIs' }];

  selectedTrace = new FormControl(['1']);


  textDropDown = 'Documentos';
  dropdownOpen = false;

  plantilla: DocumentoPlantillaDTO; // Contiene la estructura del formulario

  vouchersTemplate: PropiedadDTO[];

  documentName;
  documentState;
  state;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TrazabilityComponent>,
    private _traceService: DocumentTransitionService,
    private templateService: TemplateService,
    private utilsService: UtilsService
  ) {

  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    const selected = this.selectedTrace.value as string[];

    if (checkbox.checked) {
      this.selectedTrace.setValue([...selected, value]);
    } else {
      this.selectedTrace.setValue(selected.filter(v => v !== value));
    }
    if (this.selectedTrace.value.find((item) => item === '0')) {
      this.textDropDown = 'Todos';
    } else {
      this.textDropDown = '';
      for (const opt of this.optionsTrace) {
        if (this.selectedTrace.value.find((item) => item === opt.value)) { this.textDropDown += (opt.viewValue + ','); };
      }
      this.textDropDown = this.textDropDown.slice(0, -1); // Eliminar la última coma
    }
    this.listar(1);
  }

  ngOnInit(): void {
    this.plantilla = this.templateService.getTemplate(
      this.data.template, this.data.server
    );
    this.documentName = this.data.documentName;
    this.documentState = this.data.documentState;
    this.state = this.data.state;
    if (
      !this.plantilla ||
      !this.data.document
    ) {
      Swal.fire('No estados', 'Esta plantilla no tiene existe', 'warning');
      this.dialogRef.close(false);
      return;
    }

    this.vouchersTemplate = PlantillaHelper.buscarValorMultiple(this.plantilla.propiedades, PlantillaHelper.TEMPLATE_VOUCHER);



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
    this.dropdownOpen = false;
    const entity: DocumentoRelacionGestorFilterDTO = new DocumentoRelacionGestorFilterDTO();
    entity.documentoPrincipal = this.data.document;

    const docs: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[1].value) ? '1' : '0';
    const asg: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[2].value) ? '1' : '0';
    const msj: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[3].value) ? '1' : '0';
    const inv: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[4].value) ? '1' : '0';
    const rep: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[5].value) ? '1' : '0';
    const aut: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[6].value) ? '1' : '0';
    const api: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[7].value) ? '1' : '0';
    entity.estado = docs + asg + msj + inv + rep + aut + api;
    if (this.selectedTrace.value.find((item) => item === this.optionsTrace[0].value)) { entity.estado = '1111111'; }

    if (_pagina === 1) {
      this.dataProvider = [];
      this.isEnd = false;
    }
    if(entity.estado === '0000000') {return;}
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

  showVoucherAccount(pService: PropiedadDTO) {
    if (this.data.document) {
      const _prepare: VoucherPrepareRequest = new VoucherPrepareRequest();
      _prepare.documentId = this.data.document;
      _prepare.serviceId = pService.valor;
      this.isLoading = true;
      this._traceService
        .getVoucherOfDocument(_prepare)
        .subscribe({
          next: (value: IdResponse) => {
            if (value && value.id) {
              this.utilsService.modalVoucher(value.id, null).subscribe();
            } else {
              Swal.fire('Comprobante', 'No se encontro comprobante para este documento', 'info');
            }
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            if (this.state && this.state !== StatesEnum.INACTIVE) {
              this.vouchersTemplate.forEach((item) => {
                if (item.valor === pService.valor) {
                  item.estado = 'CONSULTADO';
                }
              });
            }

          },
        });
    }
  }

  generateVoucher(pServiceId: string) {
    if (this.data.document) {
      const _prepare: VoucherPrepareRequest = new VoucherPrepareRequest();
      _prepare.documentId = this.data.document;
      _prepare.serviceId = pServiceId
      this.isLoading = true;
      this._traceService
        .generateVoucher(_prepare)
        .subscribe({
          next: () => {
            Swal.fire('Comprobante', 'Se envio a generar el comprobante por favor consulte de nuevo', 'info');
            this.isLoading = false;
            this.vouchersTemplate.forEach((item) => {
              if (item.valor === pServiceId) {
                item.estado = 'A';
              }
            });
          },
          error: () => {
            this.isLoading = false;
          },
        });
    }
  }
}