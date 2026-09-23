import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, DestroyRef, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import {
  DocumentMessage,
  DocumentoPlantillaCaracteristicaDTO,
  DocumentoPlantillaDTO,
  PedidoVentaDTO,
} from 'app/document/document.types';
import { DocumentApi } from 'app/document/document.api';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import {
  getFieldFromTemplate,
} from '../../business/massive-helper';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/document/form/form.enum';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LoadLineDTO } from '../../domain/LoadLineDTO';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UploadService } from 'app/upload/upload.api';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { LocalStoreService } from 'app/shared/local-store.service';
import { formatImageUrl } from 'app/shared/local-image';
import { FileHandlerService } from 'app/shared/file-handler.service';
import { MassiveApiService } from 'app/massiveload/massive.api';
import { MassiveParseResponse } from 'app/massiveload/domain/MassiveParseResponse';
import { PlantillaBaseResponse } from 'app/massiveload/domain/PlantillaBaseResponse';

@Component({
    selector: 'app-massive',
    templateUrl: './massive.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, FormsModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MassiveComponent implements OnInit {
  private notificationCenter = inject(NotificationCenterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private templateService = inject(TemplateService);
  private api = inject(DocumentApi);
  private uploadApi = inject(UploadService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private ls = inject(LocalStoreService);
  private fileHandler = inject(FileHandlerService);
  private massiveApi = inject(MassiveApiService);
  private pendingSaveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.pendingSaveTimeout) {
        clearTimeout(this.pendingSaveTimeout);
      }
    });
  }

  plantillaId: string;

  plantilla = signal<DocumentoPlantillaDTO | undefined>(undefined); // Estructura base de la lista

  canMassive = false;
  failedDocuments = signal<PedidoVentaDTO[]>([]);
  inicio: Date;
  cantidadProcesada: number;

  lblCarga = signal('');
  lblTipoProceso = signal('');
  lblProcesar = signal('');

  isLoading = signal(false);
  isValidate = signal(false);
  isProcessing = signal(false);
  isUpdate = false;

  camposConsultar: DocumentoPlantillaCaracteristicaDTO[];

  documentosGenerados = signal<LoadLineDTO[]>([]);
  documentosGeneradosMultiple = signal<LoadLineDTO[]>([]);
  inicialCamposConsultar = 0;

  currentPedido: PedidoVentaDTO;

  fieldIdInTemplateSecondary = signal<DocumentoPlantillaCaracteristicaDTO | undefined>(undefined);

  dataSource = signal(new MatTableDataSource<LoadLineDTO>([]));
  displayedColumns = signal<string[]>([]);
  titleColumns = signal<string[]>([]);
  fTiempoEspera: number = 0;
  skipSelected: boolean = false;
  pause: boolean = false;

  files: FileList;

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
      this.plantillaId = params.template;
      if (this.plantillaId) {
        this.plantilla.set(this.templateService.getTemplate(
          this.plantillaId
        )!);
        this.startForm();
      } else {
        this.router.navigate(['/main']);
      }
    });
    this.dialog.closeAll();
    this.fTiempoEspera  = 0;
  }

  startForm() {
    if (!this.plantilla()) {
      this.router.navigate(['/main']);
    } else {
      // Obtener Variables
      this.canMassive = !PlantillaHelper.isEmpty(
        this.plantilla()!.propiedades,
        PlantillaHelper.PERMISO_PLANTILLA_CARGA_MASIVA
      );
      if (!this.canMassive) {
        // this.closeMassiveForm();
      }
      this.validateCamposPlantilla(this.plantilla()!);

      const propertyLoadMassiveMultiple = PlantillaHelper.buscarPropiedad(
        this.plantilla()!.propiedades,
        PlantillaHelper.PLANTILLA_CARGA_MASIVA_MULTIPLE
      );

      if (propertyLoadMassiveMultiple) {
        const fieldMultiple: DocumentoPlantillaCaracteristicaDTO =
          getFieldFromTemplate(
            this.plantilla()!,
            propertyLoadMassiveMultiple.valor
          )!;
        const crudProperty: string = PlantillaHelper.buscarValor(
          fieldMultiple.propiedades,
          PlantillaHelper.PROCESO_ACCIONES
        );

        if (!crudProperty) {
          this.notificationCenter.fire(
            'Unsupported',
            'No encotramos la propiedad CRUD del campo ' + fieldMultiple.nombre
          );
          return;
        }

        const template: DocumentoPlantillaDTO =
          this.templateService.getTemplate(crudProperty)!;

        if (!template.caracteristicas) {
          this.isProcessing.set(true);
          this.api.obtenerCampos(crudProperty).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (plantilla: DocumentoPlantillaDTO) => {
              this.isProcessing.set(false);
              this.loadFiledInMultipleTemplate(plantilla);
              this.templateService.getTemplate(
                plantilla.llaveTabla
              )!.caracteristicas = plantilla.caracteristicas;
            },
            error: () => {
              this.isProcessing.set(false);
            },
          });
          return;
        } else {
          this.loadFiledInMultipleTemplate(template);
        }
      }
    }
  }

  loadFiledInMultipleTemplate(template: DocumentoPlantillaDTO) {
    for (let index = 0; index < template.caracteristicas.length; index++) {
      const element = template.caracteristicas[index];
      const dbProperty: PropiedadDTO[] = PlantillaHelper.buscarValorMultiple(
        element.propiedades,
        PlantillaHelper.PLANTILLA_AUXILIAR
      )!;
      if (dbProperty) {
        for (let j = 0; j < dbProperty.length; j++) {
          const elementProperty = dbProperty[j];
          if (elementProperty.valor === this.plantilla()!.llaveTabla) {
            this.fieldIdInTemplateSecondary.set(element);
            return;
          }
        }
      }
    }
    if (!this.fieldIdInTemplateSecondary()) {
      this.notificationCenter.fire(
        'Unsupported',
        'En la plantilla ' +
        template.nombre +
        ' no encontramos ningun campo con fuente de datos ' +
        this.plantilla()!.nombre
      );
    }
  }

  /////////////// DESCARGAR ARCHIVO BASE ///////////////////////////
  downloadBase(type: string) {
    if (!this.plantilla()) {
    } else {
      if (!this.validateCamposPlantilla(this.plantilla()!)) {
        return;
      }
      const format = type === 'xml' ? 'xml' : 'xlsx';
      this.lblCarga.set('GENERANDO ARCHIVO BASE');
      this.isLoading.set(true);
      this.massiveApi.generarBasePlantilla(this.plantilla()!.llaveTabla, format)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: PlantillaBaseResponse) => {
            this.api.getImage(formatImageUrl(this.ls, response.url)!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (blob: Blob) => {
                this.fileHandler.descargarArchivo(blob, this.plantilla()!.nombre + '.' + format);
                this.isLoading.set(false);
                this.lblCarga.set('');
              },
              error: () => {
                this.isLoading.set(false);
              },
            });
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
    }
  }

  validateCamposPlantilla(template: DocumentoPlantillaDTO): boolean {
    if (template.caracteristicas === null) {
      this.notificationCenter.fire(
        '',
        'Revisa porque no tienes caracteristicas de la plantilla ' +
        template.nombre,
        'warning'
      );
    }
    return true;
  }

  //tambien esta en tipo numero toca centralizarla
  /////////////CARGAR MULTIPLE///////////////////////////////////

  handleFileInputMultiple(files: FileList) {
    if (!this.fieldIdInTemplateSecondary()) {
      this.notificationCenter.fire(
        'Unsupported',
        'No encontramos la propiedad carga masiva plantilla multiple '
      );
      return;
    }
    const template = this.templateService.getTemplate(
      this.fieldIdInTemplateSecondary()!.plantilla
    )!;
    this.validateCamposPlantilla(template);
    for (let i = 0; i < files.length; i++) {
      this.lblCarga.set('CARGANDO PLANTILLA MULTIPLE ' + '<--' + this.lblCarga());
      this.massiveApi.parseArchivo(files[i], template.llaveTabla)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: MassiveParseResponse) => {
            this.hidratarLineas(response, template);
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
    }
  }

  ///////////////////// CARGAR /////////////////////////////////

  handleFileInput(files: FileList) {
    this.isUpdate = false;
    if (this.plantilla()) {
      if (!this.validateCamposPlantilla(this.plantilla()!)) {
        return;
      }
    } else {
      this.notificationCenter.fire('Carga plantilla',
        'No encontramos la informacion de la plantilla',
        'info'
      );
    }
    for (let i = 0; i < files.length; i++) {
      this.lblCarga.set('CARGANDO ARCHIVO' + ' <-- ' + this.lblCarga());
      this.massiveApi.parseArchivo(files[i], this.plantilla()!.llaveTabla)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: MassiveParseResponse) => {
            this.hidratarLineas(response, this.plantilla()!);
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
    }
  }

  generateColumnNames(template:DocumentoPlantillaDTO){
    this.titleColumns.set([]);
    this.displayedColumns.set(['orderNumber']);
    if(this.isUpdate){this.displayedColumns.update(cols => [...cols, 'updateId']);}
    this.displayedColumns.update(cols => [...cols, 'status']);
    this.displayedColumns.update(cols => [...cols, 'messages']);
    for (let k = 0; k < template.caracteristicas.length; k++) {
      const iCampo = template.caracteristicas[k];
      this.displayedColumns.update(cols => [...cols, iCampo.nombre]);
      this.titleColumns.update(cols => [...cols, iCampo.nombre]);
    }

  }

  private hidratarLineas(response: MassiveParseResponse, template: DocumentoPlantillaDTO) {
    if (response.camposSinValidar && response.camposSinValidar.length > 0) {
      let camposSinValidar = '';
      for (const key of response.camposSinValidar) {
        camposSinValidar = key + ", " + camposSinValidar;
      }
      this.notificationCenter.fire("Atencion", "CIUDADO hay campos que no se tienen en cuenta. " + camposSinValidar, "warning");
    }

    const documentos: LoadLineDTO[] = [];
    for (const element of response.lines) {
      const line: LoadLineDTO = new LoadLineDTO();
      line.orderNumber = element.orderNumber;
      line.updateId = element.updateId;
      line.status = element.status;
      line.messages = element.messages;
      line.document = element.document;
      if (line.document.caracteristicas) {
        for (const iCampo of line.document.caracteristicas) {
          const campoTemplate = getFieldFromTemplate(template, iCampo.campo);
          iCampo.campoDTO = campoTemplate as DocumentoPlantillaCaracteristicaDTO;
        }
      }
      documentos.push(line);
    }

    this.camposConsultar = [];
    this.construirCamposConsulta(documentos);

    this.isValidate.set(false);
    this.failedDocuments.set([]);
    this.lblProcesar.set('');
    this.lblCarga.set(
      'CARGANDO ' +
      documentos.length +
      ' DOCUMENTOS ' +
      ' <-- ' +
      this.lblCarga()
    );
    this.inicio = new Date();
    this.isUpdate = documentos.some(line => !!line.updateId);
    if (template.llaveTabla === this.plantilla()!.llaveTabla) {
      this.documentosGenerados.set(documentos);
      this.generateColumnNames(this.plantilla()!);
      this.dataSource.set(new MatTableDataSource(this.documentosGenerados()));
      if (!this.documentosGenerados() || this.documentosGenerados().length === 0) {
        this.lblCarga.set(this.lblCarga() + 'Revisa la carga debido a que no se generaron documentos');
        return;
      }
      this.inicio = new Date();
      this.cantidadProcesada = 1;
      this.inicialCamposConsultar = this.camposConsultar.length;
      this.procesarCamposProceso(
        this.camposConsultar,
        template,
        this.documentosGenerados()
      );
    } else {
      this.documentosGeneradosMultiple.set(documentos);
      if (!this.documentosGeneradosMultiple() || this.documentosGeneradosMultiple().length === 0) {
        this.notificationCenter.fire('No documents', 'Revisa la carga debido a que no se generaron documentos', 'error');
        return;
      }
      this.inicio = new Date();
      this.cantidadProcesada = 1;
      this.inicialCamposConsultar = this.camposConsultar.length;
      this.procesarCamposProceso(
        this.camposConsultar,
        template,
        this.documentosGeneradosMultiple()
      );
    }
  }

  private construirCamposConsulta(documentos: LoadLineDTO[]) {
    for (const line of documentos) {
      if (line.status !== 'OK') continue;
      for (const campo of line.document.caracteristicas) {
        if (
          campo.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.PROCESO &&
          !campo.valorOpcion &&
          !PlantillaHelper.buscarValor(campo.campoDTO.propiedades, PlantillaHelper.DEPENDE) &&
          campo.valorText
        ) {
          this.acumularProcesosConsulta(campo.campoDTO, campo.valorText);
        }
      }
    }
  }

  acumularProcesosConsulta(
    campo: DocumentoPlantillaCaracteristicaDTO,
    id: string
  ) {
    if (
      this.fieldIdInTemplateSecondary() &&
      this.fieldIdInTemplateSecondary()!.llaveTabla === campo.llaveTabla
    )
      return;
    if (!campo || !campo.llaveTabla) {
      this.notificationCenter.fire('', 'No se puede acumular un proceso sin campo', 'info');
      return;
    }
    if (!id) {
      this.notificationCenter.fire('', 'No se puede acumular un proceso sin id', 'info');
      return;
    }
    for (let index = 0; index < this.camposConsultar.length; index++) {
      const iCampo = this.camposConsultar[index];
      if (iCampo.llaveTabla === campo.llaveTabla) {
        for (let j = 0; j < iCampo.documentos.length; j++) {
          const iDocumento = iCampo.documentos[j];
          if (iDocumento.nombre === id) {
            return;
          }
        }
        const procesoAdicionar: PedidoVentaDTO = new PedidoVentaDTO();
        procesoAdicionar.nombre = id;
        iCampo.documentos.push(procesoAdicionar);
        return;
      }
    }
    campo.documentos = [];
    const procesoCampoAdicionar: PedidoVentaDTO = new PedidoVentaDTO();
    procesoCampoAdicionar.nombre = id;
    campo.documentos.push(procesoCampoAdicionar);
    this.camposConsultar.push(campo);
  }

  procesarCamposProceso(
    fieldsToReview: DocumentoPlantillaCaracteristicaDTO[],
    template: DocumentoPlantillaDTO,
    documentsToRefactor: LoadLineDTO[]
  ) {
    if (fieldsToReview.length !== 0) {
      if (template) {
        const currentCampo = fieldsToReview[0];
        const detalle =
          ' .......PROCESANDO CONSULTANDO ID  (' + this.cantidadProcesada + ')'
          currentCampo.nombre +
          ' INICIO : ' +
          this.inicio.toISOString() +
          ' HORA ACTUAL : ' +
          new Date().toISOString() +
          ' DURACION : ' +
          (new Date().getTime() - this.inicio.getTime()) / 1000 +
          'seg';
        this.lblTipoProceso.set(detalle);
        //esto es para enviar a consultar solo de a 100
        const numberToDistribute = 100;
        this.cantidadProcesada =  this.cantidadProcesada + numberToDistribute;
        if(currentCampo.documentos.length > numberToDistribute){
          const fieldToDistribute:DocumentoPlantillaCaracteristicaDTO = new DocumentoPlantillaCaracteristicaDTO();
          fieldToDistribute.llaveTabla = currentCampo.llaveTabla;
          fieldToDistribute.documentos = currentCampo.documentos.slice(numberToDistribute);
          currentCampo.documentos = currentCampo.documentos.slice(0,numberToDistribute);
          fieldsToReview.push(fieldToDistribute);
        }
        this.isProcessing.set(true);
        this.api
          .validarTipoProcesoCarga(currentCampo)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next:(value: DocumentoPlantillaCaracteristicaDTO)=>{
              this.isProcessing.set(false);
              if (value != null) {
                //Itero por todos los documentos
                for (let a = 0; a < documentsToRefactor.length; a++) {
                  const iLineToLoad = documentsToRefactor[a];
                  if(iLineToLoad.status === 'OK'){
                    //Itero por todas las caracteristicas
                    for (let b = 0; b < iLineToLoad.document.caracteristicas.length; b++) {
                      const iCampo = iLineToLoad.document.caracteristicas[b];
                      if (iCampo.campo === value.llaveTabla) {
                        //Itero por todas las respuestas
                        for (let c = 0; c < value.documentos.length; c++) {
                          const iResultFromServer = value.documentos[c];
                          if (iResultFromServer.nombre === iCampo.valorText) {
                            if(!iResultFromServer.llaveTabla){
                              iLineToLoad.messages = iResultFromServer.messages;
                              iLineToLoad.status = 'FAILED';
                            } else{
                              iCampo.valorOpcion = iResultFromServer.llaveTabla;
                            }
                            break;
                          }
                        }
                        break;
                      }
                    }
                  }
                }

                const index = fieldsToReview.indexOf(currentCampo);
                if (index !== -1) {
                  fieldsToReview.splice(index, 1);
                }
                this.procesarCamposProceso(
                  fieldsToReview,
                  template,
                  documentsToRefactor
                );
              }
            }, error:()=>{
              this.isProcessing.set(false);
            }
          });
      }
    } else {
      this.isLoading.set(false);
      // Validar que sean correctos
      const failedDocuments = documentsToRefactor.filter(x=> x.status ==='FAILED');
      if(failedDocuments && failedDocuments.length !==0){
        for (let i = 0; i < failedDocuments.length; i++) {
          const elementFailed = failedDocuments[i];
          documentsToRefactor.splice(documentsToRefactor.indexOf(elementFailed), 1);
          documentsToRefactor.unshift(elementFailed);
        }
        this.dataSource.set(new MatTableDataSource(this.documentosGenerados()));
        this.isValidate.set(false);
        this.lblTipoProceso.set(this.lblTipoProceso() + " SE ENCONTRARON ERRORES POR FAVOR CORRIJALOS Y VUELVA A ENVIAR LA CARGA")
      }else{
        if (
          !this.fieldIdInTemplateSecondary() ||
          template.llaveTabla !== this.plantilla()!.llaveTabla
        )
          this.isValidate.set(true);
      }


      this.cantidadProcesada = 1;
    }
  }

  //////////////////////////INICIA LA CARGA MASIVA//////////////////////
  startLoad() {
    this.inicio = new Date();
    this.isProcessing.set(true);
    this.procesarDocumentos();
  }

  procesarDocumentos() {
    if (this.cantidadProcesada < this.documentosGenerados().length + 1) {
      let detalle =
        'PROCESANDO DOCUMENTO # ' +
        (this.cantidadProcesada + this.failedDocuments().length).toString()
      ' INICIO : ' +
        this.inicio.toISOString() +
        ' HORA ACTUAL : ' +
        new Date().toISOString() +
        ' DURACION : ' +
        (new Date().getTime() - this.inicio.getTime()) / 1000 +
        'seg';
      let valorTexto = '';
      if (this.plantilla()) {
        this.currentPedido =
          this.documentosGenerados()[this.cantidadProcesada - 1].document;
        for (
          let index = 0;
          index < this.currentPedido.caracteristicas.length;
          index++
        ) {
          const iCampo = this.currentPedido.caracteristicas[index];
          valorTexto = iCampo.valorText == null ? '' : iCampo.valorText;
          detalle =
            detalle + '\n      ' + iCampo.campoDTO.nombre + ' : ' + valorTexto;
            if(iCampo.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.ARCHIVO){
              if(iCampo.valorText && iCampo.valorText ==='SIN CARGAR'){
                iCampo.valorText = null as unknown as string;
              }
              if(iCampo.valorText && this.files && !iCampo.valorText.startsWith('http')){
                for (let j = 0; j < this.files.length; j++) {
                  if(this.files[j].name === iCampo.valorText){
                    this.isProcessing.set(true);
                    this.uploadApi.subirArchivo(this.files[j]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                      next: (value) => {
                        iCampo.valorText = value.url;
                        this.procesarDocumentos();
                        this.isProcessing.set(false);
                      },
                      error: () => {
                        this.isProcessing.set(false);
                      }
                    });
                    return;
                  }
                }
              }
            }
        }
        this.isProcessing.set(true);

        // Obtener el tiempo de espera del formulario, o usar el valor predeterminado si no está definido
        const tiempoEspera = this.fTiempoEspera !== null ? this.fTiempoEspera : 0;

        if(tiempoEspera > 2){
          let timerInterval;
          this.notificationCenter.fire({
            title: "Esperando!",
            html: "Se guardara el siguiente registro en <b></b> milliseconds.",
            timer: tiempoEspera * 1000,
            timerProgressBar: true,
            position: "top-end",
            toast: true,
            didOpen: () => {
              this.notificationCenter.showLoading();
              const timer = this.notificationCenter.getPopup()!.querySelector("b");
              timerInterval = setInterval(() => {
                timer!.textContent = `${this.notificationCenter.getTimerLeft()}`;
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            }
          });
        }
        this.pendingSaveTimeout = setTimeout(() => {
          this.api
            .saveByMassive(this.currentPedido, Date.now().toString())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (value: PedidoVentaDTO) => {
                this.isProcessing.set(false);
                if (value) {
                  if (value.messages) {
                    this.documentosGenerados.update(docs => { docs[this.cantidadProcesada - 2].messages = value.messages; docs[this.cantidadProcesada - 2].status = 'FAILED'; return docs; });
                  } else {
                    this.documentosGenerados.update(docs => { docs[this.cantidadProcesada - 2].status = 'SAVE OK'; docs[this.cantidadProcesada - 2].documentId = value.llaveTabla; docs[this.cantidadProcesada - 2].documentName = value.nombre; return docs; });
                  }
                  this.procesaMultiple(
                    value,
                    (this.cantidadProcesada - 1).toString()
                  );
                  // this.procesarDocumentos();
                }
              },
              error: (err: any) => {
                this.isProcessing.set(false);
                if (err) {
                  const msg = new DocumentMessage();
                  msg.message = err;
                  this.documentosGenerados.update(docs => { docs[this.cantidadProcesada - 2].messages = [msg]; docs[this.cantidadProcesada - 2].status = 'FAILED'; return docs; });
                  this.failedDocuments.update(failed => [...failed, this.currentPedido]);
                  this.documentosGenerados.update(docs => docs.slice(1));
                  this.cantidadProcesada = this.cantidadProcesada - 1;
                  if(this.skipSelected){
                    this.procesarDocumentos();
                  }else{
                    this.notificationCenter.fire({
                      title: 'Se ha presentado un error, ' + err + ' continuamos?',
                      text: err,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Si, quiero continuar!',
                      cancelButtonText: 'No, Paremos',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        this.procesarDocumentos();
                      } else {
                        this.isProcessing.set(false);
                      }
                    });
                  }
                  
                  
                }
              },
            });
        }, tiempoEspera * 1000);
      }
      this.lblProcesar.set(detalle);
      this.cantidadProcesada++;
    } else {
      this.notificationCenter.fire('Carga masiva completa', '', 'success');
      this.isProcessing.set(false);
      this.isValidate.set(false);
    }
  }

  procesaMultiple(newDocument: PedidoVentaDTO, consecutive: string) {
    if (!this.documentosGeneradosMultiple() || this.documentosGeneradosMultiple().length === 0) {
      this.procesarDocumentos();
      return;
    }
    for (
      let index = 0;
      index < this.documentosGeneradosMultiple().length;
      index++
    ) {
      const element = this.documentosGeneradosMultiple()[index];
      for (let j = 0; j < element.document.caracteristicas.length; j++) {
        const fieldDoc = element.document.caracteristicas[j];
        if (fieldDoc.campo === this.fieldIdInTemplateSecondary()!.llaveTabla) {
          if (fieldDoc.valorText === consecutive) {
            fieldDoc.valorOpcion = newDocument.llaveTabla;
            this.isProcessing.set(true);
            this.api
              .saveByMassive(element.document, Date.now().toString())
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (resultDocument: PedidoVentaDTO) => {
                  this.isProcessing.set(false);
                  const indexList =
                    this.documentosGeneradosMultiple().indexOf(element);
                  if (indexList !== -1) {
                    if(resultDocument.messages){
                      this.documentosGeneradosMultiple.update(docs => { docs[indexList].messages = resultDocument.messages; return docs; });
                    } else{
                      this.documentosGeneradosMultiple.update(docs => { docs[indexList].status = 'SAVE OK'; return docs; });
                    }
                    this.documentosGeneradosMultiple.update(docs => docs.slice(0, indexList).concat(docs.slice(indexList + 1)));
                  }
                  this.procesaMultiple(newDocument, consecutive);
                },
                error: (err: any) => {
                  this.isProcessing.set(false);
                  if (err) {
                    this.notificationCenter.fire({
                      title: 'Se ha presentado un error, continuamos?',
                      text: err,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Si, quiero continuar!',
                      cancelButtonText: 'No, Paremos',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        const indexList =
                          this.documentosGeneradosMultiple().indexOf(element);
                        if (index !== -1) {
                            this.documentosGeneradosMultiple.update(docs => { docs[indexList].messages = err; docs[indexList].status = 'ERROR'; return docs; });

                          this.documentosGeneradosMultiple.update(docs => docs.slice(0, indexList).concat(docs.slice(indexList + 1)));
                        }
                        this.procesaMultiple(newDocument, consecutive);
                      }
                    });
                  }
                },
              });
            return;
          }
          break;
        }
      }
    }
    this.procesarDocumentos();
  }

  newMassiveLoad() {
    this.failedDocuments.set([]);

    this.lblCarga.set('');
    this.lblTipoProceso.set('');
    this.lblProcesar.set('');

    this.isLoading.set(false);
    this.isValidate.set(false);
    this.isProcessing.set(false);

    this.camposConsultar = [];

    this.dataSource.update(ds => { ds.data = []; return ds; });
    this.documentosGenerados.set([]);
    this.documentosGeneradosMultiple.set([]);

    this.inicialCamposConsultar = 0;
    this.isUpdate = false;

  }

  handleFileInputToLoadArchivo(files: FileList) {
    // En caso que no escoja nada
    if (files.length === 0) {
      return;
    }

    // Valido que todos los archivos se encuentren
    for (let j = 0; j < files.length; j++) {
      for (let i = 0; i <  this.documentosGenerados().length; i++) {
        const pDocumento = this.documentosGenerados()[i].document;
        for (let b = 0; b < pDocumento.caracteristicas.length; b++) {
          const iCampo = pDocumento.caracteristicas[b];
          if (iCampo.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.ARCHIVO) {
            if (iCampo.valorOpcion === files[j].name){
              iCampo.valorText = files[j].name;
              break;
            }
          }
        }
      }
    }

    for (let i = 0; i <  this.documentosGenerados().length; i++) {
      const pDocumento = this.documentosGenerados()[i].document;
      for (let b = 0; b < pDocumento.caracteristicas.length; b++) {
        const iCampo = pDocumento.caracteristicas[b];
        if (iCampo.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.ARCHIVO) {
          if (iCampo.valorText ===  'SIN CARGAR'){
            this.notificationCenter.fire(
              'Unsupported',
              'Existen campos que no cargaron imagenes'
            );
            return;
          }
        }
      }
    }

    this.files = files;
  }

}
