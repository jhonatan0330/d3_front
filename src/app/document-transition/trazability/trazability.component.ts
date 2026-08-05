import { Component, OnInit, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DocumentoPlantillaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { TemplateService } from "app/modules/full/neuron/service/template.service";
import { UtilsService } from "app/modules/full/neuron/service/utils.service";
import { PlantillaHelper } from "app/shared/plantilla-helper";
import { NotificationCenterService } from 'app/notification/notification-center.service';
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
    exportAs: 'trazability',
    standalone: false
})
export class TrazabilityComponent implements OnInit {

  // TRACE
  pagina = 1; // Indica que pagina estamos buscando
  cantidadPagina = 30; // Indica cuantos registros estamos buscando por pagina
  isLoading = false;
  isEnd = false;
  fullScreen = false;
  styleSizePop = '';
  dataProvider: DocumentoRelacionGestorDTO[]; // Conjunto de documentos a visualizar

  optionsTrace: OptionTrace[] = [
    { value: '1', viewValue: 'Documentos' },
    { value: '2', viewValue: 'Asignaciones' },
    { value: '3', viewValue: 'Mensajes' },
    { value: '4', viewValue: 'Inventario' },
    { value: '5', viewValue: 'Valores' },
    { value: '6', viewValue: 'Reportes' },
    { value: '7', viewValue: 'APIs' },
    { value: '8', viewValue: 'Ubicacion' },
    { value: '9', viewValue: 'Comprobantes' }
  ];

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
    private utilsService: UtilsService,
    private notificationCenter: NotificationCenterService
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
      this.notificationCenter.warn('No estados', 'Esta plantilla no tiene existe');
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
          case "1"://Documentos
            initialOptions.push(this.optionsTrace[0].value);
            break;
          case "2"://Asignaciones
            initialOptions.push(this.optionsTrace[1].value);
            break;
          case "3"://Mensajes
            initialOptions.push(this.optionsTrace[2].value);
            break;
          case "4"://Inventario
            initialOptions.push(this.optionsTrace[3].value);
            break;
          case "5"://Valores
            initialOptions.push(this.optionsTrace[4].value);
            break;
          case "6"://Reportes
            initialOptions.push(this.optionsTrace[5].value);
            break;
          case "7"://API
            initialOptions.push(this.optionsTrace[6].value);
            break;
          case "8"://Ubicacion
            initialOptions.push(this.optionsTrace[7].value);
            break;
          case "9"://comprobantes
            initialOptions.push(this.optionsTrace[8].value);
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

    const doc: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[0].value) ? '1' : '0';
    const asg: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[1].value) ? '1' : '0';
    const msj: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[2].value) ? '1' : '0';
    const inv: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[3].value) ? '1' : '0';
    const val: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[4].value) ? '1' : '0';
    const rep: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[5].value) ? '1' : '0';
    const api: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[6].value) ? '1' : '0';
    const loc: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[7].value) ? '1' : '0';
    const cct: string = this.selectedTrace.value.find((item) => item === this.optionsTrace[8].value) ? '1' : '0';
    entity.estado = doc + asg + msj + inv + val + rep + api + loc + cct;
   // if (this.selectedTrace.value.find((item) => item === this.optionsTrace[0].value)) { entity.estado = '1111111111'; }

    if (_pagina === 1) {
      this.dataProvider = [];
      this.isEnd = false;
    }
    if (entity.estado === '000000000') { return; }
    entity.paginacionRegistroInicial = this.cantidadPagina * (_pagina - 1);
    entity.paginacionRegistroFinal = this.cantidadPagina;
    this.pagina = _pagina;
    this.isLoading = true;
    this._traceService.getTrace(entity, this.plantilla.server).subscribe({
      next: (dataResult: DocumentoRelacionGestorDTO[]) => {
        if (dataResult) {
          const _fullQuantity = dataResult.length;
          for (let index = dataResult.length -1; index >=0 ; index--) {
            const element = dataResult[index];
            if((element.estadoInicial || element.estadoFinal) && element.estadoInicial !== element.estadoFinal) {

              if(index !== (dataResult.length - 1) 
                && dataResult[index + 1].documentoModificador === element.documentoModificador
                && dataResult[index + 1].estadoFinal === element.estadoInicial) {
                
                dataResult[index + 1].nombre = element.nombre;
                
                if (!dataResult[index + 1].estados) {
                  dataResult[index + 1].estados = [];
                  dataResult[index + 1].estados.push(element.estadoInicial);
                }
                dataResult[index + 1].estados.push(element.estadoFinal);
                dataResult.splice(index , 1);

              } else{
                if (!element.estados) {
                  element.estados = [];
                }                
                element.estados.push(element.estadoInicial);
                element.estados.push(element.estadoFinal);
              }
            }
          }
          if (this.pagina === 1) {
            this.dataProvider = dataResult;
          } else {
            this.dataProvider = this.dataProvider.concat(dataResult);
          }
          if (_fullQuantity === this.cantidadPagina) {
            this.pagina++;
          } else {
            this.isEnd = true;
            this.pagina = 1;
          }
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
      _prepare.serviceId = pService.campo;
      this.isLoading = true;
      this._traceService
        .getVoucherOfDocument(_prepare)
        .subscribe({
          next: (value: IdResponse) => {
            if (value && value.id) {
              this.utilsService.modalVoucher(value.id, null).subscribe();
            } else {
              this.notificationCenter.info('Comprobante', 'No se encontro comprobante para este documento');
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
            this.notificationCenter.info('Comprobante', 'Se envio a generar el comprobante por favor consulte de nuevo');
            this.isLoading = false;
            this.vouchersTemplate.forEach((item) => {
              if (item.campo === pServiceId) {
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

  isSameDay(current: string, pIndex: number): boolean {

    if( pIndex === 0 || !this.dataProvider || this.dataProvider.length === 0) {
      return false;
    }
    const fecha1 = new Date(current);
    const fecha2 = new Date(this.dataProvider[pIndex - 1].fecha);

    return fecha1.getFullYear() === fecha2.getFullYear() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getDate() === fecha2.getDate();
  }


  getRelativeFormat(date: string): string {
    const fecha = new Date(date);
    const hoy = new Date();

    // Normalizamos ambas fechas a medianoche
    const fechaUTC = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const hoyUTC = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const diffTiempo = hoyUTC.getTime() - fechaUTC.getTime();
    const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'hoy';
    if (diffDias === 1) return 'ayer';
    if (diffDias < 30) return `hace ${diffDias} días`;
    if (diffDias < 60) return 'hace un mes';
    const meses = Math.floor(diffDias / 30);
    return `hace ${meses} meses`;
  }

  trackByFn(index: number, item: any): any {
    return item.llaveTabla || index;
  }

    toogleScreen() {
    this.fullScreen = !this.fullScreen;
    this.getSizePop();
  }

  getSizePop() {
    if (this.fullScreen) {
      this.styleSizePop = 'width: 98vw;';
    } else {
      this.styleSizePop = '';
    }
    //if(this.drawerOpened) {this.styleSizePop = this.styleSizePop + 'height:90vh;';}
  }

    onUsuarioClick(pUsuario): void {
      this.utilsService.modalUser(pUsuario).subscribe();
  }


}