import { Component, OnInit, ViewContainerRef, Type, AfterViewInit, HostListener, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
    DetallePedidoVentaDTO,
    DocumentoPlantillaCaracteristicaDTO,
    DocumentoPlantillaDTO,
    PedidoVentaAjusteDTO,
    PedidoVentaCaracteristicaDTO,
    PedidoVentaDineroDTO,
    PedidoVentaDTO,
    PedidoVentaFilterDTO,
    ProcesoEstadoDTO,
    ProcesoTransicionDTO,
    ReporteBaseDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import {
    DocumentoPlantillaCaracteristicaEnum,
    StatesEnum,
} from 'app/modules/full/neuron/model/sw42.enum';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { IDynamicControl } from './controls/base/base.component';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getComponent } from 'app/modules/full/neuron/form-helper';
import Swal from 'sweetalert2';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { Router } from '@angular/router';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatCard } from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { SlicePipe, TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CdkDrag, CdkDragHandle, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem, MatCard, MatProgressBar, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatAutocompleteTrigger, MatAutocomplete, MatOption, MatButton, MatTooltip, SlicePipe, TitleCasePipe, CurrencyPipe, DatePipe, ImageFormatPipe]
})
export class FormComponent implements OnInit, AfterViewInit {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject<MatDialogRef<FormComponent>>(MatDialogRef);
    private templateService = inject(TemplateService);
    private api = inject(ApiService);
    _jwt = inject(LoginService);
    private ls = inject(LocalStoreService);
    private utilsService = inject(UtilsService);
    private _router = inject(Router);

    // Variables para el control de los campos
    readonly myForm = viewChild('dynamycFormElement', { read: ViewContainerRef });
    formIsModified = false;
    dynamicControls: IDynamicControl[] = [];

    // flags
    submitted = false;
    modificable = false;
    instruccionCrear?: string;
    fullScreen = false;

    pedidoBase?: PedidoVentaDTO; // Lo uso para guardar lo que recibi para crear el formulario
    plantilla?: DocumentoPlantillaDTO; // Contiene la estructura del formulario
    pedido?: PedidoVentaDTO; // Contiene la data del formulario

    esRol = false;

    // Variables de comportamiento
    identificadorInicial?: string; // La use para llenar el campo inicial
    close2Save = false;
    // Para pasajes
    saveInField = false;
    openQuickTransitionAfterSave?: string;

    // ACTIONS

    auxPlantillaProxima?: string; // LAs transiciones aveces no tienen cargados los campos y se encesitan
    documentToTransition?: PedidoVentaDTO;
    transiciones: ProcesoTransicionDTO[] = []; // Lista de botones
    uidOpenToNotDuplicate?: string;

    // REPORTS
    reportes: ReporteBaseDTO[] = [];


    canMassive = false;
    canTransfer = false;
    canDuplicate = false;
    hasVoucher = false;


    // Cambiar estado
    canChangeState = false;
    isChangeState = false;
    changeStateIsLoading = false;
    changeStateForm?: FormGroup;
    isLoading = false;

    private CAMPO_POSIBLE_MENOR_PRIORIDAD = '__*__';

    styleSizePop = '';

