import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseComponent } from '../base/base.component';
import { DocumentoPlantillaCaracteristicaDTO, DocumentoPlantillaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaDTO, PedidoVentaFilterDTO, ProcesoTransicionDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { DocumentoPlantillaCaracteristicaEnum, StatesEnum } from '../../../model/sw42.enum';
import { MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from '../../form.component';
import Swal from 'sweetalert2';
import { ApiService } from '../../../service/api.service';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { MatTooltip } from '@angular/material/tooltip';
import { TitleCasePipe } from '@angular/common';
import { ImageFormatPipe } from '../../../../../../shared/local-image';
import { FormTransitionService } from 'app/modules/full/neuron/service/form-transition.service';

@Component({
    selector: 'app-vinculo',
    templateUrl: './vinculo.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [  MatTooltip,TitleCasePipe,ImageFormatPipe]
})
export class VinculoComponent extends BaseComponent implements OnInit {
  private utilsService = inject(UtilsService);
  private templateService = inject(TemplateService);
  dialogRef = inject<MatDialogRef<FormComponent>>(MatDialogRef);
  private api = inject(ApiService);
  private transitionService = inject(FormTransitionService);


  proceso: PedidoVentaDTO; // Contiene el documento seleccionado

  auxPlantillaProxima: string | null; // LAs transiciones aveces no tienen cargados los campos y se encesitan
  documentToTransition: PedidoVentaDTO | null;
  transiciones: ProcesoTransicionDTO[] = []; // Lista de botones

  plantilla: DocumentoPlantillaDTO; // Contiene la estructura del formulario

  private CAMPO_POSIBLE_MENOR_PRIORIDAD = '__*__';

  ngOnInit() {
    super.ngOnInit();
    if (!this.data || !this.data.expedientes || this.data.expedientes.length === 0) { return; }
    this.proceso = this.data.expedientes[0];
    this.data.principal = this.proceso;
    if (this.proceso.dinero) {
      this.data.valorNumero = this.proceso.dinero.saldo;
    }

    if (this.proceso.estado === StatesEnum.ACTIVE) {
      this.getTransitionsOfTemplate(
        this.proceso.plantilla,
        this.proceso.estadoExpediente,
        this.proceso);
    }


  }

  getTransitionsOfTemplate(template: string, pState: string, pDocumentTransition: PedidoVentaDTO) {
    const pTemplate: DocumentoPlantillaDTO = this.templateService.getTemplate(template, null!)!;
    if (!pTemplate) return;
    this.plantilla = pTemplate;
    const transitions = this.transitionService.getTransitionsOfTemplate(pTemplate, pState, pDocumentTransition);
    transitions.forEach(t => this.transiciones.push(t));
  }

  openDocument(p: PedidoVentaDTO) {
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = p.plantilla;
    pedidoVenta.llaveTabla = p.llaveTabla;
    pedidoVenta.server = this.urlServer;
    this.utilsService.modalWithParams(pedidoVenta, false);
  }


  getColor(pEstado: string) {
    return this.templateService.getColor(pEstado);
  }

  getColorFont(pEstado: string) {
    return this.templateService.getColorFont(pEstado);
  }

  consultarDocumento(pNextTemplate: string) {

    if (this.proceso.caracteristicas) {
      this.organizarDocumentoProceso(pNextTemplate);
      return;
    }

    const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
    entity.llaveTabla = this.proceso.llaveTabla;
    this.api.consultarDocumento(entity, this.plantilla.server)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (_value: PedidoVentaDTO) => {
        this.proceso = _value;
        this.organizarDocumentoProceso(pNextTemplate);
      },
      error: () => {
        //this.dialogRef.close();
      }
    });
  }

  organizarDocumentoProceso(pNextTemplate: string,) {
    const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
      this.proceso.plantilla, null!
    )!;
    // Debo cargar los campos tambien de la plantilla del documento
    if (!dp.caracteristicas) {
      this.auxPlantillaProxima = pNextTemplate;
      this.cargarPlantilla(dp.llaveTabla, dp.server)
      //this.cargarCamposPlantilla(dp);
      return;
    }

    for (let j = 0; j < this.proceso.caracteristicas.length; j++) {
      for (let i = 0; i < dp.caracteristicas.length; i++) {
        if (this.proceso.caracteristicas[j].campo === dp.caracteristicas[i].llaveTabla) {
          this.proceso.caracteristicas[j].campoDTO = dp.caracteristicas[i];
          break;
        }
      }
    }
    this.crearPlantilla(pNextTemplate, this.proceso);
  }

  // Se encarga de abrir el formulario de la transicion
  crearPlantilla(pNextTemplate: string, pDocument: PedidoVentaDTO) {
    if (!pNextTemplate) return;
    /*if (this.formIsModified) {
        Swal.fire('Guarda documento', 'Por favor guarda los cambios del documento antes de crear una nueva accion', 'info');
        return;
    }*/
    this.auxPlantillaProxima = pNextTemplate;
    this.documentToTransition = pDocument;
    const _nextTemplate: DocumentoPlantillaDTO = this.cargarPlantilla(pNextTemplate, this.plantilla.server)!;
    if (!_nextTemplate) return;
    // Se supone que la carga asincrona
    const _doc: PedidoVentaDTO = new PedidoVentaDTO();
    _doc.plantilla = pNextTemplate;
    const camposPosibles: DocumentoPlantillaCaracteristicaDTO[] = [];
    let textoCampoPosible: string | null;

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
              campoDoc.principal = null!;
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
    //_doc.server = this.plantilla.server;
    this.utilsService.modalWithParams(_doc, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
      if (res && this.dialogRef) {
        this.dialogRef.close();
        /*if (!this.close2Save) {
            if (res && res.data && res.data.messages) { this.pedido.messages = res.data.messages; }
            else { this.pedido.messages = null; }
            this.utilsService.modalWithParams(this.pedido);
        }*/
      }
    });
  }

  // Solo lo uso en crear plantilla siguiente asi que puedo ver como optimizar despues
  validateIsPossibleField(campo: DocumentoPlantillaCaracteristicaDTO, plantilla: string): string | null {
    if (!campo || campo.formato !== DocumentoPlantillaCaracteristicaEnum.PROCESO) return null;

    const propAuxiliarTemplates: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(campo.propiedades, PlantillaHelper.PLANTILLA_AUXILIAR)!;
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

  // Consulto de las plantillas generales la plantilla
  cargarPlantilla(plantillaId: string, urlServer: string): DocumentoPlantillaDTO | undefined {
    const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(
      plantillaId, urlServer
    )!;
    if (dp) {
      if (!this.proceso.llaveTabla && PlantillaHelper.isEmpty(dp.propiedades,
        PlantillaHelper.PERMISO_PLANTILLA_CREAR
      )) {
        Swal.fire('Autorizacion', 'No tienes permisos para crear registros este tipo de documento. ' + dp.nombre, 'info');
        this.dialogRef.close();
        return;
      }
      // Si la plantilla no tiene caracteristicas se debe consultar al servidor de forma completa
      if (!dp.caracteristicas) {
        this.isLoading.set(true);
        this.api
          .obtenerCampos(plantillaId, dp.server)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (plantilla: DocumentoPlantillaDTO) => {
              plantilla.server = dp.server;
              this.isLoading.set(false);
              this.cargarCamposPlantilla(plantilla);
            },
            error: () => {
              this.isLoading.set(false);
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
    )!;
    if (dp) {
      dp.caracteristicas = value.caracteristicas;
      this.templateService.getTemplate(value.llaveTabla, value.server)!.caracteristicas =
        value.caracteristicas;
      // SettingsManager.getInstance().setSetting("DP_" + value.llaveTabla, dp);

      if (!this.plantilla) {
        // asumo que esta en el form principal  y que es la primera vez que consulta
        this.plantilla = dp;
        //   El camino normal es que venga por este lado
        /*if (this.pedidoBase) {
          if (this.pedidoBase.llaveTabla) {
            this.consultarDocumento(this.pedidoBase.llaveTabla);
          } else {
            this.pedido = this.copiarPedidoBase(this.pedidoBase, false);
            this.showForm();
          }
        }*/
      } else {
        if (this.documentToTransition) {
          this.crearPlantilla(this.auxPlantillaProxima!, this.documentToTransition);
          this.auxPlantillaProxima = null;
          this.documentToTransition = null;
        }
        else {
          this.organizarDocumentoProceso(this.auxPlantillaProxima!);
        }
        // asumo que es una transicion
      }
    } else {
      console.error('No se encuentra cargada la plantilla en memoria');
      return;
    }
  }
}
