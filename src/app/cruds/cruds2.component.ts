import { AfterViewInit, Component, Input, OnDestroy, OnInit, Type, ViewContainerRef, ChangeDetectionStrategy, inject, viewChild, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { IDynamicControl } from 'app/modules/full/neuron/form/controls/base/base.component';
import { getComponent } from 'app/modules/full/neuron/form-helper';
import { MatDatepickerInputEvent, MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { BpmDiagramComponent, Proceso } from 'app/shared/components/bpm-diagram/bpm-diagram.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatFormField, MatSuffix, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ImageFormatPipe } from '../shared/local-image';

@Component({
    selector: 'app-cruds',
    templateUrl: './cruds2.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDrawerContainer, MatDrawer, MatIconButton, MatTooltip, MatIcon, MatButton, MatMenuTrigger, MatMenu, MatMenuItem, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatSuffix, MatLabel, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatDrawerContent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatProgressBar, CurrencyPipe, DatePipe, ImageFormatPipe]
})
export class Cruds2Component implements OnInit, AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private templateService = inject(TemplateService);
    private api = inject(ApiService);
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);
    private ls = inject(LocalStoreService);
    private utilsService = inject(UtilsService);
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
    private dialog = inject(MatDialog);

    plantilla: DocumentoPlantillaDTO| null = null; // Estructura base de la lista
    templatesFromProcess: DocumentoPlantillaDTO[];
    tableroId: string;
    procesoId: string | null;

    // Variables para sincronizar con la vista
    dataProvider: PedidoVentaDTO[] = []; // Conjunto de documentos a visualizar
    fControlSearch: FormControl = new FormControl(); // Texto que digita el usuario para filtrar
    fCDateStart: FormControl = new FormControl();
    fCDateEnd: FormControl = new FormControl();
    fCTimeStart: FormControl = new FormControl('00:00');
    fCTimeEnd: FormControl = new FormControl('23:59');
    fRegistroDateStart: FormControl = new FormControl();
    fRegistroDateEnd: FormControl = new FormControl();
    fRegistroTimeStart: FormControl = new FormControl();
    fRegistroTimeEnd: FormControl = new FormControl();
    fControlCheck: FormControl = new FormControl(false); // Check que indica si se debe realizar una busqueda por codigo exacto
    pagina = 1; // Indica que pagina estamos buscando
    pageControl: FormControl = new FormControl('30');
    isLoading = signal(false);
    isEnd = signal(false);
    viewMode = 'grid-view';
    form: FormGroup = new FormGroup({});
    hasCreatePermission = false;
    reportForms: PropiedadDTO[];
    filteredReports: any[] = [];

    // textoInicial: string; // Usado para colocar el texto incial de los fomrularios nuevos, ejemplo un cliente buscado no encontrado
    // campoHerencia: string; // Usado para enviar el id del campo que tiene herencia

    solicitarFechas = true;

    displayedColumns: string[] = [];
    selection = new SelectionModel<PedidoVentaDTO>(true, []);
    lastSelectedSegmentRow: PedidoVentaDTO; // this is the variable which holds the last selected row index
    masterSelected: boolean = false;


    readonly drawer = viewChild<MatDrawer>('drawer');

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    //VAriables del filtro
    readonly myForm = viewChild('dynamycFormElement', { read: ViewContainerRef });
    formIsModified = false;
    dynamicControls: IDynamicControl[] = [];

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const propType = params.type;
            if (!propType) {
                this.router.navigate(['/main']);
                return;
            }
            this.isEnd.set(false);
            this.dataProvider = [];
            this.templatesFromProcess = [];
            this.fControlSearch.setValue('');
            this.procesoId = null;
            //const serverUrl = this.templateService.getUrl4Id(params.server_id);
            if (propType === 'list') {
                this.plantilla = this.templateService.getTemplate(params.id, params.server_id)!;
                if (!this.plantilla) {
                    this.router.navigate(['/main']);
                    return;
                }
            } else if (propType === 'process_crud') {
                this.procesoId = params.id;
                if (this.procesoId) {
                    this.plantilla = this.templateService.getProceso(this.procesoId)!;
                    if(this.plantilla && this.plantilla.proceso){
                        this.templatesFromProcess = this.templateService.getTemplateOfProcess(this.procesoId)!
                        .filter((item) => item.propiedades &&
                            PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)
                            && PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PLANTILLA_INICIA_PROCESO)
                        );
                    }
                    
                } else {
                    this.router.navigate(['/main']);
                    return;
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
            this.reportForms = PlantillaHelper.buscarValorMultiple(
                this.plantilla.propiedades,
                PlantillaHelper.REPORT_MODULE_REFERENCE
            ) ?? [];
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
                const endDate = new Date(new Date());
                endDate.setDate(endDate.getDate() + 1);
                this.fCDateEnd.setValue(endDate);
                this.fCTimeStart.enable();
                this.fCTimeEnd.enable();
                this.fCTimeStart.setValue('00:00');
                this.fCTimeEnd.setValue('23:59')
            } else {
                this.fCDateStart.setValue(null);
                this.fCDateEnd.setValue(null);
                this.fCTimeStart.reset();
                this.fCTimeEnd.reset();
                this.fCTimeStart.disable();
                this.fCTimeEnd.disable();
            }

            //FechaRegistro
            this.fRegistroDateStart.setValue(null);
            this.fRegistroDateEnd.setValue(null);
            this.fRegistroTimeStart.disable();
            this.fRegistroTimeEnd.disable();

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
        this.drawer()!.toggle();
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

    openDialog(template: string, server: string | undefined) {
        if (!template) { return; }
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = template;
        if(server)pedidoVenta.server = server;
        this.utilsService.modalWithParams(pedidoVenta);
    }

    getColor(pEstado: string) {
        return this.templateService.getColor(pEstado);
    }


    getColorFont(pEstado: string) {
        return this.templateService.getColorFont(pEstado);
    }

    listar(_pagina: number) {
        if (this.isLoading()) {
            return;
        }
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        if (this.plantilla) {
            entity.plantilla = this.plantilla.llaveTabla;
        }
        if (this.tableroId) {
            entity.campoPropiedad = this.tableroId;
        }
        entity.proceso = this.procesoId!;
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
            entity.filtroParametro = null!;
        } else {
            entity.nombre = null!;
            entity.filtroParametro = this.fControlSearch.value;
            if (this.solicitarFechas && (!this.fCDateStart.value || !this.fCDateEnd.value)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Por favor coloca una fecha de inicio y una fecha de fin, esto nos ayudara a mejorar el resultado de tu busqueda'
                });
                return;
            }

            if (this.fCDateStart.value)
                entity.fechaMin = this.FormatoFecha(this.fCDateStart, this.fCTimeStart);
            if (this.fCDateEnd.value)
                entity.fechaMax = this.FormatoFecha(this.fCDateEnd, this.fCTimeEnd);
            if( !this.ValidarFecha(entity.fechaMin, entity.fechaMax)) { return; }
            if (this.fRegistroDateStart.value)
                entity.fechaRegistroMin = this.FormatoFecha(this.fRegistroDateStart, this.fRegistroTimeStart);
            if (this.fRegistroDateEnd.value)
                entity.fechaRegistroMax = this.FormatoFecha(this.fRegistroDateEnd, this.fRegistroTimeEnd);
            if(!this.ValidarFecha(entity.fechaRegistroMin, entity.fechaRegistroMax)){ return; }

        }

        if (this.plantilla?.estados && !this.fControlCheck.value) {
            entity.estadoExpediente = '';

            for (let i = 0; i < Object.keys(this.form.controls).length; i++) {
                const element = Object.keys(this.form.controls)[i];
                if (this.form.controls[element].value) {
                    entity.estadoExpediente = entity.estadoExpediente + ';' + element;
                }
            }
            if (!entity.estadoExpediente) {
                Swal.fire('Filtros', 'Estas enviando una consulta y no tienes seleccionado ningun estado del filtro, te agradecemos selecciones minimo uno y vuelvas a enviar la consulta. Otra opción es consultar por el nombre exacto', 'info');
                return;
            } else {
                if (entity.estadoExpediente === ';A') {
                    entity.estado = StatesEnum.ACTIVE;
                    entity.estadoExpediente = null!;
                } else {
                    if (entity.estadoExpediente === ';I') {
                        entity.estado = StatesEnum.INACTIVE;
                        entity.estadoExpediente = null!;
                    } else {
                        if (entity.estadoExpediente === ';A;I') {
                            entity.estado = null!;
                            entity.estadoExpediente = null!;
                        } else {
                            entity.estado = null!;
                        }
                    }
                }
            }
        }

        this.isLoading.set(true);
        if (_pagina === 1) {
            this.dataProvider = [];
            this.isEnd.set(false);
            this.selection.clear();
            this.pagina = 1;
        }
        entity.paginacionRegistroInicial = this.pageControl.value * (_pagina - 1);
        entity.paginacionRegistroFinal = this.pageControl.value;
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

        if(this.plantilla){
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
                if (dataResult.length >= this.pageControl.value) {
                    this.pagina++;
                } else {
                    this.isEnd.set(true);
                    this.pagina = 1;
                }
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
        }
        
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

            const obj: PedidoVentaDTO[] = Object.assign([], this.dataProvider.slice(start, end));

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
        if (this.plantilla) {
            pedidoVenta.server = this.plantilla.server;
        }
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
            let msj = 'Vas a imprimir ' + (this.selection.selected.length).toString() + ' documentos .';
            if(this.selection.selected.length> 50) { msj = msj + 'Lo haremos abriendo ' + Math.ceil(this.selection.selected.length/50).toString() + ' pestañas en tu explorador, ¿estas deacuerdo?';}
            Swal.fire({
                title: 'Impresion de varios documentos',
                text: msj,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, quiero continuar!',
                cancelButtonText: 'No, Paremos',
              }).then((result) => {
                if (result.isConfirmed) {
                    let plantillaIdMultiple = '';
                    for (let i = 1; i <= this.selection.selected.length; i++) {
                        const pdPrint = this.selection.selected[i-1];
                        plantillaIdMultiple = plantillaIdMultiple + pdPrint.llaveTabla + ';';
                        //La idea es poder imprimir muchos pero laurl no deja asi que lo hago con varias ventanas
                        if((i%50)===0){
                            window.open(stringURL + '&P_MULTIPLE=' + plantillaIdMultiple, '_blank');
                            plantillaIdMultiple = '';
                        }
                    }
                    //En caso que sean exactamente 50 no se imprime 2 veces
                    if(plantillaIdMultiple === '') return;
                    stringURL = stringURL + '&P_MULTIPLE=' + plantillaIdMultiple;
                    window.open(stringURL, '_blank');
                } 
              });
              
            
        } else{
            window.open(stringURL, '_blank');
        }
        
    }

    ///////////////////////////////////////////////////////
    ///////////////ESTO ES MUY PARECIDO///////////////////
    ///////////////A FORM////////////////////////////////////


    // Agrega los campos al formulario de busqueda
    showFields() {

        const myForm = this.myForm();
        if (myForm) {
            myForm.clear();
            this.dynamicControls = [];
        } else {
            // Espero que se cargue con el AfterInitView
            return;
        }
        if (!this.plantilla) { return; }
        //Cuando es tipo proceso no puedo encontrar los campos de todas las plantillas
        if (this.plantilla.estado === 'T') { return; }
        if (!this.plantilla.caracteristicas) {
            this.cargarPlantilla(this.plantilla.llaveTabla, null!);
            return;
        }
        const filterDocument = new PedidoVentaDTO;
        this.plantilla.caracteristicas.forEach((_campo) => {
            if (_campo.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO
                && PlantillaHelper.isEmpty(_campo.propiedades, PlantillaHelper.MULTIPLE)
                && PlantillaHelper.isEmpty(_campo.propiedades, PlantillaHelper.PERMISO_CAMPO_BLOQUEAR)) {
                const componentDynamic: Type<any> = getComponent(_campo);
                const componentRef = this.myForm()!.createComponent<IDynamicControl>(
                    componentDynamic
                );
                componentRef.instance.structure = _campo;
                componentRef.instance.parent = filterDocument
                if(this.plantilla) {
                    componentRef.instance.urlServer = this.plantilla?.server;
                }
                const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                uc.campo = _campo.llaveTabla;
                componentRef.instance.data = uc;
                this.dynamicControls.push(componentRef.instance);
            }
        });
        // Colocar listener de Dependientes
        for (let j = 0; j < this.plantilla?.caracteristicas.length; j++) {
            const iBase = this.plantilla?.caracteristicas[j];
            const codigoDepende: PropiedadDTO[] | null = PlantillaHelper.buscarValorMultipleFromManyKeys(
                iBase.propiedades,
                [PlantillaHelper.DEPENDE, PlantillaHelper.INFORMATIVE_DATA, PlantillaHelper.UPDATE_INFORMATIVE_FIELD]
            );
            //No pude colocar todos los depends
            // PlantillaHelper.DEPENDENT_PROPERTIES
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
        )!;
        if (dp) {
            // Si la plantilla no tiene caracteristicas se debe consultar al servidor de forma completa
            if (!dp.caracteristicas) {
                this.isLoading.set(true);
                this.api
                    .obtenerCampos(plantillaId, dp.server)
                    .subscribe({
                        next: (plantilla: DocumentoPlantillaDTO) => {
                            plantilla.server = dp.server;
                            this.isLoading.set(false);
                            this.cargarCamposPlantilla(plantilla);
                        },
                        error: () => {
                            this.isLoading.set(false);
                        }
                    });
                return null!;
            } else {
                return dp;
            }
        } else {
            Swal.fire('Autorizacion', 'No tienes permisos para ver este documento.', 'info');
            return null!;
        }
    }

    // Metodo que recibe la llamada asincrona de cargar los campos de una plantilla
    cargarCamposPlantilla(value: DocumentoPlantillaDTO) {
        const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
            value.llaveTabla, value.server
        )!;
        if (dp) {
            dp.caracteristicas = value.caracteristicas;
            this.templateService.getTemplate(value.llaveTabla, value.server)!.caracteristicas =
                value.caracteristicas;
            if(this.plantilla) {
                this.plantilla.caracteristicas = value.caracteristicas;
            }
            this.showFields();
        } else {
            console.error('No se encuentra cargada la plantilla en memoria');
            return;
        }
    }

    private FormatoFecha(fecha: FormControl, fechaTime: FormControl): Date {
        const startDate = new Date(fecha.value);
        if (fechaTime.value) {
            startDate.setHours(fechaTime.value.substring(0, 2), fechaTime.value.substring(3, 5), 0, 0);
        } else {
            startDate.setHours(0, 0, 0, 0);
        }
        return startDate;
    }

    private ValidarFecha(fechaMin: Date, fechaMax: Date): boolean {
        if (fechaMin && fechaMax) {
            if ((fechaMax.getTime() - fechaMin.getTime()) <= 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Estas seguro que la fecha maxima es menor que la fecha minima??'
                });
                return false;
            }
        }
        return true;
    }

    cambioFecha(type: string, fechaName: string, event: MatDatepickerInputEvent<Date>) {
      // Obtener el control de tiempo correspondiente
      let timeControl: FormControl;

      if (fechaName === 'registro') {
        timeControl = type === 'start' ? this.fRegistroTimeStart : this.fRegistroTimeEnd;
      } else {
        timeControl = type === 'start' ? this.fCTimeStart : this.fCTimeEnd;
      }

      // Configurar el control de tiempo
      if (!event.value) {
        timeControl.reset();
        timeControl.disable();
      } else {
        timeControl.setValue(type === 'start' ? '00:00' : '23:59');
        timeControl.enable();
      }
    }

    toggleAll() {
        for (let i = 0; i < Object.keys(this.form.controls).length; i++) {
            const element = Object.keys(this.form.controls)[i];
            this.form.controls[element].setValue( this.masterSelected);
        }
      }

      openDiagram() {
              // Example proceso data for demo; replace with real data as needed
              const demo: Proceso = {
                  id: 'root',
                  nombre: 'Proceso Raiz',
                  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png',
                  children: [
                      { id: 'c1', nombre: 'Hijo 1',  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png',
                  children: [ { id: 'c1-1', nombre: 'Nieto 1' , roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png'}, { id: 'c1-2', nombre: 'Nieto 2' , roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png'} ] },
                      { id: 'c2', nombre: 'Hijo 2' , roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png'},
                      { id: 'c3', nombre: 'Hijo 3',  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png',children: [ { id: 'c3-1', nombre: 'Nieto A',  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png' }, { id: 'c3-2', nombre: 'Nieto B' ,  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png'}, 
                          { id: 'c3-3', nombre: 'Nieto C',  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png',children: [{ id: 'c3-3-1', nombre: 'BisNieto A',  roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png' }, { id: 'c3-3-2', nombre: 'BisNieto B' , roles: 5,
                  plantillas: 3,
                  apis: 2,
                  reportes: 4,
                  imagen: 'https://fs.softwareparati.com/modulo.png'}] } 
                      ] }
                  ]
              };
      
              const w = Math.min(window.innerWidth * 0.8, 1400);
              const h = Math.min(window.innerHeight * 0.8, 900);
      
              this.dialog.open(BpmDiagramComponent, {
                  width: '80vw',
                  height: '80vh',
                  panelClass: 'bpm-dialog',
                  data: {
                      proceso: demo,
                      width: w,
                      height: h
                  }
              });
          }
}
