import { AfterViewInit, Component, ComponentFactoryResolver, Input, OnDestroy, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
  ReporteBaseDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { DocumentoPlantillaCaracteristicaEnum, StatesEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { IDynamicControl } from 'app/modules/full/neuron/form/controls/base/base.component';
import { getComponent } from 'app/modules/full/neuron/form-helper';

@Component({
  selector: 'app-cruds',
  templateUrl: './cruds2.component.html'
})
export class Cruds2Component implements OnInit, AfterViewInit, OnDestroy {
  plantilla: DocumentoPlantillaDTO; // Estructura base de la lista
  templatesFromProcess: DocumentoPlantillaDTO[];
  tableroId: string;
  procesoId: string;

  // Variables para sincronizar con la vista
  dataProvider: PedidoVentaDTO[] = []; // Conjunto de documentos a visualizar
  fControlSearch: FormControl = new FormControl(); // Texto que digita el usuario para filtrar
  fCDateStart: FormControl = new FormControl();
  fCDateEnd: FormControl = new FormControl();
  fCTimeStart: FormControl = new FormControl('00:00');
  fCTimeEnd: FormControl = new FormControl('23:59');
  fControlCheck: FormControl = new FormControl(false); // Check que indica si se debe realizar una busqueda por codigo exacto
  pagina = 1; // Indica que pagina estamos buscando
  cantidadPagina = 30; // Indica cuantos registros estamos buscando por pagina
  isLoading = false;
  isEnd = false;
  viewMode = 'grid-view';
  form: FormGroup = new FormGroup({});
  hasCreatePermission = false;

  // textoInicial: string; // Usado para colocar el texto incial de los fomrularios nuevos, ejemplo un cliente buscado no encontrado
  // campoHerencia: string; // Usado para enviar el id del campo que tiene herencia

  solicitarFechas = true;

  displayedColumns: string[] = [];
  selection = new SelectionModel<PedidoVentaDTO>(true, []);
  lastSelectedSegmentRow: PedidoVentaDTO; // this is the variable which holds the last selected row index


  @ViewChild('drawer') drawer: MatDrawer;

  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  //VAriables del filtro
  @ViewChild('dynamycFormElement', { read: ViewContainerRef })
  myForm: ViewContainerRef;
  formIsModified = false;
  dynamicControls: IDynamicControl[] = [];
  //filterDocument: PedidoVentaDTO; // Contiene la info del filtro por campo

  constructor(
    private route: ActivatedRoute,
    private templateService: TemplateService,
    private api: ApiService,
    private router: Router,
    private formBuilder: FormBuilder,
    private ls: LocalStoreService,
    private utilsService: UtilsService,
    private compiler: ComponentFactoryResolver,
    private _fuseMediaWatcherService: FuseMediaWatcherService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const propType = params.type;
      if (!propType) {
        this.router.navigate(['/main']);
        return;
      }
      this.dataProvider = [];
      this.templatesFromProcess = [];
      this.fControlSearch.setValue('');
      this.procesoId = null;
      //const serverUrl = this.templateService.getUrl4Id(params.server_id);
      if (propType === 'list') {
        this.plantilla = this.templateService.getTemplate(params.id, params.server_id);
        if (!this.plantilla) {
          this.router.navigate(['/main']);
          return;
        }
      } else if (propType === 'process_crud') {
        this.procesoId = params.id;
        if (this.procesoId) {
          this.plantilla = this.templateService.getProceso(this.procesoId);
          this.templatesFromProcess = this.templateService.getTemplateOfProcess(this.procesoId)
            .filter((item) => item.propiedades &&
              PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)
              && PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PLANTILLA_INICIA_PROCESO)
            );
        } else {
          this.router.navigate(['/main']);
          return;
        }
      } else if (propType === 'tablet') {
        this.tableroId = params.id;
        if (this.tableroId) {
          const propTablero = this.templateService.getTablero(this.tableroId);
          if (propTablero) {
            this.plantilla = new DocumentoPlantillaDTO();
            this.plantilla.nombre = propTablero.texto;
            this.plantilla.imagen = propTablero.motivo;
          } else {
            this.router.navigate(['/main']);
            return;
          }
        }
      } else {
        this.router.navigate(['/main']);
        return;
      }
      if (!this.plantilla) {
        this.router.navigate(['/main']);
        return;
      }
      // Obtener Variables
      this.solicitarFechas = !PlantillaHelper.isEmpty(
        this.plantilla.propiedades,
        PlantillaHelper.FORM_SOLICITAR_FECHAS
      );
      if (!this.solicitarFechas && this.templatesFromProcess) {
        for (let i = 0; i < this.templatesFromProcess.length; i++) {
          const iTemplateFromService = this.templatesFromProcess[i];
          if (!PlantillaHelper.isEmpty(
            iTemplateFromService.propiedades,
            PlantillaHelper.FORM_SOLICITAR_FECHAS
          )) {
            this.solicitarFechas = true;
            break;
          }
        }
      }
      if (this.solicitarFechas) {
        this.fCDateStart.setValue(new Date());
        let endDate = new Date(new Date());
        endDate.setDate(endDate.getDate() + 1);
        this.fCDateEnd.setValue(endDate);
      } else {
        this.fCDateStart.setValue(null);
        this.fCDateEnd.setValue(null);
      }
      this.hasCreatePermission = !PlantillaHelper.isEmpty(
        this.plantilla.propiedades,
        PlantillaHelper.PERMISO_PLANTILLA_CREAR
      );
      if (this.plantilla.estados) {
        const _controlEstado = [];
        for (let i = 0; i < this.plantilla.estados.length; i++) {
          const element = this.plantilla.estados[i];
          if (!element.llaveTabla) {
            element.llaveTabla = element.estadoDocumento;
          }
          _controlEstado[element.llaveTabla] = new FormControl(
            element.estadoDocumento === StatesEnum.ACTIVE
          );
        }
        this.form = this.formBuilder.group(_controlEstado);
      }
      this.displayedColumns = [];
      if (this.plantilla.reportes && this.plantilla.reportes.length !== 0) { this.displayedColumns.push('select'); }
      this.displayedColumns.push('nombre');
      if (!PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.FORM_DESCRIPCION)) { this.displayedColumns.push('descripcion'); }
      this.displayedColumns.push('estadoExpediente');
      this.displayedColumns.push('fecha');
      if (!PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.FORM_TOTAL)) { this.displayedColumns.push('valor'); }
      this.displayedColumns.push('detalles');
      if (this.plantilla.reportes && this.plantilla.reportes.length !== 0) { this.displayedColumns.push('acciones'); }
      this.showFields();
    });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Set the drawerMode and drawerOpened if the given breakpoint is active
        if (matchingAliases.includes('md')) {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
        else {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        }
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showFields();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
     * Toggle the drawer
     */
  toggleDrawer(): void {
    // Toggle the drawer
    this.drawer.toggle();
  }

  /*removeColumn(pColumn: string) {
    const index = this.displayedColumns.indexOf(pColumn, 0);
    if (index > -1) {
      this.displayedColumns.splice(index, 1);
    }
  }*/

  openDialogFromTemplateModule() {
    if (!this.plantilla) { return; }
    this.openDialog(this.plantilla.llaveTabla, this.plantilla.server);
  }

  openDialog(template: string, server: string) {
    if (!template) { return; }
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = template;
    pedidoVenta.server = server;
    this.utilsService.modalWithParams(pedidoVenta);
  }

  getColor(pEstado: string) {
    return this.templateService.getColor(pEstado);
  }


  getColorFont(pEstado: string) {
    return this.templateService.getColorFont(pEstado);
  }

  listar(_pagina: number) {
    if (this.isLoading) {
      return;
    }
    const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
    if (this.plantilla) {
      entity.plantilla = this.plantilla.llaveTabla;
    }
    if (this.tableroId) {
      entity.campoPropiedad = this.tableroId;
    }
    entity.proceso = this.procesoId;
    if (this.fControlCheck.value) {
      if (!this.fControlSearch.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          text: 'Seleccionaste la opcion codigo exacto, ayudanos colocando el codigo del documento. Gracias'
        });
        return;
      }
      entity.nombre = this.fControlSearch.value;
      entity.filtroParametro = null;
    } else {
      entity.nombre = null;
      entity.filtroParametro = this.fControlSearch.value;
      if (this.solicitarFechas && (!this.fCDateStart.value || !this.fCDateEnd.value)) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          text: 'Por favor coloca una fecha de inicio y una fecha de fin, esto nos ayudara a mejorar el resultado de tu busqueda'
        });
        return;
      }
      if (this.fCDateStart.value) {
        const startDate = new Date(this.fCDateStart.value);
        if (this.fCTimeStart.value) {
          startDate.setHours(this.fCTimeStart.value.substring(0, 2), this.fCTimeStart.value.substring(3, 5), 0, 0);
        } else {
          startDate.setHours(0, 0, 0, 0);
        }
        entity.fechaMin = startDate;
      }
      if (this.fCDateEnd.value) {
        const endDate = new Date(this.fCDateEnd.value);
        if (this.fCTimeEnd.value) {
          endDate.setHours(this.fCTimeEnd.value.substring(0, 2), this.fCTimeEnd.value.substring(3, 5), 0, 0);
        } else {
          endDate.setHours(0, 0, 0, 0);
        }
        entity.fechaMax = endDate;
      }
      if (entity.fechaMax && entity.fechaMin) {
        if ((entity.fechaMax.getTime() - entity.fechaMin.getTime()) <= 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Estas seguro que la fecha maxima es menor que la fecha minima??'
          });
        }
      }
    }

    if (this.plantilla.estados) {
      entity.estadoExpediente = '';

      for (let i = 0; i < Object.keys(this.form.controls).length; i++) {
        const element = Object.keys(this.form.controls)[i];
        if (this.form.controls[element].value) {
          entity.estadoExpediente = entity.estadoExpediente + ';' + element;
        }
      }
      if (!entity.estadoExpediente) {
        alert('Seleccione un filtro.');
        return;
      } else {
        if (entity.estadoExpediente === ';A') {
          entity.estado = StatesEnum.ACTIVE;
          entity.estadoExpediente = null;
        } else {
          if (entity.estadoExpediente === ';I') {
            entity.estado = StatesEnum.INACTIVE;
            entity.estadoExpediente = null;
          } else {
            if (entity.estadoExpediente === ';A;I') {
              entity.estado = null;
              entity.estadoExpediente = null;
            } else {
              entity.estado = null;
            }
          }
        }
      }
    }

    this.isLoading = true;
    if (_pagina === 1) {
      this.dataProvider = [];
      this.isEnd = false;
      this.selection.clear();
      this.pagina = 1;
    }
    entity.paginacionRegistroInicial = this.cantidadPagina * (_pagina - 1);
    entity.paginacionRegistroFinal = this.cantidadPagina;
    if (this.dynamicControls) {
      entity.filtersByFields = [];
      this.dynamicControls.forEach(fieldFilter => {
        const fieldEntity: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
        fieldEntity.campo = fieldFilter.data.campo;
        fieldEntity.valorOpcion = fieldFilter.data.valorOpcion;
        fieldEntity.valorAuxiliar = fieldFilter.data.valorAuxiliar;
        fieldEntity.valorText = fieldFilter.data.valorText;
        entity.filtersByFields.push(fieldEntity);
      });
    }

    this.api.listarDocumentos(entity, this.plantilla.server).subscribe({
      next: (dataResult: PedidoVentaDTO[]) => {
        if (!dataResult) {
          dataResult = [];
        }
        if (this.pagina === 1) {
          this.dataProvider = dataResult;
        } else {
          this.dataProvider = this.dataProvider.concat(dataResult);
        }
        if (dataResult.length >= this.cantidadPagina) {
          this.pagina++;
        } else {
          this.isEnd = true;
          this.pagina = 1;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
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
    pedidoVenta.server = this.plantilla.server;
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

  ///////////////////////////////////////////////////////
  ///////////////ESTO ES MUY PARECIDO///////////////////
  ///////////////A FORM////////////////////////////////////


  // Agrega los campos al formulario de busqueda
  showFields() {

    if (this.myForm) {
      this.myForm.clear();
      this.dynamicControls = [];
    } else {
      // Espero que se cargue con el AfterInitView
      return;
    }
    if (!this.plantilla) { return; }
    //Cuando es tipo proceso no puedo encontrar los campos de todas las plantillas
    if (this.plantilla.estado === 'T') { return; }
    if (!this.plantilla.caracteristicas) {
      this.cargarPlantilla(this.plantilla.llaveTabla, null);
      return;
    }
    const filterDocument = new PedidoVentaDTO;
    this.plantilla.caracteristicas.forEach((_campo) => {
      if (_campo.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO
        && PlantillaHelper.isEmpty(_campo.propiedades, PlantillaHelper.MULTIPLE)
        && PlantillaHelper.isEmpty(_campo.propiedades, PlantillaHelper.PERMISO_CAMPO_BLOQUEAR)) {
        const componentDynamic: Type<any> = getComponent(_campo);
        const _componentFactory = this.compiler.resolveComponentFactory(
          componentDynamic
        );
        const componentRef = this.myForm.createComponent<IDynamicControl>(
          _componentFactory
        );
        componentRef.instance.structure = _campo;
        componentRef.instance.parent = filterDocument
        componentRef.instance.urlServer = this.plantilla.server;
        const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
        uc.campo = _campo.llaveTabla;
        componentRef.instance.data = uc;
        this.dynamicControls.push(componentRef.instance);
      }
    });
    // Colocar listener de Dependientes
    for (let j = 0; j < this.plantilla.caracteristicas.length; j++) {
      const iBase = this.plantilla.caracteristicas[j];
      const codigoDepende: PropiedadDTO[] = PlantillaHelper.buscarValorMultipleFromManyKeys(
        iBase.propiedades,
        [PlantillaHelper.DEPENDE, PlantillaHelper.INFORMATIVE_DATA, PlantillaHelper.UPDATE_INFORMATIVE_FIELD]
      );
      if (codigoDepende) {
        let iCampoDependiente; // Identifico el campo dependiente
        for (let index = 0; index < this.dynamicControls.length; index++) {
          const iFieldDependiente: IDynamicControl = this.dynamicControls[index];
          if (iFieldDependiente.structure.codigo === iBase.codigo) {
            iCampoDependiente = iFieldDependiente;
            break;
          }
        }
        if (iCampoDependiente) {
          for (let z = 0; z < codigoDepende.length; z++) {
            const codigo = codigoDepende[z];
            for (let k = 0; k < this.dynamicControls.length; k++) {
              const iFieldReferenciado = this.dynamicControls[k];
              if (iFieldReferenciado.structure.llaveTabla === codigo.valor) {
                iFieldReferenciado.adicionarListener(iCampoDependiente);
                break;
              }
            }
          }
        }
      }
    }
  }

  // Consulto de las plantillas generales la plantilla
  cargarPlantilla(plantillaId: string, urlServer: string): DocumentoPlantillaDTO {
    const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
      plantillaId, urlServer
    );
    if (dp) {
      // Si la plantilla no tiene caracteristicas se debe consultar al servidor de forma completa
      if (!dp.caracteristicas) {
        this.isLoading = true;
        this.api
          .obtenerCampos(plantillaId, dp.server)
          .subscribe({
            next: (plantilla: DocumentoPlantillaDTO) => {
              plantilla.server = dp.server;
              this.isLoading = false;
              this.cargarCamposPlantilla(plantilla);
            },
            error: () => {
              this.isLoading = false;
            }
          });
        return;
      } else {
        return dp;
      }
    } else {
      Swal.fire('Autorizacion', 'No tienes permisos para ver este documento.', 'info');
      return;
    }
  }

  // Metodo que recibe la llamada asincrona de cargar los campos de una plantilla
  cargarCamposPlantilla(value: DocumentoPlantillaDTO) {
    const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
      value.llaveTabla, value.server
    );
    if (dp) {
      dp.caracteristicas = value.caracteristicas;
      this.templateService.getTemplate(value.llaveTabla, value.server).caracteristicas =
        value.caracteristicas;
      this.plantilla.caracteristicas = value.caracteristicas;
      this.showFields();
    } else {
      console.error('No se encuentra cargada la plantilla en memoria');
      return;
    }
  }
}
