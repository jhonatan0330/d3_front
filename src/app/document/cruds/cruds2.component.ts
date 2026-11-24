import { AfterViewInit, Component,  OnDestroy, OnInit, Type, ViewContainerRef, ChangeDetectionStrategy, inject, viewChild, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
    DocumentoPlantillaDTO,
    PedidoVentaCaracteristicaDTO,
    PedidoVentaCaracteristicaFilterDTO,
    PedidoVentaDTO,
    ReporteBaseDTO,
} from 'app/document/document.types';
import { PedidoVentaFilterDTO } from 'app/document/document.types';
import { DocumentApi } from 'app/document/document.api';
import { TemplateService } from 'app/document/service/template.service';
import { FormComponent } from 'app/document/form/form.component';
import { documentFormDialogConfig } from 'app/document/form/document-form.dialog';
import { BpmDiagramComponent } from 'app/configuration/components/bpm-diagram/bpm-diagram.component';
import { closeOpenDialog } from 'app/shared/dialogs/dialog.utils';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { DocumentoPlantillaCaracteristicaEnum, StatesEnum } from 'app/document/form/form.enum';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { IDynamicControl } from 'app/document/form/controls/base/base.component';
import { getComponent } from 'app/document/form/form-helper';
import { MatDatepickerInputEvent, MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatSuffix, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { DocumentListComponent } from 'app/document/cruds/document-list.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentFilterService } from 'app/document/document-filter.service';

export interface Cruds2DialogData {
    plantilla: DocumentoPlantillaDTO;
    filtro?: PedidoVentaFilterDTO;
}

@Component({
    selector: 'app-cruds',
    templateUrl: './cruds2.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block h-full w-full' },
    imports: [MatIcon, FormsModule, ReactiveFormsModule, 
        MatFormField, MatInput, MatSuffix, MatLabel, 
        MatDatepickerInput, MatDatepickerToggle, MatDatepicker,
        DropdownComponent, DropdownItemComponent, DocumentListComponent]
})
export class Cruds2Component implements OnInit, AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private templateService = inject(TemplateService);
    private api = inject(DocumentApi);
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);
    private notificationCenter = inject(NotificationCenterService);
    private dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);
    private readonly documentFilter = inject(DocumentFilterService);
    private readonly dialogData = inject<Cruds2DialogData | null>(MAT_DIALOG_DATA, { optional: true });
    private readonly dialogRef = inject<MatDialogRef<Cruds2Component> | null>(MatDialogRef, { optional: true });
    readonly dialogMode = !!this.dialogData?.plantilla;
    private readonly initialFilter = signal(this.dialogData?.filtro ?? null);

    plantilla = signal<DocumentoPlantillaDTO | null>(null); // Estructura base de la lista
    templatesFromProcess = signal<DocumentoPlantillaDTO[]>([]);
    tableroId: string;
    procesoId: string | null;

    // Variables para sincronizar con la vista
    queryFilter = signal<PedidoVentaFilterDTO | null>(null);
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
    ordenCampo = signal(''); // Campo por el cual ordenar: ''=fecha, 'N'=nombre, 'D'=descripcion
    ascendente = signal(false); // Por defecto descendente; si se marca, ascendente
    isLoading = signal(false);
    viewMode: 'grid-view' | 'list-view' = 'grid-view';
    form: FormGroup = new FormGroup({});
    hasCreatePermission = signal(false);
    reportForms = signal<PropiedadDTO[]>([]);

    // textoInicial: string; // Usado para colocar el texto incial de los fomrularios nuevos, ejemplo un cliente buscado no encontrado
    // campoHerencia: string; // Usado para enviar el id del campo que tiene herencia

    solicitarFechas = true;

    masterSelected: boolean = false;


    drawerMode = signal<'over' | 'side'>('side');
    drawerOpened = signal(true);
    private _mediaQuery = window.matchMedia('(min-width: 960px)');
    private _mediaHandler = (e: MediaQueryListEvent) => {
        this.drawerMode.set(e.matches ? 'side' : 'over');
        this.drawerOpened.set(e.matches);
    };

    //VAriables del filtro
    readonly myForm = viewChild('dynamycFormElement', { read: ViewContainerRef });
    readonly documentList = viewChild(DocumentListComponent);
    dynamicControls = signal<IDynamicControl[]>([]);

    ngOnInit(): void {
        if (this.dialogData?.plantilla) {
            this.plantilla.set(this.dialogData.plantilla);
            this.procesoId = null;
            this.initializeTemplate();
            if (this.dialogData.filtro) {
                this.queryFilter.set(this.withDialogDefaults(this.dialogData.filtro));
            }
        } else {
            this.route.params
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((params: Params) => {
                    const propType = params.type;
                    if (!propType) {
                        this.router.navigate(['/main']);
                        return;
                    }

                    this.queryFilter.set(null);
                    this.templatesFromProcess.set([]);
                    this.fControlSearch.setValue('');
                    this.ordenCampo.set('');
                    this.ascendente.set(false);
                    this.procesoId = null;

                    if (propType === 'list') {
                        this.plantilla.set(this.templateService.getTemplate(params.id)!);
                    } else if (propType === 'process_crud') {
                        this.procesoId = params.id;
                        if (this.procesoId) {
                            this.plantilla.set(this.templateService.getProceso(this.procesoId)!);
                            this.templatesFromProcess.set(this.templateService.getTemplateOfProcess(this.procesoId)!
                                .filter(item => item.propiedades &&
                                    PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR) &&
                                    PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PLANTILLA_INICIA_PROCESO)));
                        }
                    } else {
                        this.router.navigate(['/main']);
                        return;
                    }

                    if (!this.plantilla()) {
                        this.router.navigate(['/main']);
                        return;
                    }
                    this.initializeTemplate();
                });
        }

        this.drawerMode.set(this._mediaQuery.matches ? 'side' : 'over');
        this.drawerOpened.set(this._mediaQuery.matches);
        this._mediaQuery.addEventListener('change', this._mediaHandler);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.showFields();
        });
    }

    private initializeTemplate(): void {
        const plantilla = this.plantilla();
        if (!plantilla) {
            return;
        }

        this.solicitarFechas = !PlantillaHelper.isEmpty(
            plantilla.propiedades,
            PlantillaHelper.FORM_SOLICITAR_FECHAS);
        this.reportForms.set(PlantillaHelper.buscarValorMultiple(
            plantilla.propiedades,
            PlantillaHelper.REPORT_MODULE_REFERENCE) ?? []);
        if (!this.solicitarFechas && this.templatesFromProcess()) {
            this.solicitarFechas = this.templatesFromProcess().some(template =>
                !PlantillaHelper.isEmpty(template.propiedades, PlantillaHelper.FORM_SOLICITAR_FECHAS));
        }
        if (this.solicitarFechas) {
            this.fCDateStart.setValue(new Date());
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);
            this.fCDateEnd.setValue(endDate);
            this.fCTimeStart.enable();
            this.fCTimeEnd.enable();
            this.fCTimeStart.setValue('00:00');
            this.fCTimeEnd.setValue('23:59');
        } else {
            this.fCDateStart.setValue(null);
            this.fCDateEnd.setValue(null);
            this.fCTimeStart.reset();
            this.fCTimeEnd.reset();
            this.fCTimeStart.disable();
            this.fCTimeEnd.disable();
        }
        this.fRegistroDateStart.setValue(null);
        this.fRegistroDateEnd.setValue(null);
        this.fRegistroTimeStart.disable();
        this.fRegistroTimeEnd.disable();

        this.hasCreatePermission.set(!PlantillaHelper.isEmpty(
            plantilla.propiedades,
            PlantillaHelper.PERMISO_PLANTILLA_CREAR
        ));
        if (plantilla.estados) {
            const stateControls = [];
            const initialFilter = this.initialFilter();
            const initialStateIds = [
                initialFilter?.estado,
                initialFilter?.estadoExpediente,
            ].filter((value): value is string => !!value)
                .flatMap(value => value.split(';'))
                .filter(value => !!value);

            for (const state of plantilla.estados) {
                if (!state.llaveTabla) state.llaveTabla = state.estadoDocumento;
                stateControls[state.llaveTabla] = new FormControl(
                    initialStateIds.length
                        ? initialStateIds.includes(state.llaveTabla) || initialStateIds.includes(state.estadoDocumento)
                        : state.estadoDocumento === StatesEnum.ACTIVE
                );
            }
            this.form = this.formBuilder.group(stateControls);
        }
        this.showFields();
    }

    ngOnDestroy(): void {
        this._mediaQuery.removeEventListener('change', this._mediaHandler);
    }

    private withDialogDefaults(initialFilter: PedidoVentaFilterDTO): PedidoVentaFilterDTO {
        const filter = Object.assign(new PedidoVentaFilterDTO(), initialFilter);
        if (!filter.estado && !filter.estadoExpediente) {
            filter.estado = StatesEnum.ACTIVE;
        }
        return filter;
    }

    /**
       * Toggle the drawer
       */
    toggleDrawer(): void {
        this.drawerOpened.update(v => !v);
    }

    openDialogFromTemplateModule() {
        if (!this.plantilla()) { return; }
        this.openDialog(this.plantilla()!.llaveTabla);
    }

    openDialog(template: string) {
        if (!template) { return; }
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = template;
        this.dialog.open(FormComponent, documentFormDialogConfig(pedidoVenta));
    }

    getColor(pEstado: string) {
        return this.templateService.getColor(pEstado);
    }


    getColorFont(pEstado: string) {
        return this.templateService.getColorFont(pEstado);
    }

    applyFilter(): void {
        if (this.isLoading()) {
            return;
        }
        const dynamicFields = this.dynamicControls().map(fieldFilter => {
            const field = new PedidoVentaCaracteristicaFilterDTO();
            field.campo = fieldFilter.data.campo;
            field.valorOpcion = fieldFilter.data.valorOpcion;
            field.valorAuxiliar = fieldFilter.data.valorAuxiliar;
            field.valorText = fieldFilter.data.valorText;
            return field;
        });
        const selectedStates = Object.keys(this.form.controls)
            .filter(stateId => this.form.controls[stateId].value);

        const result = this.documentFilter.build({
            plantillaId: this.plantilla()?.llaveTabla ?? null,
            processId: this.procesoId,
            boardFieldId: this.tableroId ?? null,
            exactCode: !!this.fControlCheck.value,
            searchText: this.fControlSearch.value,
            documentDateStart: this.fCDateStart.value,
            documentDateEnd: this.fCDateEnd.value,
            documentTimeStart: this.fCTimeStart.value,
            documentTimeEnd: this.fCTimeEnd.value,
            registrationDateStart: this.fRegistroDateStart.value,
            registrationDateEnd: this.fRegistroDateEnd.value,
            registrationTimeStart: this.fRegistroTimeStart.value,
            registrationTimeEnd: this.fRegistroTimeEnd.value,
            requestDocumentDates: this.solicitarFechas,
            statesEnabled: !!this.plantilla()?.estados?.length,
            selectedStates,
            orderField: this.ordenCampo() || null,
            ascending: this.ascendente(),
            dynamicFields,
            initialFilter: this.initialFilter(),
        });

        if (result.error) {
            this.notificationCenter.fire({
                icon: 'warning',
                title: 'Filtros',
                text: result.error,
            });
            return;
        }

        this.queryFilter.set(result.filter);
    }

    closeDialog(): void {
        this.dialogRef?.close();
    }

    openDocument(pDocument: PedidoVentaDTO) {
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = pDocument.plantilla;
        pedidoVenta.llaveTabla = pDocument.llaveTabla;
        this.dialog.open(FormComponent, documentFormDialogConfig(pedidoVenta));
    }

    showAllReport(reporte: ReporteBaseDTO): void {
        this.documentList()?.showReport(reporte, null);
    }

    ///////////////////////////////////////////////////////
    ///////////////ESTO ES MUY PARECIDO///////////////////
    ///////////////A FORM////////////////////////////////////


    // Agrega los campos al formulario de busqueda
    showFields() {

        const myForm = this.myForm();
        if (myForm) {
            myForm.clear();
            this.dynamicControls.set([]);
        } else {
            // Espero que se cargue con el AfterInitView
            return;
        }
        if (!this.plantilla()) { return; }
        //Cuando es tipo proceso no puedo encontrar los campos de todas las plantillas
        if (this.plantilla()!.estado === 'T') { return; }
        if (!this.plantilla()!.caracteristicas) {
            this.cargarPlantilla(this.plantilla()!.llaveTabla);
            return;
        }
        const filterDocument = new PedidoVentaDTO;
        this.plantilla()!.caracteristicas.forEach((_campo) => {
            if (_campo.tipo === DocumentoPlantillaCaracteristicaEnum.PROCESO
                && PlantillaHelper.isEmpty(_campo.propiedades, PlantillaHelper.MULTIPLE)
                && PlantillaHelper.isEmpty(_campo.propiedades, PlantillaHelper.PERMISO_CAMPO_BLOQUEAR)) {
                const componentDynamic: Type<any> = getComponent(_campo);
                const componentRef = this.myForm()!.createComponent<IDynamicControl>(
                    componentDynamic
                );
                componentRef.instance.structure = _campo;
                componentRef.instance.parent = filterDocument
                const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                uc.campo = _campo.llaveTabla;
                componentRef.instance.data = uc;
                this.dynamicControls.update(controls => [...controls, componentRef.instance]);
            }
        });
        // Colocar listener de Dependientes
        for (let j = 0; j < this.plantilla()!.caracteristicas.length; j++) {
            const iBase = this.plantilla()!.caracteristicas[j];
            const codigoDepende: PropiedadDTO[] | null = PlantillaHelper.buscarValorMultipleFromManyKeys(
                iBase.propiedades,
                [PlantillaHelper.DEPENDE, PlantillaHelper.INFORMATIVE_DATA, PlantillaHelper.UPDATE_INFORMATIVE_FIELD]
            );
            //No pude colocar todos los depends
            // PlantillaHelper.DEPENDENT_PROPERTIES
            if (codigoDepende) {
                let iCampoDependiente; // Identifico el campo dependiente
                for (let index = 0; index < this.dynamicControls().length; index++) {
                    const iFieldDependiente: IDynamicControl = this.dynamicControls()[index];
                    if (iFieldDependiente.structure.codigo === iBase.codigo) {
                        iCampoDependiente = iFieldDependiente;
                        break;
                    }
                }
                if (iCampoDependiente) {
                    for (let z = 0; z < codigoDepende.length; z++) {
                        const codigo = codigoDepende[z];
                        for (let k = 0; k < this.dynamicControls().length; k++) {
                            const iFieldReferenciado = this.dynamicControls()[k];
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
    cargarPlantilla(plantillaId: string): DocumentoPlantillaDTO {
        const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
            plantillaId
        )!;
        if (dp) {
            // Si la plantilla no tiene caracteristicas se debe consultar al servidor de forma completa
            if (!dp.caracteristicas) {
                this.isLoading.set(true);
                this.api
                    .obtenerCampos(plantillaId)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: (plantilla: DocumentoPlantillaDTO) => {
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
            this.notificationCenter.fire('Autorizacion', 'No tienes permisos para ver este documento.', 'info');
            return null!;
        }
    }

    // Metodo que recibe la llamada asincrona de cargar los campos de una plantilla
    cargarCamposPlantilla(value: DocumentoPlantillaDTO) {
        const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
            value.llaveTabla
        )!;
        if (dp) {
            dp.caracteristicas = value.caracteristicas;
            this.templateService.getTemplate(value.llaveTabla)!.caracteristicas =
                value.caracteristicas;
            if(this.plantilla()) {
                this.plantilla()!.caracteristicas = value.caracteristicas;
            }
            this.showFields();
        } else {
            console.error('No se encuentra cargada la plantilla en memoria');
            return;
        }
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
          const processId = this.procesoId || this.plantilla()?.proceso;
          if (!processId) return;
          closeOpenDialog(this.dialog, BpmDiagramComponent);
          this.dialog.open(BpmDiagramComponent, {
              width: '92vw',
              height: '84vh',
              maxWidth: '98vw',
              panelClass: 'bpm-dialog',
              data: { procesoId: processId },
          });
      }
}