    ngOnInit(): void {

        // Validaciones para evitar null
        if (this.pedidoBase && this.pedidoBase === this.data.data) {
            return;
        }
        
        if (this._jwt.token !== this._jwt.getJwtToken()) {
            location.reload();
            this.dialogRef.close(false);
            return;
        }

        this.pedidoBase = this.data.data;
        this.identificadorInicial = this.data.identificador;
        this.saveInField = this.data.saveInField;
        this.openQuickTransitionAfterSave = this.data.openQuickTransitionAfterSave;
        //this
        if (this.data.close2Save) {
            this.close2Save = this.data.close2Save;
        }
        if (!this.pedidoBase) {
            return;
        }
        // Cargo la plantilla al formulario para comenzar
        this.plantilla = this.cargarPlantilla(this.pedidoBase.plantilla, this.pedidoBase.server);
        // Si la plantilla se consulta por primera vez se va asincrona asi que finaliza este metodo
        if (!this.plantilla) {
            return;
        }
        // Si la plantilla no se carga asincronamente
        if (this.pedidoBase.llaveTabla) {
            // Camino Update
            this.consultarDocumento(this.pedidoBase.llaveTabla);
        } else {

            if (!PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.FUNCION_SQL_NEW_ANTES)) {
                this.validacionPrevia();
            } else {
                this.pedido = this.copiarPedidoBase(this.pedidoBase, false);
            }
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.showForm();
        });
        this.uidOpenToNotDuplicate = Date.now().toString();
    }

    submit() {
        if (this.submitted) {
            return;
        }
        if (!this.modificable) {
            return;
        }
        
        this.submitted = true;
        // La variable modificado me indica si el usuario hizo cambios a los datos
        for (let i = 0; i < this.dynamicControls.length; i++) {
            const element = this.dynamicControls[i];
            if (!element.send2Server()) {
                this.submitted = false;
                return;
            }
        }

        // esto me ahorra varios update de lo mismo
        let modificado = false;
        if (
            this.pedido.caracteristicas != null &&
            this.pedido.caracteristicas.length !== 0
        ) {
            for (let index = 0; index < this.pedido.caracteristicas.length; index++) {
                const element = this.pedido.caracteristicas[index];
                if (element.modificado) {
                    modificado = true;
                    break;
                }
            }
        }
        // this.plantillaTransicionSiguiente = item.plantilla;
        if (this.pedido.llaveTabla && !modificado) {
            alert('No se ha realizado ninguna modificacion');
            this.submitted = false;
            return;
        }
        this.pedidoBase.messages = [];

        // Esto sirve para pasajes para un transbordo que guarda varios tipos documento que despues va a almacenar
        if (this.saveInField) {
            if (this.dialogRef) {
                this.dialogRef.close({ data: this.pedido });
            }
        } else {
            this.api
                .guardarDocumento(this.copiarPedidoBase(this.pedido, true), this.plantilla.server, this.uidOpenToNotDuplicate)
                .subscribe({
                    next: (dataResult: PedidoVentaDTO) => {
                        this.openManager(dataResult);
                    },
                    error: () => {
                        this.submitted = false;
                    },
                });
        }




    }

    openManager(value: PedidoVentaDTO) {
        const openNewFormCopyData: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(this.plantilla.propiedades, PlantillaHelper.PERMISO_PLANTILLA_INICIO_RAPIDO);
        const successFullText = PlantillaHelper.buscarValor(this.plantilla.propiedades, PlantillaHelper.PLANTILLA_SUCCESS_INFORMATION);
        if ((!this.identificadorInicial && !this.close2Save && !successFullText) || openNewFormCopyData) {
            const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
            pedidoVenta.plantilla = value.plantilla;
            if (openNewFormCopyData) {
                for (let i = 0; i < openNewFormCopyData.length; i++) {
                    const iCopyData = openNewFormCopyData[i];
                    for (let j = 0; j < this.pedido.caracteristicas.length; j++) {
                        const jField = this.pedido.caracteristicas[j];
                        if (jField.campo === iCopyData.valor) {
                            if (!pedidoVenta.caracteristicas) pedidoVenta.caracteristicas = [];
                            const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                            uc.valorOpcion = jField.valorOpcion;
                            uc.valorAuxiliar = jField.valorAuxiliar;
                            uc.valorFecha = jField.valorFecha;
                            uc.valorNumero = jField.valorNumero;
                            uc.valorText = jField.valorText;
                            uc.campo = jField.campo;
                            pedidoVenta.caracteristicas.push(uc);
                            break;
                        }
                    }
                }
            } else {
                pedidoVenta.llaveTabla = value.llaveTabla;
            }
            pedidoVenta.server = this.plantilla.server;
            pedidoVenta.messages = value.messages;
            this.utilsService.modalWithParams(pedidoVenta);
        } else {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: value.nombre,
                showConfirmButton: false,
                timer: 1500
            });
        }
        this.pedido.llaveTabla = value.llaveTabla;
        for (let r = 0; r < this.reportes.length; r++) {
            const _report = this.reportes[r];
            if (PlantillaHelper.buscarValor(_report.propiedades, PlantillaHelper.REP_AUTOPRINT)) {
                this.showReport(_report);
            }
        }
        this.submitted = false;

        if (successFullText) {
            // Aqui va los cambios de variables
            this.utilsService.modalSuccess(successFullText);
        }

        if(this.plantilla && this.plantilla.estados && this.plantilla.estados.length > 0 ){
            for (let i = 0; i < this.plantilla.estados.length; i++) {
                if(this.plantilla.estados[i].llaveTabla === value.estadoExpediente && this.plantilla.estados[i].transiciones && this.plantilla.estados[i].transiciones.length > 0){
                    for (let j = 0; j < this.plantilla.estados[i].transiciones.length; j++) {
                        const _transition = this.plantilla.estados[i].transiciones[j];
                        if (_transition.rapida) {
                            this.reloadScreen(_transition.plantilla);
                            //this.formIsModified = false;
                            //this.crearPlantilla(_transition.plantilla, value);
                            return;
                        }
                    }
                }
            }
        }

        if (this.dialogRef) {
            if (!openNewFormCopyData) {
                this.dialogRef.close({ data: value });
            } else {
                this.dialogRef.close();
            }
        }
    }

    // Consulta en el servidor el documento
    consultarDocumento(id: string) {
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.llaveTabla = id;
        this.api.consultarDocumento(entity, this.plantilla.server).subscribe({
            next: (_value: PedidoVentaDTO) => {
                this.pedido = _value;
                this.pedido.messages = this.pedidoBase.messages;
                this.showForm();
            },
            error: () => {
                this.dialogRef.close();
            }
        });
    }

    validacionPrevia() {
        if (!this.plantilla || !this.plantilla.llaveTabla) return;
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.plantilla = this.plantilla.llaveTabla;
        this.api.validateBeforeNew(entity, this.plantilla.server).subscribe({
            next: (_value: PedidoVentaDTO) => {
                if (_value && _value.messages && _value.messages.length > 0) {
                    let mensajeToShow = '';
                    for (let i = 0; i < _value.messages.length; i++) {
                        const element = _value.messages[i];
                        mensajeToShow += element.message + '\n';
                    }
                    Swal.fire('Validacion', mensajeToShow, 'info');
                    this.dialogRef.close();
                } else {
                    this.pedido = this.copiarPedidoBase(this.pedidoBase, false);
                    this.showForm();
                }
            },
            error: () => {
                this.dialogRef.close();
            }
        });
    }

    // Consulto de las plantillas generales la plantilla
    cargarPlantilla(plantillaId: string, urlServer: string): DocumentoPlantillaDTO {
        const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
            plantillaId, urlServer
        );
        if (dp) {
            if (!this.pedidoBase.llaveTabla && PlantillaHelper.isEmpty(dp.propiedades,
                PlantillaHelper.PERMISO_PLANTILLA_CREAR
            )) {
                Swal.fire('Autorizacion', 'No tienes permisos para crear registros este tipo de documento. ' + dp.nombre, 'info');
                this.dialogRef.close();
                return;
            }
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
                            this.dialogRef.close();
                        }
                    });
                return;
            } else {
                return dp;
            }
        } else {
            Swal.fire('Autorizacion', 'No tienes permisos para ver este documento.', 'info');
            this.dialogRef.close();
            return;
        }
    }

    // Metodo que recibe la llamada asincrona de cargar los campos de una plantilla
    cargarCamposPlantilla(value: DocumentoPlantillaDTO) {
        // La idea es sincronizar la informacion de la plantilla
        // Falta hacer que se reemplace la plantilla en el array general       :(
        const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
            value.llaveTabla, value.server
        );
        if (dp) {
            dp.caracteristicas = value.caracteristicas;
            this.templateService.getTemplate(value.llaveTabla, value.server).caracteristicas =
                value.caracteristicas;
            // SettingsManager.getInstance().setSetting("DP_" + value.llaveTabla, dp);

            if (!this.plantilla) {
                // asumo que esta en el form principal  y que es la primera vez que consulta
                this.plantilla = dp;
                //   El camino normal es que venga por este lado
                if (this.pedidoBase) {
                    if (this.pedidoBase.llaveTabla) {
                        this.consultarDocumento(this.pedidoBase.llaveTabla);
                    } else {
                        this.pedido = this.copiarPedidoBase(this.pedidoBase, false);
                        this.showForm();
                    }
                }
            } else {
                if (this.auxPlantillaProxima) {
                    this.crearPlantilla(this.auxPlantillaProxima, this.documentToTransition);
                    this.auxPlantillaProxima = null;
                    this.documentToTransition = null;
                }
                // asumo que es una transicion
            }
        } else {
            console.error('No se encuentra cargada la plantilla en memoria');
            return;
        }
    }

    // En el data del form viene un pedido, en este pedido existen varios atriburtos que queremos ver
    // en el nuevo formulario
    copiarPedidoBase(actual: PedidoVentaDTO, toSave: boolean): PedidoVentaDTO {
        const copyPedido: PedidoVentaDTO = new PedidoVentaDTO();
        if (toSave) {
            copyPedido.llaveTabla = actual.llaveTabla;
            copyPedido.estadoExpediente = actual.estadoExpediente;
        }
        copyPedido.plantilla = this.plantilla.llaveTabla;
        copyPedido.imagen = this.plantilla.imagen;
        copyPedido.caracteristicas = [];
        let coincidenciaCampo = false;
        if (this.plantilla.caracteristicas) {
            for (let i = 0; i < this.plantilla.caracteristicas.length; i++) {
                const element = this.plantilla.caracteristicas[i];
                const uc: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                uc.campo = element.llaveTabla;
                if (!toSave) {
                    uc.campoDTO = element;
                }
                // uc.valorText = rolCaracteristicaDTO.valorDefecto;
                if (actual.caracteristicas && actual.caracteristicas.length !== 0) {
                    coincidenciaCampo = false;
                    for (let j = 0; j < actual.caracteristicas.length; j++) {
                        const campo = actual.caracteristicas[j];
                        if (campo.campoDTO == null) {
                            if (campo.campo && campo.campo === element.llaveTabla) {
                                coincidenciaCampo = true;
                            }
                        } else {
                            if (
                                campo.campoDTO.codigo &&
                                campo.campoDTO.codigo === element.codigo
                            ) {
                                coincidenciaCampo = true;
                            } else {
                                if (
                                    campo.campoDTO.llaveTabla &&
                                    campo.campoDTO.llaveTabla === element.llaveTabla
                                ) {
                                    coincidenciaCampo = true;
                                }
                            }
                        }
                        if (coincidenciaCampo) {
                            uc.valorOpcion = campo.valorOpcion;
                            uc.valorAuxiliar = campo.valorAuxiliar;
                            uc.valorFecha = campo.valorFecha;
                            uc.valorNumero = campo.valorNumero;
                            uc.valorText = campo.valorText;
                            if (!toSave) {
                                uc.principal = campo.principal;
                            } else {
                                uc.modificado = campo.modificado;
                                uc.llaveTabla = campo.llaveTabla;
                            }
                            uc.expedientes = campo.expedientes;
                            uc.productosExclusivos = campo.productosExclusivos;
                            if (campo.detalles) {
                                uc.detalles = [];
                                for (let m = 0; m < campo.detalles.length; m++) {
                                    const dpv = campo.detalles[m];
                                    const newDetalle: DetallePedidoVentaDTO = new DetallePedidoVentaDTO();
                                    newDetalle.cantidad = dpv.cantidad;
                                    newDetalle.cantidadTotal = dpv.cantidadTotal;
                                    newDetalle.nombre = dpv.nombre;
                                    newDetalle.producto = dpv.producto;
                                    newDetalle.valorMaximo = dpv.valorMaximo;
                                    newDetalle.valorMinimo = dpv.valorMinimo;
                                    newDetalle.valorSubtotal = dpv.valorSubtotal;
                                    newDetalle.valorTotal = dpv.valorTotal;
                                    newDetalle.valorUnitario = dpv.valorUnitario;

                                    newDetalle.cantidadPromocion = dpv.cantidadPromocion;
                                    newDetalle.cantidadPromocionBase = dpv.cantidadPromocionBase;

                                    newDetalle.detalleId = dpv.detalleId;
                                    newDetalle.plantilla = dpv.plantilla;
                                    newDetalle.plantillaDetalle = dpv.plantillaDetalle;

                                    newDetalle.documentoDetalle = new PedidoVentaDTO();
                                    newDetalle.documentoDetalle.estadoExpediente = dpv.documentoDetalle.estadoExpediente
                                    newDetalle.documentoDetalle.caracteristicas = [];
                                    for (let n = 0; n < dpv.documentoDetalle.caracteristicas.length; n++) {
                                        const campoInterno = dpv.documentoDetalle.caracteristicas[n];
                                        const cpInterno: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                                        cpInterno.campo = campoInterno.campo;
                                        if (!toSave) { cpInterno.campoDTO = campoInterno.campoDTO; }
                                        cpInterno.valorOpcion = campoInterno.valorOpcion;
                                        cpInterno.valorAuxiliar = campoInterno.valorAuxiliar;
                                        cpInterno.valorFecha = campoInterno.valorFecha;
                                        cpInterno.valorNumero = campoInterno.valorNumero;
                                        cpInterno.valorText = campoInterno.valorText;
                                        cpInterno.modificado = campoInterno.modificado;
                                        cpInterno.principal = campoInterno.principal;
                                        newDetalle.documentoDetalle.caracteristicas.push(cpInterno);
                                    }

                                    if (!toSave) {
                                        newDetalle.llaveTabla = null;
                                        newDetalle.propiedades = dpv.propiedades;
                                        newDetalle.tarifas = dpv.tarifas;
                                    } else {
                                        newDetalle.llaveTabla = dpv.llaveTabla;
                                    }
                                    uc.detalles.push(newDetalle);
                                }
                            }
                            break;
                        }
                    }
                }
                copyPedido.caracteristicas.push(uc);
            }
        }
        // if(plantilla.costo!=null)
        if (actual.dinero) {
            copyPedido.dinero = new PedidoVentaDineroDTO();
            copyPedido.dinero.valorTotal = actual.dinero.valorTotal;
            copyPedido.dinero.saldo = actual.dinero.saldo;
        }
        return copyPedido;
    }

    // Funcion que se llama para llenar el formulario, con los campos
    showForm() {

        if (
            !this.plantilla ||
            !this.plantilla.caracteristicas ||
            !this.pedido ||
            this.dynamicControls.length !== 0
        ) {
            return;
        }
        if (!this.pedido.llaveTabla) {
            if (
                !PlantillaHelper.isEmpty(
                    this.plantilla.propiedades,
                    PlantillaHelper.PERMISO_PLANTILLA_CREAR
                ) &&
                PlantillaHelper.isEmpty(
                    this.plantilla.propiedades,
                    PlantillaHelper.PLANTILLA_OCULTAR_GUARDAR
                )
            ) {
                this.modificable = true;
                this.formIsModified = true;
            }
        } else {
            this.modificable = !PlantillaHelper.isEmpty(
                this.plantilla.propiedades,
                PlantillaHelper.PERMISO_PLANTILLA_MODIFICAR
            );
            if (this.modificable && this.pedido.estadoExpediente) {
                if (this.plantilla.estados && this.plantilla.estados.length !== 0) {
                    for (let i = 0; i < this.plantilla.estados.length; i++) {
                        const estadoModificable = this.plantilla.estados[i];
                        if (estadoModificable.llaveTabla === this.pedido.estadoExpediente) {
                            this.modificable = !PlantillaHelper.isEmpty(
                                estadoModificable.propiedades,
                                PlantillaHelper.MODIFICABLE
                            );
                            break;
                        }
                    }
                }
            }
        }
        this.instruccionCrear = PlantillaHelper.buscarValor(this.plantilla.propiedades, PlantillaHelper.PLANTILLA_INSTRUCCION_CREAR);
        if (this.instruccionCrear) { this.toogleScreen(); }
        this.showFields();
        this.resolvePropiertiesForm();
        this.getReports();
        if(this.openQuickTransitionAfterSave){
            this.crearPlantilla(this.openQuickTransitionAfterSave, this.pedido);
        }
    }



    // Agrega los campos al formulario
    showFields() {
        // En algunos formularios se envia el identificador
        // Form cliente el id
        if (this.identificadorInicial && !this.pedido.llaveTabla) {
            const consecutivoEscrito = PlantillaHelper.buscarPropiedad(
                this.plantilla.propiedades,
                PlantillaHelper.FORM_CONSECUTIVO
            );
            if (consecutivoEscrito) {
                for (let j = 0; j < this.pedido.caracteristicas.length; j++) {
                    const element = this.pedido.caracteristicas[j];
                    if (element.campo === consecutivoEscrito.valor) {
                        element.valorNumero = Number(this.identificadorInicial);
                        element.valorText = this.identificadorInicial;
                        break;
                    }
                }
            }
        }

        this.plantilla.caracteristicas.forEach((_campo) => {
            const componentDynamic: Type<any> = getComponent(_campo);
            const componentRef = this.myForm().createComponent<IDynamicControl>(
                componentDynamic
            );
            componentRef.instance.structure = _campo;
            componentRef.instance.parent = this.pedido;
            componentRef.instance.urlServer = this.plantilla.server;
            componentRef.instance.form = this;
            for (let index = 0; index < this.pedido.caracteristicas.length; index++) {
                const element = this.pedido.caracteristicas[index];
                if (element.campo === _campo.llaveTabla) {
                    componentRef.instance.data = element;
                    element.campoDTO = _campo;
                    componentRef.instance.formIsEnabled = this.modificable;
                    componentRef.instance.formIsModified.subscribe((x: boolean) => {
                        if (x) {
                            this.formIsModified = true;
                        }
                    });
                    break;
                }
            }
            this.dynamicControls.push(componentRef.instance);
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
                    const iFieldDependiente: IDynamicControl = this.dynamicControls[
                        index
                    ];
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
    /*******************************  ACTIONS *********************/

    // Resuelve las propiedades de la plantilla
    resolvePropiertiesForm() {


        if (this._jwt.isAdmin) {
            this.esRol = !PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.PLANTILLA_TIPO_ROL);
        }
        this.canMassive = !PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CARGA_MASIVA);
        if (this.pedido.llaveTabla) {
            this.hasVoucher = !PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.TEMPLATE_VOUCHER);
            if (!this.pedido.estadoExpediente) {
                // Solo se pueden anular los que estan en estado activo y que no son de un proceso
                if (this.pedido.estado === StatesEnum.ACTIVE) {
                    const plantillaEliminar = PlantillaHelper.buscarValor(this.plantilla.propiedades, PlantillaHelper.FORM_ANULAR);
                    if (plantillaEliminar) {
                        const tEliminar: DocumentoPlantillaDTO = this.templateService.getTemplate(plantillaEliminar, this.plantilla.server);
                        if (tEliminar && !PlantillaHelper.isEmpty(tEliminar.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
                            const _newtransicion: ProcesoTransicionDTO = new ProcesoTransicionDTO();
                            _newtransicion.imagen = tEliminar.imagen;
                            _newtransicion.plantilla = tEliminar.llaveTabla;
                            _newtransicion.nombre = tEliminar.nombre;
                            this.transiciones.push(_newtransicion);
                        }
                    }
                } else {
                    const _templateAction = PlantillaHelper.buscarValor(this.plantilla.propiedades, PlantillaHelper.FORM_ACTIVATE);
                    if (_templateAction) {
                        const _tAction: DocumentoPlantillaDTO = this.templateService.getTemplate(_templateAction, this.plantilla.server);
                        if (_tAction && !PlantillaHelper.isEmpty(_tAction.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
                            const _newAction: ProcesoTransicionDTO = new ProcesoTransicionDTO();
                            _newAction.imagen = _tAction.imagen;
                            _newAction.plantilla = _tAction.llaveTabla;
                            _newAction.nombre = _tAction.nombre;
                            this.transiciones.push(_newAction);
                        }
                    }
                }
            } else {
                this.canTransfer = !PlantillaHelper.isEmpty(
                    this.plantilla.propiedades,
                    PlantillaHelper.PERMISO_PLANTILLA_TRANSFERIR
                );
                this.canChangeState = !PlantillaHelper.isEmpty(
                    this.plantilla.propiedades,
                    PlantillaHelper.PERMISO_PLANTILLA_CAMBIAR_ESTADO
                );
                this.showActions();
            }
        }
    }

    // Cargo en el formulario los botones de accion

    getColor() {
        if (!this.pedido) { return null; }
        return this.templateService.getColor(this.pedido.estadoExpediente);
    }

    getColorFont() {
        if (!this.pedido) { return null; }
        return this.templateService.getColorFont(this.pedido.estadoExpediente);
    }

    showActions() {

        let _estadollave = this.pedido.estadoExpediente;
        if (!_estadollave) _estadollave = this.pedido.estado;

        this.getTransitionsOfTemplate(this.plantilla, _estadollave, this.pedido, false);

        // Lo retire porque se vehia muy feo todas las transiciones juntas
        if (this.pedido.llaveTabla && this.pedido.estado === 'A') {
            for (let _f = 0; _f < this.pedido.caracteristicas.length; _f++) {
                const _element = this.pedido.caracteristicas[_f];
                if (_element.campoDTO && _element.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.VINCULO) {
                    if (_element.expedientes) {
                        this.getTransitionsOfTemplate(
                            this.templateService.getTemplate(_element.expedientes[0].plantilla, null),
                            _element.expedientes[0].estadoExpediente, _element.expedientes[0], true);
                    } else {
                        //Para no crear una nueva propiedad use el campo del motivo
                        const _property = PlantillaHelper.buscarPropiedad(_element.campoDTO.propiedades, PlantillaHelper.VINCULO_DATA);
                        if (_property &&_property.motivo && !_property.relaciones) {
                            const _templateVinculo = this.templateService.getTemplate(_property.valor, null);
                            if (_templateVinculo) {
                                const _newtransicion: ProcesoTransicionDTO = new ProcesoTransicionDTO();
                                _newtransicion.imagen = _templateVinculo.imagen;
                                _newtransicion.plantilla = _templateVinculo.llaveTabla;
                                _newtransicion.nombre = _property.motivo.toUpperCase();
                                //_newtransicion.documentToTransition = pDocumentTransition;
                                this.transiciones.push(_newtransicion);
                            }
                        }
                    }
                }
            }
        }
    }

    getTransitionsOfTemplate(pTemplate: DocumentoPlantillaDTO, pState: string, pDocumentTransition: PedidoVentaDTO, pIsVinculo: boolean) {
        if (!pTemplate || !pTemplate.estados || pTemplate.estados.length === 0) return;

        for (let _iField = 0; _iField < pTemplate.estados.length; _iField++) {
            const _stateElement = pTemplate.estados[_iField];
            /*if (!this.pedido.llaveTabla && !estadollave) {
                estadollave = estadoIterador.llaveTabla;
            }*/
            if (_stateElement.llaveTabla === pState) {
                if (_stateElement.transiciones && _stateElement.transiciones.length === 0) return;
                for (let j = 0; j < _stateElement.transiciones.length; j++) {
                    const _transition = _stateElement.transiciones[j];
                    if (_transition.plantilla) {
                        const _templateTransition: DocumentoPlantillaDTO = this.templateService.getTemplate(_transition.plantilla, pTemplate.server);
                        if (_templateTransition && !PlantillaHelper.isEmpty(_templateTransition.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
                            //Esto es para que no se vean todas las transiciones, si toca mejorar un poco la logica por el momento va asi
                            if (pIsVinculo) {
                                if(PlantillaHelper.isEmpty(_transition.propiedades, PlantillaHelper.TRANSICION_VISIBLE_VINCULO)){
                                    continue;
                                }
                            }
                            const _newtransicion: ProcesoTransicionDTO = new ProcesoTransicionDTO();
                            _newtransicion.imagen = _templateTransition.imagen;
                            _newtransicion.plantilla = _templateTransition.llaveTabla;
                            _newtransicion.nombre = _transition.nombre;
                            _newtransicion.documentToTransition = pDocumentTransition;
                            this.transiciones.push(_newtransicion);
                        }
                    }
                }
                return;
            }
        }

    }

    // Se encarga de abrir el formulario de la transicion
    crearPlantilla(pNextTemplate: string, pDocument: PedidoVentaDTO) {
        if (!pNextTemplate) return;
        if (this.formIsModified) {
            Swal.fire('Guarda documento', 'Por favor guarda los cambios del documento antes de crear una nueva accion', 'info');
            return;
        }
        this.auxPlantillaProxima = pNextTemplate;
        this.documentToTransition = pDocument;
        const _nextTemplate: DocumentoPlantillaDTO = this.cargarPlantilla(pNextTemplate, this.plantilla.server);
        if (!_nextTemplate) return;
        // Se supone que la carga asincrona
        const _doc: PedidoVentaDTO = new PedidoVentaDTO();
        _doc.plantilla = pNextTemplate;
        const camposPosibles: DocumentoPlantillaCaracteristicaDTO[] = [];
        let textoCampoPosible: string;

        // Valido que existan caracteristicas con el mismo codigo y lo modifico
        if (_nextTemplate.caracteristicas) {
            for (let i = 0; i < _nextTemplate.caracteristicas.length; i++) {
                const campo = _nextTemplate.caracteristicas[i];
                // Itero por los campos del pedido para ver que tengan el mismo codigo
                if (pDocument.caracteristicas) {
                    for (let j = 0; j < pDocument.caracteristicas.length; j++) {
                        const campoDoc = pDocument.caracteristicas[j];
                        if (campo.codigo === campoDoc.campoDTO.codigo) {
                            if (!_doc.caracteristicas) {
                                _doc.caracteristicas = [];
                            }
                            campoDoc.principal = null;
                            _doc.caracteristicas.push(campoDoc);
                            break;
                        }
                    }
                }

                textoCampoPosible = this.validateIsPossibleField(campo, pDocument.plantilla);
                if (textoCampoPosible) {
                    if (textoCampoPosible === this.CAMPO_POSIBLE_MENOR_PRIORIDAD) {
                        camposPosibles.push(campo);
                    } else {
                        camposPosibles.unshift(campo);
                    }
                }
            }
        }


        if (camposPosibles.length !== 0) {
            const campoTransicion: DocumentoPlantillaCaracteristicaDTO = camposPosibles[0];
            if (!_doc.caracteristicas) _doc.caracteristicas = [];

            for (let k = 0; k < _doc.caracteristicas.length; k++) {
                const campoDocumento = _doc.caracteristicas[k];
                if (campoDocumento.campoDTO.codigo === campoTransicion.codigo) {
                    // pedidoVenta.caracteristicas.removeItem(campoDocumento);
                    _doc.caracteristicas = _doc.caracteristicas.filter(function (value) {
                        return value.llaveTabla !== campoDocumento.llaveTabla;
                    });
                    break;
                }
            }

            const campoBase: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
            campoBase.campoDTO = campoTransicion;

            if (pDocument.dinero) campoBase.valorNumero = pDocument.dinero.saldo;

            if (PlantillaHelper.isEmpty(campoTransicion.propiedades, PlantillaHelper.MULTIPLE)) {
                campoBase.valorText = pDocument.nombre;
                // Coloco el valor opcion para que el tipo proceso identifique la opcion
                campoBase.valorOpcion = pDocument.llaveTabla;
            } else {
                campoBase.expedientes = [];
                campoBase.expedientes.push(pDocument);
            }
            _doc.caracteristicas.push(campoBase);
        }
        _doc.server = this.plantilla.server;
        this.utilsService.modalWithParams(_doc, true).subscribe((res) => {
            if (res && this.dialogRef) {
                this.dialogRef.close();
                if (!this.close2Save) {
                    if (res && res.data && res.data.messages) { this.pedido.messages = res.data.messages; }
                    else { this.pedido.messages = null; }
                    this.utilsService.modalWithParams(this.pedido);
                }
            }
        });
    }

    // Solo lo uso en crear plantilla siguiente asi que puedo ver como optimizar despues
    validateIsPossibleField(campo: DocumentoPlantillaCaracteristicaDTO, plantilla: string): string {
        if (!campo || campo.formato !== DocumentoPlantillaCaracteristicaEnum.PROCESO) return null;

        const propAuxiliarTemplates: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(campo.propiedades, PlantillaHelper.PLANTILLA_AUXILIAR);
        if (!propAuxiliarTemplates || propAuxiliarTemplates.length === 0) {
            return this.CAMPO_POSIBLE_MENOR_PRIORIDAD; // necesito identificarle cual es el codigo y avece era un vacio
        }
        for (let index = 0; index < propAuxiliarTemplates.length; index++) {
            const param = propAuxiliarTemplates[index];
            if (param.valor === plantilla) {
                return param.valor;
            }
        }
        return null;
    }

    /*******************************REPORT *************/
    // Envio a imprimir los reportes
    getReports() {
        if (this.plantilla) {
            if (this.plantilla.reportes && this.plantilla.reportes.length !== 0) {
                for (let i = 0; i < this.plantilla.reportes.length; i++) {
                    const reporte = this.plantilla.reportes[i];
                    const propVisibleState = PlantillaHelper.buscarValorMultiple(reporte.propiedades, PlantillaHelper.REP_VISIBLE_STATE);
                    if (!propVisibleState
                        || !this.pedido
                        || !this.pedido.estadoExpediente
                        || (propVisibleState && propVisibleState.find(x => x.valor === this.pedido.estadoExpediente))) {
                        this.reportes.push(reporte);
                    }
                }
            }
        }
    }

    showReport(reporte: ReporteBaseDTO) {
        if (!reporte) {
            return;
        }
        let stringURL = reporte.servidorUrl;
        if (!stringURL) {
            stringURL = this.ls.getItem(LocalConstants.URL_CONF);
        }
        stringURL =
            stringURL +
            '/reporte?nombre=' +
            reporte.llaveTabla +
            '&P_KEY=' +
            this.pedido.llaveTabla +
            '&P_TOKEN=' +
            this.templateService.getTokenConnection(stringURL);

        if (reporte.variables) {
            stringURL = stringURL + '&' + reporte.variables;
        }
        window.open(stringURL, '_blank');
    }

    showMassive() {
        if (this.canMassive) {
            let redirect = 'massive/' + this.plantilla.llaveTabla;
            if (this.plantilla.server) { redirect = redirect + '/' + this.plantilla.server; }
            this._router.navigateByUrl(redirect);
            this.dialogRef.close()
        }
    }


    showTransfer() {
        if (this.canTransfer) {
            this.utilsService.modalTransfer(this.pedido.llaveTabla, this.pedido.estadoExpediente, this.pedido.plantilla, this.plantilla.server)
                .subscribe((res) => {
                    if (res && this.dialogRef) {
                        this.dialogRef.close();
                    }
                });
        }
    }

    showTrace() {
        this.utilsService.modalTrace(this.pedido.llaveTabla, this.pedido.plantilla, this.plantilla.server, this.pedido.nombre, this.pedido.estadoNombre, this.pedido.estado);
    }

    showChangeState() {
        if (this.canChangeState) {
            if (this.isChangeState) {
                this.isChangeState = false;
            } else {
                if (!this.changeStateForm) {
                    this.changeStateForm = new FormGroup({
                        estadoFinal: new FormControl('', Validators.required),
                        motivo: new FormControl('', Validators.required),
                    });
                }
                this.isChangeState = true;
            }
        }
    }

    autoCompleteDisplayChangeState(item: ProcesoEstadoDTO): string {
        if (!item) {
            return;
        }
        return item.nombre;
    }

    changeState() {
        if (this.canChangeState) {
            const formData = this.changeStateForm.value;
            if (!formData.estadoFinal || !formData.estadoFinal.llaveTabla) {
                Swal.fire('Nuevo estado', 'Selecciona el nuevo responsable', 'info');
            } else {
                const ajuste: PedidoVentaAjusteDTO = new PedidoVentaAjusteDTO();
                ajuste.documento = this.pedido.llaveTabla;
                ajuste.estadoFinal = formData.estadoFinal.llaveTabla;
                ajuste.motivo = formData.motivo;
                this.changeStateIsLoading = true;
                this.api.ajustarEstado(ajuste, this.plantilla.server).subscribe({
                    next: () => {
                        this.dialogRef.close(this.pedido);
                        this.changeStateIsLoading = false;
                    },
                    error: () => { this.changeStateIsLoading = false; }
                });
            }
        }
    }


    getURLDocument(): string {
        return window.location.origin + '/main/' + this.plantilla.llaveTabla + '/' + this.pedidoBase.llaveTabla;
    }


    sendWhatsApp() {
        const url = 'whatsapp://send?text=' + this.getURLDocument();
        window.open(url, "_blank");
    }

    copyUrl() {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = this.getURLDocument();
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        Swal.fire({
            position: 'top-end',
            icon: 'info',
            title: 'Ya puedes pegar tu link al correo o compartirlo en tus redes sociales',
            showConfirmButton: false,
            timer: 1000,
            backdrop: false
        });
    }

    copyName() {
        if (this.pedido) {
            const selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = this.pedido.nombre;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: this.pedido.nombre + ' Copiado al portapeles',
                showConfirmButton: false,
                timer: 1000,
                backdrop: false
            })
        }
    }

    toogleScreen() {
        this.fullScreen = !this.fullScreen;
        this.getSizePop();
    }

    reloadScreen(pTemplate: string) {
        this.dialogRef.close();
        this.utilsService.modalWithParams(this.pedido, false, null, false, pTemplate).subscribe();
    }


    getSizePop() {
        if (this.fullScreen) {
            this.styleSizePop = 'width: 98vw;';
        } else {
            this.styleSizePop = '';
        }
        //if(this.drawerOpened) {this.styleSizePop = this.styleSizePop + 'height:90vh;';}
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.dialogRef.close(false);
        } else if (event.key === 'F9') {
            this.submit();
        }
    }

    abrirUsuario(pUsuario: string) {
        this.api.searchUserByRol(pUsuario).subscribe((contact: UsuarioDTO) => {
            this.utilsService.modalUser(contact.llaveTabla).subscribe();
        });
    }

    flex() {
        this.utilsService.modalFlex(this.plantilla.llaveTabla);
    }

    duplicate() {

        const _doc: PedidoVentaDTO = new PedidoVentaDTO();
        _doc.plantilla = this.plantilla.llaveTabla;
        _doc.caracteristicas = [];

        for (let k = 0; k < this.pedido.caracteristicas.length; k++) {
            const campoDocumento = this.pedido.caracteristicas[k];
            const block = !PlantillaHelper.isEmpty(
                campoDocumento.campoDTO.propiedades,
                PlantillaHelper.PERMISO_CAMPO_BLOQUEAR
            );
            if (campoDocumento.campoDTO
                && !block
                && (campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.FECHA
                    || campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.NUMERO
                    || campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO
                    || campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.TEXTO
                    || campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PRODUCTO
                    || campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.CONFIGURACION
                )
            ) {
                const campoBase: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                campoBase.campo = campoDocumento.campo;
                if (!campoDocumento.dependientes && !(campoDocumento.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO && !campoDocumento.valorOpcion)) {
                    campoBase.valorText = campoDocumento.valorText;
                    campoBase.valorNumero = campoDocumento.valorNumero;
                    campoBase.valorFecha = campoDocumento.valorFecha;
                    campoBase.valorOpcion = campoDocumento.valorOpcion;
                }
                _doc.caracteristicas.push(campoBase);
            }
        }
        _doc.server = this.plantilla.server;
        this.utilsService.modalWithParams(_doc, false).subscribe();
    }

    public reviewFieldsVisibility() {
        let sectionIsInvisible = false;
        for (let i = 0; i < this.dynamicControls.length; i++) {
            const element = this.dynamicControls[i];
            if (element.structure.formato === DocumentoPlantillaCaracteristicaEnum.SECCION) { //verifica que sea seccion   
                if (element.isInvisible) {
                    sectionIsInvisible = element.isInvisible;  //si la seccion es inivisible invisibiliza toda la seccion
                } else {
                    sectionIsInvisible = element.isSectionInvisible; //si la seccion no es inivisible invisibiliza toda la seccion solo al colapsar
                }
            } else {
                element.isSectionInvisible = sectionIsInvisible; //solo si no es seccion se invisibiliza 
            }

        }
    }

}
