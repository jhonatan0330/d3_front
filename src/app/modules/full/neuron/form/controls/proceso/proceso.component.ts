import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormControl, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
  PedidoVentaFilterDTO,
  RelacionInternaDTO,
  RelacionInternaFilterDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import {
  DocumentoPlantillaCaracteristicaEnum,
  StatesEnum,
} from 'app/modules/full/neuron/model/sw42.enum';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import Swal from 'sweetalert2';
import { BarcodeFormat } from '@zxing/library';
import { PropiedadDTO } from 'app/shared/shared.domain';

@Component({
  selector: 'app-proceso',
  templateUrl: './proceso.component.html',
  styleUrls: ['./proceso.component.scss'],
})
export class ProcesoComponent extends BaseComponent implements OnInit {
  @ViewChild('clickHoverMenuTrigger') trigger: MatMenuTrigger;
  fControl = new UntypedFormControl();
  filteredDocuments: PedidoVentaDTO[];

  plantilla: DocumentoPlantillaDTO; // Contiene el id de la fuente de datos de este proceso
  autoload = false; // Indica que la fuente de datos se va a cargar en memoria
  herencia: PropiedadDTO; // Propiedad que indica que se tiene herencia
  relacionesHerencia: RelacionInternaDTO[]; // Contiene las relaciones de herrencia para crea el nuevo form
  alertar: PropiedadDTO; // Propiedad que indica que se tiene alertas al seleccionar
  relacionesAlerta: RelacionInternaDTO[]; // Contiene las relaciones de alertas que se van a mostrar al usuario
  multiple = false; // Indica que este componete va a manejar varios documentos
  mostrarPop = false; // En algunos casos es necesario que las opciones se muestren grandes (compu touch)
  readQR = false; // Muestra el boton de leer codigo de barras
  saveToSelect = false; //Cuando se selecciona el valor se guarda el formulario
  procesoValor: string; // Define si se va a tener en cuenta el valor del documento
  acciones: PropiedadDTO[]; // Contiene propiedades que indican que documentos se pueden crear a partir de el
  linkExternal: PropiedadDTO; // Permite abrir en otra venta paginas relacionadas

  tipoCombo = false; // TEMPORAL me ayuda a saber si cargo el componente como un combo de seleccion
  tipoTexto = false; // TEMPORAL me ayuda a saber si es un input
  tipoMultiple = false; // TEMPORAL me ayuda a saber si es un listado y si mostrar las listas
  proceso: PedidoVentaDTO; // Contiene el documento seleccionado
  disponibles: PedidoVentaDTO[]; // Contiene los documetnos que resultaron de consultar el servidor
  // debe ser undifened para saber cuando consulte
  keyInicial: string; // Lo uso solamente para que cuando cargue coja este valor debido a que normalmente se borra (dependiente)
  acabadoCrear = false;
  filtroBusqueda: string; // Sucede que cuando envio a buscar necesito que se guarde el id para que se llene en el formulario de crear
  titulo = ''; // lo uso para los campos multiples el titulo
  labelSearch = ''; // lo uso para los campos multiples resumen de busqueda

  // Copiadas de cruds
  fControlSearch: FormControl; // Texto que digita el usuario para filtrar
  fControlDateStart: FormControl = new FormControl();
  fControlDateEnd: FormControl = new FormControl();
  fControlCheck: FormControl; // Check que indica si se debe realizar una busqueda por codigo exacto
  pagina = 1; // Indica que pagina estamos buscando
  cantidadPagina = 30; // Indica cuantos registros estamos buscando por pagina
  isLoadingList = false;
  isEndList = true;
  dataProvider: PedidoVentaDTO[]; // Conjunto de documentos a visualizar

  showFilterState = false;
  fCheckActivo: FormControl; // Check que indica si se filtra por los activos
  fCheckInactivo: FormControl; // Check que indica si se debe filtrar por los inactivos
  fCheckFinalizado: FormControl; // Check que indica si se debe filtrar por los finalizados

  // textoInicial: string; // Usado para colocar el texto incial de los fomrularios nuevos, ejemplo un cliente buscado no encontrado

  solicitarFechas = false;

