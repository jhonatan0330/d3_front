import {
  Component,
  OnInit,
  Inject,
  ComponentFactoryResolver,
  ViewContainerRef,
  ViewChild,
  Type,
  AfterViewInit,
  HostListener,
} from '@angular/core';
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getComponent } from 'app/modules/full/neuron/form-helper';
import Swal from 'sweetalert2';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit, AfterViewInit {
  // Variables para el control de los campos
  @ViewChild('dynamycFormElement', { read: ViewContainerRef })
  myForm: ViewContainerRef;
  formIsModified = false;
  dynamicControls: IDynamicControl[] = [];

  // flags
  submitted = false;
  modificable = false;
  instruccionCrear: string;
  fullScreen = false;

  pedidoBase: PedidoVentaDTO; // Lo uso para guardar lo que recibi para crear el formulario
  plantilla: DocumentoPlantillaDTO; // Contiene la estructura del formulario
  pedido: PedidoVentaDTO; // Contiene la data del formulario

  // Variables de comportamiento
  identificadorInicial: string; // La use para llenar el campo inicial
  close2Save = false;


  // ACTIONS

  auxPlantillaProxima: string; // LAs transiciones aveces no tienen cargados los campos y se encesitan
  transiciones: ProcesoTransicionDTO[] = []; // Lista de botones
  uidOpenToNotDuplicate: string;

  // REPORTS
  reportes: ReporteBaseDTO[] = [];


  canMassive = false;
  canTariff = false;
  canTransfer = false;


  // Cambiar estado
  canChangeState = false;
  isChangeState = false;
  changeStateIsLoading = false;
  changeStateForm: FormGroup;
  isLoading = false;

  private CAMPO_POSIBLE_MENOR_PRIORIDAD = '__*__';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormComponent>,
    private templateService: TemplateService,
    private api: ApiService,
    private ls: LocalStoreService,
    private compiler: ComponentFactoryResolver,
    private utilsService: UtilsService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    // Validaciones para evitar null
    if (this.pedidoBase && this.pedidoBase === this.data.data) {
      return;
    }
    this.pedidoBase = this.data.data;
    this.identificadorInicial = this.data.identificador;
    if (this.data.close2Save) {
      this.close2Save = this.data.close2Save;
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
      // Camino New
      this.pedido = this.copiarPedidoBase(this.pedidoBase, false);
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
    this.pedidoBase.messages = null;
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

  openManager(value: PedidoVentaDTO) {
    const openNewFormCopyData: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(this.plantilla.propiedades, PlantillaHelper.PERMISO_PLANTILLA_INICIO_RAPIDO);
    if ((!this.identificadorInicial && !this.close2Save) || openNewFormCopyData) {
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
      })
      this.pedido.llaveTabla = value.llaveTabla;
      for (let r = 0; r < this.reportes.length; r++) {
        const _report = this.reportes[r];
        if (PlantillaHelper.buscarValor(_report.propiedades, PlantillaHelper.REP_AUTOPRINT)) {
          this.showReport(_report);
        }
      }
    }
    this.submitted = false;
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
          this.crearPlantilla(this.auxPlantillaProxima);
          this.auxPlantillaProxima = null;
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

                  newDetalle.caracteristicas = [];
                  for (let n = 0; n < dpv.caracteristicas.length; n++) {
                    const campoInterno = dpv.caracteristicas[n];
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
                    newDetalle.caracteristicas.push(cpInterno);
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
    if (this.instruccionCrear) { this.fullScreen = true; }
    this.showFields();
    this.resolvePropiertiesForm();
    this.getReports();
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
            break;
          }
        }
      }
    }

    this.plantilla.caracteristicas.forEach((_campo) => {
      const componentDynamic: Type<any> = getComponent(_campo);
      const _componentFactory = this.compiler.resolveComponentFactory(
        componentDynamic
      );
      const componentRef = this.myForm.createComponent<IDynamicControl>(
        _componentFactory
      );
      componentRef.instance.structure = _campo;
      componentRef.instance.parent = this.pedido;
      componentRef.instance.urlServer = this.plantilla.server;
      componentRef.instance.form = this;
      for (let index = 0; index < this.pedido.caracteristicas.length; index++) {
        const element = this.pedido.caracteristicas[index];
        if (element.campo === _campo.llaveTabla) {
          componentRef.instance.data = element;
          componentRef.instance.formIsEnabled = this.modificable;
          componentRef.instance.formIsModified.subscribe((x: boolean) => {
            if (x) { this.formIsModified = true; }
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
    this.canMassive = !PlantillaHelper.isEmpty(this.plantilla.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CARGA_MASIVA);
    this.canTariff = PlantillaHelper.buscarValor(this.plantilla.propiedades, PlantillaHelper.PLANTILLA_TIPO_CONFIGURATION) === "TARIFARIO";
    if (this.pedido.llaveTabla) {
      if (!this.pedido.estadoExpediente) {
        // Solo se pueden anular los que estan en estado activo y que no son de un proceso
        if (this.pedido.estado === StatesEnum.ACTIVE) {
          if (
            !PlantillaHelper.isEmpty(
              this.plantilla.propiedades,
              PlantillaHelper.PERMISO_PLANTILLA_ELIMINAR
            )
          ) {
            const plantillaEliminar = PlantillaHelper.buscarValor(
              this.plantilla.propiedades,
              PlantillaHelper.FORM_ANULAR
            );
            if (plantillaEliminar) {
              const tEliminar: DocumentoPlantillaDTO = this.templateService.getTemplate(
                plantillaEliminar, this.plantilla.server
              );
              if (
                tEliminar &&
                !PlantillaHelper.isEmpty(
                  tEliminar.propiedades,
                  PlantillaHelper.PERMISO_PLANTILLA_CREAR
                )
              ) {
                const _newtransicion: ProcesoTransicionDTO = new ProcesoTransicionDTO();
                _newtransicion.imagen = tEliminar.imagen;
                _newtransicion.plantilla = tEliminar.llaveTabla;
                _newtransicion.nombre = tEliminar.nombre;
                this.transiciones.push(_newtransicion);
              }
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
    // Botones de estados
    if (this.plantilla.estados && this.plantilla.estados.length !== 0) {
      let estadollave = this.pedido.estadoExpediente;
      if (!estadollave) {
        estadollave = this.pedido.estado;
      }

      for (let i = 0; i < this.plantilla.estados.length; i++) {
        const estadoIterador = this.plantilla.estados[i];
        if (!this.pedido.llaveTabla && !estadollave) {
          estadollave = estadoIterador.llaveTabla;
        }
        if (estadoIterador.llaveTabla === estadollave) {
          const estado = estadoIterador;
          if (estado.transiciones && estado.transiciones.length !== 0) {
            for (let j = 0; j < estado.transiciones.length; j++) {
              const transicion = estado.transiciones[j];
              if (transicion.plantilla) {
                const _t: DocumentoPlantillaDTO = this.templateService.getTemplate(
                  transicion.plantilla, this.plantilla.server
                );
                if (
                  _t &&
                  !PlantillaHelper.isEmpty(
                    _t.propiedades,
                    PlantillaHelper.PERMISO_PLANTILLA_CREAR
                  )
                ) {
                  this.transiciones.push(transicion);
                }
              }
            }
          }
          break;
        }
      }
    }

    if (this.pedido.llaveTabla) {
      /* if (this.modificable) {
          this.acciones.push({
            nombre: 'MODIFICAR ' + this.plantilla.nombre,
            plantilla: null,
            icon: 'edit',
          });
          // btnProductos.visible = btnProductos.includeInLayout =
          // !PlantillaHelper.isEmpty(manager.plantilla, PlantillaHelper.PLANTILLA_TIPO_PRODUCTO);
        }*/
    }
  }

  // Se encarga de abrir el formulario de la transicion
  crearPlantilla(plantillaProxima: string) {
    if (!plantillaProxima) {
      return;
    }
    if (this.formIsModified) {
      Swal.fire('Guarda documento', 'Por favor guarda los cambios del documento antes de crear una nueva accion', 'info');
      return;
    }
    this.auxPlantillaProxima = plantillaProxima;
    const _transition: DocumentoPlantillaDTO = this.cargarPlantilla(
      plantillaProxima, this.plantilla.server
    );
    if (!_transition) {
      return;
    } // Se supone que la carga asincrona
    const _doc: PedidoVentaDTO = new PedidoVentaDTO();
    _doc.plantilla = plantillaProxima;
    const camposPosibles: DocumentoPlantillaCaracteristicaDTO[] = [];
    let textoCampoPosible: string;
    // Valido que existan caracteristicas con el mismo codigo y lo modifico
    for (let i = 0; i < _transition.caracteristicas.length; i++) {
      const campo = _transition.caracteristicas[i];
      // Itero por los campos del pedido para ver que tengan el mismo codigo
      for (let j = 0; j < this.pedido.caracteristicas.length; j++) {
        const campoDoc = this.pedido.caracteristicas[j];
        if (campo.codigo === campoDoc.campoDTO.codigo) {
          if (!_doc.caracteristicas) {
            _doc.caracteristicas = [];
          }
          campoDoc.principal = null;
          _doc.caracteristicas.push(campoDoc);
          break;
        }
      }

      textoCampoPosible = this.validateIsPossibleField(
        campo,
        this.pedido.plantilla
      );
      if (textoCampoPosible) {
        if (textoCampoPosible === this.CAMPO_POSIBLE_MENOR_PRIORIDAD) {
          camposPosibles.push(campo);
        } else {
          camposPosibles.unshift(campo);
        }
      }
    }

    if (camposPosibles.length !== 0) {
      const campoTransicion: DocumentoPlantillaCaracteristicaDTO =
        camposPosibles[0];
      if (!_doc.caracteristicas) {
        _doc.caracteristicas = [];
      }

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
      campoBase.valorText = this.pedido.nombre;
      if (this.pedido.dinero) {
        campoBase.valorNumero = this.pedido.dinero.saldo;
      }
      campoBase.valorOpcion = this.pedido.llaveTabla; // Coloco el valor opcion para que el tipo proceso identifique la opcion
      _doc.caracteristicas.push(campoBase);
    }
    _doc.server = this.plantilla.server;
    this.utilsService.modalWithParams(_doc, true).subscribe((res) => {
      if (res && this.dialogRef) {
        this.dialogRef.close();
        if (!this.close2Save) {
          if (res && res.data && res.data.messages) { this.pedido.messages = res.data.messages; }
          else{ this.pedido.messages = null;}
          this.utilsService.modalWithParams(this.pedido);
        }
      }
    });
  }

  // Solo lo uso en crear plantilla siguiente asi que puedo ver como optimizar despues
  validateIsPossibleField(
    campo: DocumentoPlantillaCaracteristicaDTO,
    plantilla: string
  ): string {
    if (
      !campo ||
      campo.formato !== DocumentoPlantillaCaracteristicaEnum.PROCESO
    ) {
      return null;
    }
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

  goToHelp() {
    if (this.plantilla) {
      window.open('help/l/' + this.plantilla.llaveTabla, '_blank');
      //this.dialogRef.close()
    }
  }

  showTariff() {
    if (this.canTariff) {
      const redirect = 'tariff/' + this.plantilla.llaveTabla + '/' + this.pedido.llaveTabla;
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
    this.utilsService.modalTrace(this.pedido.llaveTabla, this.pedido.plantilla, this.plantilla.server, this.pedido.nombre, this.pedido.estadoNombre);
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
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.dialogRef.close(false);
    }
  }
}