  qrResultString: string;
  scannerEnabled = false;
  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX];

  inputModeText = 'text';

  constructor(
    private templateService: TemplateService,
    private api: ApiService,
    private utilsService: UtilsService
  ) {
    super();
  }

  autoCompleteDisplay(item: PedidoVentaDTO): string {
    if (!item) {
      return;
    }
    if (item.descripcion) {
      return item.descripcion;
    } else {
      return item.nombre;
    }
  }

  ngOnInit() {
    super.ngOnInit();
    // Reuno las variables necesarias para el componente
    this.plantilla = this.templateService.getTemplate(
      this.obtenerValor(PlantillaHelper.PLANTILLA_AUXILIAR), this.urlServer
    );
    this.herencia = this.obtenerPropiedad(PlantillaHelper.CAMPO_HEREDADO);
    this.alertar = this.obtenerPropiedad(PlantillaHelper.ALERTAR_CAMPO_PROCESO);
    this.multiple = !this.isEmpty(this.obtenerValor(PlantillaHelper.MULTIPLE));
    this.autoload = !this.isEmpty(this.obtenerValor(PlantillaHelper.AUTOLOAD));
    this.readQR = !this.isEmpty(this.obtenerValor(PlantillaHelper.READ_QR));
    this.linkExternal = this.obtenerPropiedad(PlantillaHelper.LINK_EXTERNO);
    this.saveToSelect = !this.isEmpty(this.obtenerValor(PlantillaHelper.SAVE_TO_SELECT));
    this.mostrarPop = !this.isEmpty(this.obtenerValor(PlantillaHelper.PROCESO_POP));
    this.procesoValor = this.obtenerValor(PlantillaHelper.PROCESO_VALOR);
    this.acciones = this.obtenerValorMultiple(PlantillaHelper.PROCESO_ACCIONES);
    if (!this.form) { // Esto es para los filtros
      this.autoload = false;
      this.acciones = null;
    }
    this.tipoCombo = !this.multiple && this.autoload;
    this.tipoTexto = !this.multiple && !this.autoload;
    //Lo pase al iniciar
    // No me aparecian unos valores y entonces evito consultar combo
    /*if (this.tipoCombo && !this.isEnabled && (this.relatedFields && this.relatedFields.length === 0)) {
      // Coloco cuando es nuevo y dependientes para que ejecute al funcion
      //// && (this.relatedFields && this.relatedFields.length !== 0) Cargue de BBX que llama la funcion
      this.tipoCombo = false;
      this.tipoTexto = true;
    }*/
    if (this.plantilla) {
      this.solicitarFechas = !PlantillaHelper.isEmpty(
        this.templateService.getTemplate(this.plantilla.llaveTabla, this.urlServer).propiedades,
        PlantillaHelper.FORM_SOLICITAR_FECHAS
      );
    }
    // Configuro que sea requerido
    // Posiblemetne esto lo pase al base
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    // Cuando cargo el combo se me pierde el valor opcion en la actualización de documents
    if (this.data && this.data.valorOpcion) {
      this.proceso = this.data.principal;
    }
    // Al momento de cambiar actualizo el proceso y actualizo todo lo necesario
    this.fControl.valueChanges.subscribe((value) => {
      // this.data.valorOpcion = value.llaveTabla;
      // Algunas ocaciones recibo string aqui valido que se coloque un objeto como proceso
      if (value) {
        if (value.llaveTabla) {
          this.proceso = value;
          this.filteredDocuments = null;
          this.showAlertSelectedProcess();
        } else {
          this.proceso = null;
          let filterValue: string = value.toLowerCase();
          if (filterValue === '*') { filterValue = ''; }
          if (filterValue.endsWith(' ')) { filterValue = filterValue.substring(0, filterValue.length - 1); }
          filterValue = filterValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (this.disponibles) {
            this.filteredDocuments = this.disponibles.filter(
              (doc) => {
                if (doc.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(filterValue) !== -1) return true;
                if (doc.descripcion && doc.descripcion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(filterValue) !== -1) return true;
                if (doc.caracteristicas) {
                  for (let filterItemField = 0; filterItemField < doc.caracteristicas.length; filterItemField++) {
                    const element = doc.caracteristicas[filterItemField];
                    if (element.valorText != null && element.valorText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(filterValue) !== -1) return true;
                  }
                }
                return false;
              }
            );
          }
          if (!value) {
            return this.disponibles.slice();
          }
        }
      } else {
        this.proceso = null;
        if (this.fControl.touched) { this.filteredDocuments = this.disponibles; }
      }
      this.actualizar();
    });
    this.iniciar();
  }

  filterDisponiblesWithFields(item: PedidoVentaDTO) {

  }

  showAlertSelectedProcess() {
    if (!this.alertar || !this.proceso || !this.proceso.caracteristicas || this.proceso.caracteristicas.length === 0) return;
    if (this.isLoadingList) return;
    if (!this.relacionesAlerta) {
      const rel: RelacionInternaDTO[] = this.templateService.getPropertyRelation(this.alertar.llaveTabla);
      if (rel && rel.length !== 0) {
        this.relacionesAlerta = rel;
        this.showAlertSelectedProcess();
      } else {
        this.isLoadingList = true;
        const filtro: RelacionInternaFilterDTO = new RelacionInternaFilterDTO();
        filtro.estado = StatesEnum.ACTIVE;
        filtro.propiedad = this.alertar.llaveTabla;
        this.api.relacionesPropiedad(filtro, this.urlServer).subscribe({
          next: (value: RelacionInternaDTO[]) => {
            if (!value || value.length === 0) {
              Swal.fire(this.structure.nombre, 'La propiedad ALERTAR no tiene relaciones para determinar que alertar', 'error');
            } else {
              this.relacionesAlerta = value;
              this.templateService.addRelations(this.relacionesAlerta)
              this.isLoadingList = false;
              this.showAlertSelectedProcess();
            }
          },
          error: () => {
            this.isLoadingList = false;
          },
        });
      }
      return;
    }
    for (let index = 0; index < this.relacionesAlerta.length; index++) {
      const element = this.relacionesAlerta[index];
      for (let j = 0; j < this.proceso.caracteristicas.length; j++) {
        const campo = this.proceso.caracteristicas[j];
        if (campo.campoDTO && campo.campoDTO.llaveTabla === element.campo) {
          Swal.fire(this.structure.nombre, campo.valorText, 'info');
          break;
        }
      }
    }
  }

  openDialog(p: PedidoVentaDTO) {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = p.plantilla;
    pedidoVenta.llaveTabla = p.llaveTabla;
    pedidoVenta.server = this.urlServer;
    this.utilsService.modalWithParams(pedidoVenta, false).subscribe((res) => {
      if (res) {
        if (this.tipoMultiple) {
          this.procesarCampo(this.transformPVCtoFilter(this.data));
        } // Por si se modifica un valor que se calcule
      }
    });
  }

  iniciar() {
    if (this.tipoCombo) {
      if (!this.isEnabled && this.autoload && this.disponibles) {
        if (!this.data.principal && this.disponibles.length === 1) {
          this.data.principal = this.disponibles[0];
        }
        this.tipoCombo = false;
        this.tipoTexto = true;
        this.iniciarTexto();
      } else {
        this.iniciarCombo();
      }
    } else {
      if (this.tipoTexto) {
        this.iniciarTexto();
      } else {
        if (this.data.documento == null && !this.isEnabled) {
        } else {
          this.incluirOpcion();
        }
      }
    }
  }

  iniciarCombo() {
    if (this.autoload) {
      this.disponibles = this.structure.documentos; // Aqui s eme perdian los dipsonibles
      if (!this.disponibles || this.data.dependientes) {
        // valorOpcionAutoloadAyuda = tipo.campo.valorOpcion;
        const filtro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
        filtro.campo = this.structure.llaveTabla;
        if (this.obtenerValorMultiple(PlantillaHelper.BODEGA_FIJA) != null) {
          this.procesarCampo(filtro);
          return;
        }
        if (!this.relatedFields) {
          this.procesarCampo(filtro);
          return;
        } else {
          if (this.isEnabled || (!this.isEnabled && !this.data.principal)) {
            if (
              !this.data.dependientes ||
              this.data.dependientes.length !== this.relatedFields.length
            ) {
              return;
            }
            for (let i = 0; i < this.relatedFields.length; i++) {
              if (
                !this.data.dependientes[i].valorOpcion &&
                this.data.dependientes[i].campoDTO.formato ===
                DocumentoPlantillaCaracteristicaEnum.PROCESO
              ) {
                return;
              }
            }
            if (this.data.principal) {
              this.fControl.setValue(this.data.principal); // Esto es para que se vea el proceso cuando es relacionado y combo
            } else {
              this.keyInicial = this.data.valorOpcion;
              this.procesarCampo(filtro);
            }
            return;
          } else {
            if (this.data.principal) {
              // txtProceso.dataProvider = new ArrayCollection();
              this.proceso = this.data.principal;
              // txtProceso.dataProvider.addItem(proceso);
            }
          }
        }
      }
    }
    // En caso de traer un dato
    if (this.data.principal) {
      if (this.autoload) {
        // Si no tenemos opciones lo agregamos al listado, esto aplica para los vencidos o no autoload
        this.proceso = this.encontrarProcesoBase(
          this.data.principal.llaveTabla
        );
        if (this.proceso == null) {
          if (this.disponibles == null) {
            this.disponibles = [];
          }
          this.proceso = this.data.principal;
          this.disponibles.push(this.proceso);
          this.actualizarDataProvider(this.disponibles);
        } else {
          this.fControl.setValue(this.proceso);
        }
      }
      this.actualizar();
      // Solo en caso de los dependientes para modificar se consultan las opciones al abrir
      if (this.data.llaveTabla && this.isEnabled) {
        if (this.relatedFields && this.relatedFields[0].valor !== 'USR') {
          this.procesarCampo(this.transformPVCtoFilter(this.data));
        }
      }
    } else {
      // Si no trae opcion
      if (this.data.valorOpcion) {
        if (this.autoload) {
          // Pero cuando es autoload y venia de otro tiene que buscar en los autoload
          this.proceso = this.encontrarProcesoBase(this.data.valorOpcion);
          this.fControl.setValue(this.proceso);
        } else {
          // Algunas opciones no se cargan si no viene el principal??
          this.procesarCampo(this.transformPVCtoFilter(this.data));
        }
      } else {
        this.loadEmptyFieldStartCombo();
      }
    }
  }

  private loadEmptyFieldStartCombo() {
    const valorDefecto: string = this.obtenerValor(PlantillaHelper.DEFAULT);
    if (!this.isEmpty(valorDefecto)) {
      if (this.disponibles) {
        for (let index = 0; index < this.disponibles.length; index++) {
          const opcion = this.disponibles[index];
          if (opcion.nombre === valorDefecto) {
            this.fControl.setValue(opcion);
            break;
          }
        }
      }
    }
    if (this.required) {
      if (this.disponibles && this.disponibles.length === 1) {
        // Si es obligatorio, seelcciona el primero y unico
        this.fControl.setValue(this.disponibles[0]);
      }
    }
  }

  iniciarTexto() {
    if (!this.data) { return; }
    // En caso de traer un dato
    if (this.data.principal) {
      const documentos: PedidoVentaDTO[] = [];
      documentos.push(this.data.principal);
      this.actualizarDataProvider(documentos);
      this.fControl.setValue(documentos[0]);
      // Solo en caso de los dependientes para modificar se consultan las opciones al abrir
      if (this.data.llaveTabla && this.isEnabled && this.relatedFields) {
        this.acabadoCrear = true;
        this.procesarCampo(this.transformPVCtoFilter(this.data));
      }
    } else {
      // Si no trae opcion
      if (this.data.valorOpcion) {
        // Algunas opciones no se cargan si no viene el principal
        this.acabadoCrear = true;
        // Como restringui el no consultar unos que ya existian enconces le coloco valor, aunqeu creo que esta mal al otro lado
        const filter = this.transformPVCtoFilter(this.data);
        filter.filtroParametro = this.data.valorText;
        this.procesarCampo(filter);
      } else {
        if (this.required) {
          if (this.disponibles != null && this.disponibles.length === 1) {
            // Si es obligatorio, seelcciona el primero y unico
            this.proceso = this.disponibles[0];
            this.actualizar();
          }
        }
      }
    }
  }

  actualizar() {
    if (this.tipoCombo) {
      this.actualizarCombo(true);
    } else {
      if (this.tipoTexto) {
        this.actualizarTexto();
      } else {
        let valorNumero = 0;
        if (this.data.expedientes) {
          this.data.expedientes.forEach((detalle) => {
            if (detalle.dinero) {
              if (!detalle.dinero.valorCampo || detalle.dinero.valorCampo === 0) {
                if (this.procesoValor === '2') {
                  detalle.dinero.valorCampo = detalle.dinero.saldo;
                } else {
                  detalle.dinero.valorCampo = detalle.dinero.valorTotal;
                }
              }
              valorNumero = valorNumero + detalle.dinero.valorCampo;
            }
          });
        }
        this.data.valorNumero = valorNumero;
        this.colocarTituloDisponibles();

        if (!this.isEnabled) {
          this.avisarModificacion(false, true);
          this.data.modificado = false; // Cuando son solo listas de mostrar se activan la modificaicon y va y guarda doble
        } else {
          // Sucede que las listas hacian que el formulario se colcoara en estado modificado pero no era cierto y me dio como algo de quitar las notificaciones a otros campos, especialmente los de numeros
          this.avisarModificacion();
        }
      }
    }
  }

  notificarModificacion(campoFiltro: PedidoVentaCaracteristicaDTO) {
    if (this.tipoTexto && this.relatedFields) {
      if (!campoFiltro.valorOpcion) {
        if (!this.autoload) {
          this.disponibles = [];
          this.filteredDocuments = [];
        }
        this.fControl.setValue(null);
        return;
      }
    }
    if (
      this.obtenerPropiedad(PlantillaHelper.BODEGA_FIJA) ||
      this.obtenerPropiedad(PlantillaHelper.BODEGA_MOVIMIENTO)
    ) {
      return;
    }
    //if (this.isVisible) {
    this.procesarCampo(this.transformPVCtoFilter(campoFiltro));
    //}
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    if (this.isLoading) {
      return;
    }
    // Nunca deberia ser nulo
    if (!campoFiltro) {
      alert('No deberia ser null la respuesta del servidor');
      return;
    }
    if (this.herencia) {
      this.listar(this.pagina);
      return;
    }
    const filtro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
    filtro.campoDTO = this.structure;
    filtro.campo = this.structure.llaveTabla;
    filtro.documento = campoFiltro.documento;
    filtro.filtroParametro = campoFiltro.filtroParametro;

    if (this.relatedFields) {
      if (this.multiple && !this.data.documento) {
        this.data.expedientes = [];
        return; // Sucede que en un campo multiple nuevo no hay necesidad de ir a buscar
      }
      if (this.tipoTexto && !campoFiltro.filtroParametro) {
        return;
      }
      if (
        !this.data.dependientes ||
        this.data.dependientes.length !== this.relatedFields.length
      ) {
        if (campoFiltro.filtroParametro != null) {
          alert('Revisa los dependientes del campo ' + this.structure.nombre);
          return;
        }
      }
      for (let i = 0; i < this.relatedFields.length; i++) {
        if (!this.data.dependientes[i].valorOpcion && (!this.data.dependientes[i].campoDTO || this.data.dependientes[i].campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO)) {
          /*alert(
            'Seleccione el campo ' + this.data.dependientes[i].campoDTO.nombre
          );*/
          this.actualizarDataProvider(null);
          this.fControl.setValue(null);
          return;
        }
      }
      filtro.dependientes = this.data.dependientes;
    }

    // Hay tres escenarios que uso para consultar datos de un campo

    if (campoFiltro.campo !== this.structure.llaveTabla) {
      // 1 NOtificacion de un listener
      filtro.detalles = this.data.detalles;
      filtro.expedientes = this.data.expedientes;
      filtro.llaveTabla = this.data.llaveTabla;
      filtro.valorAuxiliar = this.data.valorAuxiliar;
    } else {
      // 2 Consultar las opciones esto se maneja con el valor opcion
      filtro.detalles = campoFiltro.detalles;
      filtro.expedientes = campoFiltro.expedientes;
      filtro.llaveTabla = campoFiltro.llaveTabla;
      filtro.valorOpcion = campoFiltro.valorOpcion; // 3 Consultar un dato seleccionado
      filtro.valorAuxiliar = campoFiltro.valorAuxiliar;
    }
    this.isLoading = true;
    this.api.consultarDatosBase(filtro, this.urlServer).subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading = false;
        this.consultaExitosaDatosBase(_value);
      },
      error: () => {
        this.isLoading = false;
        if (this.readQR) {
          this.fControl.setValue(null);
        }
      },
    });
  }

  consultaExitosaDatosBase(pCampo: PedidoVentaCaracteristicaFilterDTO) {
    if (this.tipoCombo) {
      this.recibirDocumentosCombo(pCampo);
    } else {
      if (this.tipoTexto) {
        this.recibirDocumentosTexto(pCampo);
      } else {
        this.data.expedientes = pCampo.expedientes;
        this.data.valorNumero = pCampo.valorNumeroMax;
        this.data.valorText = pCampo.valorText;
        this.limpiarRepetidos();
        this.actualizar();
      }
    }
  }

  incluirOpcion() {
    this.fControlSearch = new FormControl();
    this.fControlDateStart = new FormControl();
    this.fControlDateEnd = new FormControl();
    this.fControlCheck = new FormControl();
    this.fCheckActivo = new FormControl(true);
    this.fCheckInactivo = new FormControl();
    this.fCheckFinalizado = new FormControl(true);
    if (this.isEnabled) {
      if (this.solicitarFechas) {
        this.fControlDateStart.setValue(new Date());
        this.fControlDateEnd.setValue(new Date());
      }
    }
    this.colocarTituloDisponibles();
    if (this.herencia) {
      if (this.data.documento) {
        this.tipoMultiple = true;
        // render.addEventListener(MouseEvent.CLICK, consultarExpedientesHerencia);
      } else {
        return; // No lo dibujo
      }
    } else {
      if (this.data.documento) {
        this.tipoMultiple = true;
        // render.addEventListener(MouseEvent.CLICK, consultarExpedientesMultiples);
      } else {
        if (this.multiple && this.plantilla) {
          this.tipoMultiple = true;
          // render.addEventListener(MouseEvent.CLICK, consultarExpedientesMultiples);
        } else {
          if (this.relatedFields) {
            this.tipoMultiple = true;
            /*render.addEventListener(MouseEvent.CLICK, function(e:Event):void{
              if(campo.dependientes==null
                || campo.dependientes.length!=1
                || PedidoVentaCaracteristicaVO(campo.dependientes.getItemAt(0)).valorOpcion==null){
                MessageManager.error('Por favor revisa que este seleccionado el campo '
                + PropiedadVO(obtenerValorMultiple(DEPENDE).getItemAt(0)).texto);
                }
                return;
              }else{
                consultarExpedientesMultiples();
              }
            });
          } else {//No lo dibujo
            //render.addEventListener(MouseEvent.CLICK, function(e:Event):void{
              alert('Por favor guarde el documento primero para consultar los ' + base.nombre)
            });*/
          }
        }
      }
    }
  }

  colocarTituloDisponibles() {
    this.titulo = '';
    if (this.herencia) {
      if (this.dataProvider) {
        this.setValorNumero(0);
        for (let i = 0; i < this.dataProvider.length; i++) {
          const iData = this.dataProvider[i];
          // Los inactivos no deben sumar pero si mostrarse
          if (iData.dinero && iData.dinero.valorTotal &&
            (!iData.estado || iData.estado !== StatesEnum.INACTIVE)) {
            this.setValorNumero(this.getValorNumero() + iData.dinero.valorTotal);
          }
        }
        if (this.getValorNumero() !== 0) {
          this.titulo =
            this.titulo +
            'Total (' +
            new Intl.NumberFormat('es-CO').format(this.getValorNumero()) +
            ')';
        }
        this.data.valorText = this.dataProvider.length.toString();
      }
    } else {
      this.titulo = this.generateLabelToList(this.data.expedientes);
    }
  }

  generateLabelToList(documents: PedidoVentaDTO[]): string {
    const camposPersonalizados: PedidoVentaCaracteristicaDTO[] = [];
    let crearCampoTitulo: boolean;
    let result: string = '';

    if (documents && documents.length !== 0) {
      result =
        result + ' (' + documents.length.toString() + ')';
      let valorCampo = 0;
      let valorTotal = 0;

      for (let i = 0; i < documents.length; i++) {
        const expediente = documents[i];
        if (
          expediente.dinero &&
          (!expediente.estado || expediente.estado !== StatesEnum.INACTIVE)
        ) {
          valorCampo = valorCampo + expediente.dinero.valorCampo;
          valorTotal = valorTotal + expediente.dinero.valorTotal;
        }

        if (expediente.caracteristicas) {
          for (let j = 0; j < expediente.caracteristicas.length; j++) {
            const iCampoExpediente = expediente.caracteristicas[j];
            if (!iCampoExpediente.valorFecha) {
              // Se suman valores de fechas
              crearCampoTitulo = true;
              if (camposPersonalizados && camposPersonalizados.length !== 0) {
                for (let k = 0; k < camposPersonalizados.length; k++) {
                  const iCampoTitulo = camposPersonalizados[k];
                  if (iCampoTitulo.campo === iCampoExpediente.campoDTO.nombre) {
                    iCampoTitulo.valorNumero =
                      iCampoTitulo.valorNumero + iCampoExpediente.valorNumero;
                    crearCampoTitulo = false;
                    break;
                  }
                }
              }
              if (crearCampoTitulo) {
                const campoPersonalizadoTitulo: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                campoPersonalizadoTitulo.campo = iCampoExpediente.campoDTO.nombre;
                campoPersonalizadoTitulo.valorNumero =
                  iCampoExpediente.valorNumero;
                if (!campoPersonalizadoTitulo.valorNumero) {
                  campoPersonalizadoTitulo.valorNumero = 0;
                }
                camposPersonalizados.push(campoPersonalizadoTitulo);
              }
            }
          }
        }
      }

      if (valorTotal !== 0) {
        result =
          result +
          ' - Total (' +
          new Intl.NumberFormat('es-CO').format(valorTotal) +
          ')';
      }
      if (valorCampo !== 0 && valorCampo !== valorTotal) {
        result =
          result +
          ' - Valor (' +
          new Intl.NumberFormat('es-CO').format(valorCampo) +
          ')';
      }

      if (camposPersonalizados.length !== 0) {
        for (let index = 0; index < camposPersonalizados.length; index++) {
          const iTituloEnd = camposPersonalizados[index];
          if (iTituloEnd.valorNumero && iTituloEnd.valorNumero !== 0) {
            result =
              result +
              ' - ' +
              iTituloEnd.campo +
              ' (' +
              new Intl.NumberFormat('es-CO').format(iTituloEnd.valorNumero) +
              ')';
          }
        }
      }
    }
    return result;
  }

  limpiarRepetidos() {
    if (!this.data.expedientes) {
      this.data.expedientes = [];
    }
    if (this.dataProvider) {
      for (let i = 0; i < this.data.expedientes.length; i++) {
        const exp = this.data.expedientes[i];
        for (let j = 0; j < this.dataProvider.length; j++) {
          const doc = this.dataProvider[j];
          if (exp.llaveTabla === doc.llaveTabla) {
            const index = this.dataProvider.indexOf(doc, 0);
            if (index > -1) {
              this.dataProvider.splice(index, 1);
            }
            break;
          }
        }
      }
    }
    this.colocarTituloDisponibles();
  }

  agregarProceso(p: PedidoVentaDTO) {
    if (!this.data.expedientes) {
      this.data.expedientes = [];
    }
    this.data.expedientes.push(p);
    const index = this.dataProvider.indexOf(p, 0);
    if (index > -1) {
      this.dataProvider.splice(index, 1);
    }
    this.actualizar();
  }

  retirarProceso(p: PedidoVentaDTO): void {
    if (!this.dataProvider) {
      this.dataProvider = [];
    }
    this.dataProvider.unshift(p);
    const index = this.data.expedientes.indexOf(p, 0);
    if (index > -1) {
      this.data.expedientes.splice(index, 1);
    }
    this.actualizar();
  }

  actualizarCombo(avisar: boolean) {
    if (this.proceso) {
      if (
        !this.data.valorOpcion ||
        this.data.valorOpcion !== this.proceso.llaveTabla
      ) {
        this.data.valorOpcion = this.proceso.llaveTabla;
        this.data.principal = this.proceso;
        this.data.valorText = this.proceso.descripcion;
        if (this.proceso.dinero) {
          this.data.valorNumero = this.proceso.dinero.saldo;
        }
        if (avisar) {
          this.avisarModificacion();
        }
      }
    } else {
      if (this.data.valorOpcion) {
        this.data.valorOpcion = null;
        this.data.principal = null;
        this.data.valorText = null;
        if (avisar) {
          this.avisarModificacion();
        }
      }
    }
  }

  recibirDocumentosCombo(pCampo: PedidoVentaCaracteristicaFilterDTO) {
    // Si hay dependientes no debo actualizar la plantilla
    if (this.relatedFields) {
      // Para que se actualice despues de las notificaciones de los listener
      this.proceso = null;
      this.actualizarDataProvider(pCampo.campoDTO.documentos);
    } else {
      // Esto solo es un peque ciclo para el autoload
      if (!this.disponibles) {
        this.actualizarDataProvider(pCampo.campoDTO.documentos);
        // Consulto la plantilla para actualizarla y no tener que volver a consultarla
        const plantillaBase: DocumentoPlantillaDTO = this.templateService.getTemplate(
          this.structure.plantilla, this.urlServer
        );
        let flagDetalle = false;

        for (let i = 0; i < plantillaBase.caracteristicas.length; i++) {
          const iCampo = plantillaBase.caracteristicas[i];
          if (iCampo.llaveTabla === this.structure.llaveTabla) {
            iCampo.documentos = pCampo.campoDTO.documentos;
            // SettingsManager.getInstance().setSetting('DP_'+ plantillaBase.llaveTabla, plantillaBase);
            flagDetalle = true;
            break;
          }
        }

        if (!flagDetalle) {
          for (let i = 0; i < plantillaBase.caracteristicas.length; i++) {
            const iCampoPlantilla = plantillaBase.caracteristicas[i];
            for (let j = 0; j < iCampoPlantilla.productos.length; j++) {
              const iCampoProducto = iCampoPlantilla.productos[j];
              for (
                let k = 0;
                k < iCampoProducto.detallePlantilla.caracteristicas.length;
                k++
              ) {
                const iCampoDetalle =
                  iCampoProducto.detallePlantilla.caracteristicas[k];
                if (
                  iCampoDetalle.campoDTO.llaveTabla ===
                  this.structure.llaveTabla
                ) {
                  iCampoDetalle.campoDTO.documentos =
                    pCampo.campoDTO.documentos;
                  // SettingsManager.getInstance().setSetting('DP_'+ plantillaBase.llaveTabla, plantillaBase);
                  flagDetalle = true;
                  break;
                }
              }
            }
          }
        }
        if (!this.data.valorOpcion) {
          this.loadEmptyFieldStartCombo();
        }
        return;
      }
    }
    // Este es el flujo normal
    if (pCampo && pCampo.campoDTO) {
      // this.data.valorOpcion = null; // PAra que me actualice el que acaba de llegar
      // Si es adicional lo muestro en una lista aparte
      this.actualizarDataProvider(pCampo.campoDTO.documentos);
      // Esto lo hago para que cargue las opciones en caso de dependientes y modificar
      if (!this.proceso) {
        // Para los dependientes no se carga la opcion inicial
        if (!this.disponibles) {
          return;
        }
        if (this.data.principal || this.keyInicial) {
          // Esto lo hago para que cuando copia plantillas los campos depende dejen seleeccionado el proceso
          let procesoEncontrar: String = this.keyInicial;
          if (procesoEncontrar == null) {
            procesoEncontrar = this.data.principal.llaveTabla;
          }
          this.proceso = this.encontrarProcesoBase(procesoEncontrar);
          this.actualizarCombo(false);
          this.keyInicial = null; // Lo coloco nuloo porque solo debe servir ene l iniciar
        } else {
          if (this.disponibles.length === 0) {
            this.sendCreate();
          } else {
            if (this.disponibles.length === 1) {
              this.proceso = this.disponibles[0];
              this.actualizar();
            } else {
              // this.mostrarDisponiblesPop();
            }
          }
        }
      } else {
        this.proceso = this.encontrarProcesoBase(this.proceso.llaveTabla);
        this.actualizar();
      }
    }
  }

  encontrarProcesoBase(pId: String): PedidoVentaDTO {
    // Busca en los documentos un proceso
    if (this.disponibles) {
      for (let index = 0; index < this.disponibles.length; index++) {
        const element = this.disponibles[index];
        if (element.llaveTabla === pId) {
          return element;
        }
      }
    }
    return null;
  }

  actualizarDataProvider(documentos: PedidoVentaDTO[]) {
    // Coloca los procesos disponibles para seleccionar en los componentes visuales
    if (documentos != null) {
      this.disponibles = [];
      documentos.forEach((val) =>
        this.disponibles.push(Object.assign({}, val))
      );
      if (this.proceso) {
        // Sucede que los valores se perdian porque el fcontrol era vacio
        this.fControl.setValue(this.proceso);
      } else {
        if (!this.data.llaveTabla && this.disponibles.length === 1) {
          this.fControl.setValue(this.disponibles[0]);
        } else {
          if (this.data.valorOpcion) {
            this.fControl.setValue(
              this.encontrarProcesoBase(this.data.valorOpcion)
            );
          } else {
            this.fControl.updateValueAndValidity();
          }
        }
      }
    } else {
      this.disponibles = null;
      this.fControl.updateValueAndValidity();
    }
  }

  gestionarKeyUpTextoFocusOut() {
    if (!this.isEnabled || this.proceso) { return; }
    if (this.filteredDocuments && this.filteredDocuments.length !== 0) { return; }
    this.gestionarKeyUpTexto();
  }

  gestionarKeyUpTexto() {
    if (this.isLoading || this.isLoadingList) { return; }
    if (this.isEnabled) {
      /*if (this.filteredDocuments && this.filteredDocuments.length === 1) {
        this.fControl.setValue(this.filteredDocuments[0]);
        return;
      }*/
      if (!this.proceso) {
        let filtroParametro: string = this.fControl.value;
        if (filtroParametro) {
          const campoFiltro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
          if (filtroParametro.startsWith(" ")) { filtroParametro = filtroParametro.substring(1) }
          campoFiltro.filtroParametro = filtroParametro;
          this.procesarCampo(campoFiltro);
          this.filtroBusqueda = filtroParametro;
        }
      }
    }
  }

  sendCreate() {
    if (this.acciones && this.acciones.length !== 0) {
      if (this.acciones.length === 1) {
        this.createNewDocument(this.acciones[0].valor, this.acciones[0].llaveTabla);
        if (this.trigger) { this.trigger.closeMenu(); }
      } else {
        if (this.trigger) { this.trigger.openMenu(); }
      }
    }
  }

  createNewDocument(_plantilla: string, _property: string) {
    const _doc: PedidoVentaDTO = new PedidoVentaDTO();
    if (this.herencia) {
      // Cuando se pueden crear multiples tipo de herencia, 
      //tenia un hz que solo tomaba la primera plantilla
      // Esto se puede mejorar muchisimo para evitar consultar todos
      if (this.relacionesHerencia) {
        let borrarRelaciones = true;
        for (let i = 0; i < this.relacionesHerencia.length; i++) {
          const iRelacion = this.relacionesHerencia[i];
          if (iRelacion.plantilla == _plantilla) {
            borrarRelaciones = false;
            break;
          }
        }
        if (borrarRelaciones) {
          this.relacionesHerencia = undefined;
        }
      }
      if (!this.relacionesHerencia) {
        const filtro: RelacionInternaFilterDTO = new RelacionInternaFilterDTO();
        filtro.estado = StatesEnum.ACTIVE;
        filtro.propiedad = this.herencia.llaveTabla;
        filtro.plantilla = _plantilla;
        this.api.relacionesPropiedad(filtro, this.urlServer).subscribe({
          next: (value: RelacionInternaDTO[]) => {
            this.relacionesHerencia = value;
            this.createNewDocument(_plantilla, _property);
          },
          error: () => {
            this.isLoadingList = false;
          },
        });
        return;
      } else {
        if (this.relacionesHerencia.length === 0) {
          alert(
            'No se encontro una relacion del campo de herencia para la plantilla'
          );
          return;
        } else {
          _doc.caracteristicas = [];
          const campoHer: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
          campoHer.valorOpcion = this.data.documento;
          campoHer.valorText = this.parent.descripcion;
          campoHer.campo = this.relacionesHerencia[0].campo;
          _doc.caracteristicas.push(campoHer);
        }
      }
    } else {
      //Esto es para que lso formularios llenen el campo principal de un crud
      //ejemplo guia roa cliente - direccion de cliente nuevo
      if (this.relatedFields) {
        // Primero valido que pueda obtener todas las relaciones del campo, propiedad depende
        for (let i = 0; i < this.relatedFields.length; i++) {
          const dependentIterato = this.relatedFields[i];
          const relations = this.templateService.getPropertyRelation(dependentIterato.llaveTabla);
          if (!relations || relations.length == 0) {
            const filtro: RelacionInternaFilterDTO = new RelacionInternaFilterDTO();
            filtro.estado = StatesEnum.ACTIVE;
            filtro.propiedad = dependentIterato.llaveTabla;
            this.isLoadingList = true;
            this.api.relacionesPropiedad(filtro, this.urlServer).subscribe({
              next: (value: RelacionInternaDTO[]) => {
                if (!value || value.length === 0) {
                  //Creo una relacion falsa para que no vuelva a filtrar
                  const ri: RelacionInternaDTO = new RelacionInternaDTO();
                  ri.propiedad = dependentIterato.llaveTabla;
                  ri.campo = "FALSE";
                  ri.plantilla = "FALSE";
                  ri.auxiliar = "FALSE";
                  value = [];
                  value.push(ri);
                }
                this.templateService.addRelations(value);
                this.isLoadingList = false;
                this.createNewDocument(_plantilla, _property);
              },
              error: () => {
                this.isLoadingList = false;
              },
            });
            return;
          }
        }

        for (let i = 0; i < this.relatedFields.length; i++) {
          const dependentIterator = this.relatedFields[i];
          const relations = this.templateService.getPropertyRelation(dependentIterator.llaveTabla);
          for (let k = 0; k < relations.length; k++) {
            const iRelation = relations[k];
            if (iRelation.plantilla === _plantilla) {
              for (let j = 0; j < this.data.dependientes.length; j++) {
                const valueDependent = this.data.dependientes[j];
                if (valueDependent.campo === dependentIterator.valor) {
                  if (!_doc.caracteristicas) { _doc.caracteristicas = []; }
                  const fieldNewToCreateDependent: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                  fieldNewToCreateDependent.valorOpcion = valueDependent.valorOpcion;
                  fieldNewToCreateDependent.campo = iRelation.campo;
                  _doc.caracteristicas.push(fieldNewToCreateDependent);
                  break;
                }
              }
            }
          }
        }
      }

    }
    _doc.plantilla = _plantilla;
    _doc.server = this.urlServer;
    this.utilsService
      .modalWithParams(_doc, true, this.fControl.value)
      .subscribe((res) => {
        if (res && res.data) {
          if (this.tipoTexto) {
            const documentoCreado: PedidoVentaDTO = res.data;
            const nFilter: PedidoVentaCaracteristicaFilterDTO = this.transformPVCtoFilter(
              this.data
            );
            nFilter.filtroParametro = documentoCreado.nombre;
            nFilter.valorOpcion = documentoCreado.llaveTabla;
            this.procesarCampo(nFilter);
          } else {
            if (this.tipoMultiple) {
              /*
            provider.addEventListener('submitComplete',function (event:ChainEvent):void{
            //dispatchEvent(new ChainEvent('submitComplete',ChainEvent(event).entityObject));
            if(provider!=null){
              if(event.entityObject !=null && event.entityObject is PedidoVentaVO){
                if(listDisponibles!=null){
                  if(listDisponibles.dataProvider==null) listDisponibles.dataProvider = new ArrayCollection();
                  listDisponibles.dataProvider.addItem(event.entityObject);
                  actualizar();
                }
              }
              provider.ocultarAddItems();
              provider.listar();
            }
          });
            */
            } else {
              if (!this.disponibles) { this.disponibles = []; }
              if (!this.structure.documentos) { this.structure.documentos = []; }
              this.structure.documentos.push(res.data);
              this.disponibles = this.structure.documentos;
              this.fControl.setValue(res.data);
            }
          }
        }
      });
    this.fControl.setValue(null);
  }

  actualizarTexto(): void {
    if (this.proceso) {
      if (
        (!this.data.valorOpcion && this.proceso.llaveTabla) ||
        (this.data.valorOpcion !== this.proceso.llaveTabla) ||
        (this.proceso.dinero && !this.data.valorNumero)
      ) {
        this.data.valorOpcion = this.proceso.llaveTabla;
        this.data.principal = this.proceso;
        if (this.proceso.dinero) {
          // No se si meterlo en actualizar
          if (!this.isEmpty(this.procesoValor) && this.procesoValor === '2') {
            this.data.valorNumero = this.proceso.dinero.saldo;
          } else {
            this.data.valorNumero = this.proceso.dinero.valorTotal;
          }
        }
        this.fControl.setValue(this.proceso);
        if (!this.data.valorText) { this.data.valorText = this.proceso.descripcion; }
        this.avisarModificacion();
      }
    } else {
      if (this.data.valorOpcion) {
        this.data.valorOpcion = null;
        this.data.principal = null;
        this.data.valorText = null;
        // if(txtProceso!=null) txtProceso.text = null;
        this.avisarModificacion();
      }
    }
  }

  recibirDocumentosTexto(pCampo: PedidoVentaCaracteristicaFilterDTO): void {
    // Este es el flujo normal
    if (pCampo != null && pCampo.campoDTO != null) {
      if (this.isEnabled) {
        this.data.valorOpcion = null; // PAra que me actualice el que acaba de llegar
      }
      // Si es adicional lo muestro en una lista aparte
      this.actualizarDataProvider(pCampo.campoDTO.documentos);
      // Esto lo hago para que cargue las opciones en caso de dependientes y modificar
      if (!this.proceso) {
        if (!this.disponibles) {
          return;
        }
        if (this.disponibles.length === 0) {
          this.sendCreate();
          this.fControl.setValue(null);
        } else {
          if (this.disponibles.length === 1) {
            this.proceso = this.disponibles[0];
            if (!this.data.documento) {
              this.data.valorOpcion = null;
            }
            this.actualizar();
            if (!this.acabadoCrear) {
              // gestionarKeyUp(new KeyboardEvent(KeyboardEvent.KEY_UP,true,false,Keyboard.F9, Keyboard.F9));
            } else {
              this.acabadoCrear = false;
            }
            if (this.readQR) {
              this.submit();
            }
          } else {
            // this.mostrarDisponiblesPop();
          }
        }
      } else {
        // Esto lo hago solo para evitar que el campo quede en modificado si ya tiene datos y despues de que recibe el listado
        const procesoEncontrado: PedidoVentaDTO = this.encontrarProcesoBase(
          this.proceso.llaveTabla
        );
        if (procesoEncontrado) {
          this.proceso = procesoEncontrado;
        }
        this.data.valorOpcion = this.proceso.llaveTabla;
        this.data.principal = this.proceso;
        if (this.proceso.dinero) {
          this.data.valorNumero = this.proceso.dinero.saldo;
        }
        this.actualizar();
        if (this.saveToSelect) { this.form.submit(); }
      }
    }
  }

  //// COPIADO  De LIST
  listar(_pagina: number) {
    if (this.isLoadingList || this.isLoading) {
      return;
    }
    const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
    //Para los campos herencia simple no se agregan las opciones de filtro
    if (this.fControlCheck) {
      // Valido Fechas
      if (this.fControlCheck.value) {
        if (!this.fControlSearch.value) {
          alert('Coloca el codigo del documento');
          return;
        }
        entity.nombre = this.fControlSearch.value;
        entity.filtroParametro = null;
      } else {
        entity.nombre = null;
        entity.filtroParametro = this.fControlSearch.value;
        if (this.fControlDateStart.value) {
          const startDate = new Date(this.fControlDateStart.value);
          startDate.setHours(0, 0, 0, 0);
          let endDate = new Date(this.fControlDateStart.value);
          if (this.fControlDateEnd.value) {
            endDate = new Date(this.fControlDateEnd.value);
            endDate.setHours(0, 0, 0, 0);
          }
          endDate.setDate(endDate.getDate() + 1);
          entity.fechaMin = startDate;
          entity.fechaMax = endDate;
        } else {
          if (this.solicitarFechas) {
            alert('Selecciona fechas');
            return;
          }
        }
      }
    }


    // Lo complejo
    // 1 si tiene relacionado es para enviarlos al
    const valorFuncion = this.isEmpty(this.obtenerValor(PlantillaHelper.PROCESO_FUNCION_SQL));

    entity.campoOrigen = this.structure.llaveTabla;
    if (!this.herencia) {
      if (!valorFuncion) {
        if (this.relatedFields) {
          if (
            this.data.dependientes.length !== 1 ||
            !this.data.dependientes[0].valorOpcion
          ) {
            alert(
              'Por favor revisa que este seleccionado el campo ' +
              this.relatedFields[0].texto
            );
            return;
          } else {
            entity.llaveTabla = this.data.dependientes[0].valorOpcion; // Viaja el id del campo dependiente para el query
          }
          entity.caracteristicas = this.data.dependientes;
        } else {
          // Oculte este campo porque en tcm las rutas de un despachador no se veian
          // pero tengo dudas de donde funcionaba
          // En logimax me di cuenta que no filtraba las guias por el cliente asi que volvi a colocar la linea
          entity.llaveTabla = this.data.documento; // Viaja el id del documento para el query
        }
        entity.plantilla = this.structure.plantilla; // Para el multiple que no pide palntilla sino que se basa en los estados
      } else {
        if (this.plantilla) {
          // Por aqui solo trae los de una plantilla
          if (this.relatedFields) {
            entity.caracteristicas = [];
            for (let i = 0; i < this.data.dependientes.length; i++) {
              const iCampoPedido = this.data.dependientes[i];
              const iCampo: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
              if (!iCampoPedido.valorOpcion) {
                alert(
                  'Por favor revisa que este seleccionado el campo ' +
                  this.relatedFields[0].texto
                );
                return;
              } else {
                iCampo.valorOpcion = iCampoPedido.valorOpcion;
              }
              entity.caracteristicas.push(iCampo);
            }
          }
        } else {
          // Por aqui trae los que se realcionan con el estado
          entity.plantilla = this.structure.plantilla;
        }
      }
    } else {
      entity.textoFiltro = this.data.documento;
    }

    if (this.plantilla && !this.herencia) {
      entity.plantilla = this.plantilla.llaveTabla;
    }
    // Paginacion
    if (_pagina === 1) {
      this.dataProvider = [];
      this.isEndList = false;
    }
    entity.paginacionRegistroInicial = this.cantidadPagina * (_pagina - 1);
    entity.paginacionRegistroFinal = this.cantidadPagina;
    if (!this.herencia) {
      entity.estado = StatesEnum.ACTIVE;
    } else {
      entity.estado = '';
      if (this.fCheckActivo.value) { entity.estado = entity.estado + ";" + StatesEnum.ACTIVE; }
      if (this.fCheckInactivo.value) { entity.estado = entity.estado + ";" + StatesEnum.INACTIVE; }
      if (this.fCheckFinalizado.value) { entity.estado = entity.estado + ";" + StatesEnum.FINALIZADO; }
      if (entity.estado === '') { entity.estado = entity.estado + ";" + StatesEnum.ACTIVE; }
    }
    entity.estadoExpediente = null;
    this.isLoadingList = true;
    this.api.listarDocumentos(entity, this.urlServer).subscribe({
      next: (dataResult: PedidoVentaDTO[]) => {
        if (this.pagina === 1) {
          this.dataProvider = dataResult;
        } else {
          this.dataProvider = this.dataProvider.concat(dataResult);
        }
        if (dataResult.length === this.cantidadPagina) {
          this.pagina++;
        } else {
          this.isEndList = true;
          this.pagina = 1;
        }
        this.isLoadingList = false;
        this.limpiarRepetidos();
        if (this.fControlCheck) {
          if (this.fControlCheck.value) {
            if (this.dataProvider.length === 0) {
              Swal.fire('Sin resultados', 'No encontramos resultados que concuerden con tu busqueda ' + this.fControlSearch.value, 'info');
              this.fControlSearch.setValue(null);
            } else {
              if (this.dataProvider.length === 1) {
                this.agregarProceso(this.dataProvider[0]);
                this.fControlSearch.setValue(null);
              }
            }
          }
        } else {
          //aqui ingresan solmanete los de herencia sencillos (no multiples)
          if (this.dataProvider.length === 0) {
            this.sendCreate();
          } else {
            this.openDialog(this.dataProvider[0]);
          }
        }
        this.labelSearch = this.generateLabelToList(this.dataProvider);
      },
      error: () => {
        this.isLoadingList = false;
      },
    });
  }
  // Para la interfaz
  getColor(pEstado: string): string {
    return this.templateService.getColor(pEstado);
  }

  getColorFont(pEstado: string) {
    return this.templateService.getColorFont(pEstado);
  }

  // Para scanner

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    const audio = new Audio();
    audio.src = 'assets/audio/beep.mp3';
    audio.load();
    audio.play();
    this.fControl.setValue(resultString + this.fControl.value);
    if (!this.multiple) {
      this.fControl.setValue(resultString);
      this.gestionarKeyUpTexto()
    } else {
      this.fControlSearch.setValue(resultString);
      this.listar(1);
    }
  }

  toogleScanner() {
    this.scannerEnabled = !this.scannerEnabled;
    if (this.scannerEnabled) {
      if (this.fControlCheck) { this.fControlCheck.setValue(true); }
      if (this.fControlSearch) { this.fControlSearch.setValue(null); }
      if (this.fControl) { this.fControl.setValue(null); }
      this.inputModeText = 'none';
    } else {
      this.inputModeText = 'text';
    }
  }

  agregarTodos() {
    if (this.dataProvider && this.dataProvider.length) {
      for (let index = this.dataProvider.length - 1; index >= 0; index--) {
        const element = this.dataProvider[index];
        this.agregarProceso(element);
      }
      this.listar(this.pagina);
    }
  }

  goToLink() {
    if (this.proceso && this.linkExternal && this.linkExternal.texto) {
      const filter = new PedidoVentaFilterDTO();
      filter.llaveTabla = this.proceso.llaveTabla;
      filter.plantilla = this.proceso.plantilla;
      this.api.consultarDocumento(filter, this.urlServer).subscribe({
        next: (fullDocument: PedidoVentaDTO) => {
          if (fullDocument && fullDocument.caracteristicas) {
            for (let index = 0; index < fullDocument.caracteristicas.length; index++) {
              const element = fullDocument.caracteristicas[index];
              // Aqui hay algo que los campos llegan con el nombre y el valor por eso se relaciona el atribut campo
              if (element.campoDTO && element.campoDTO.codigo === this.linkExternal.texto) {
                window.open(element.valorText, "_blank");
                break;
              }
            }
          }
        },
        error: () => { }
      });
    }
  }

  gestionarFocus() {
    if (this.proceso == null) { (this.filteredDocuments = this.disponibles); }
    // if ( this.readQR && !this.scannerEnabled) { this.toogleScanner(); }
  }

  send2Server(): boolean {
    if (this.isLoading) {
      /*Swal.fire(
        'Consultando datos',
        this.structure.nombre 'Todavia tienes imagenes pendientes por cargar, danos un minuto mas',
        'info'
      );*/
      return false;
    }
    return true;
  }

}
