import { Component, OnInit } from '@angular/core';
import {
  DocumentMessage,
  DocumentoPlantillaCaracteristicaDTO,
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import {
  getFieldFromTemplate,
  getXMLBase,
  procesarXMLBase,
} from './massive-helper';
import { saveAs } from 'file-saver';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { PropiedadDTO } from 'app/shared/shared.domain';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LoadLineDTO } from './massive.domain';

@Component({
  selector: 'app-massive',
  templateUrl: './massive.component.html',
})
export class MassiveComponent implements OnInit {
  plantillaId: string;
  urlServer: string;

  plantilla: DocumentoPlantillaDTO; // Estructura base de la lista

  canMassive = false;
  failedDocuments = [];
  inicio: Date;
  cantidadProcesada: number;

  lblCarga = '';
  lblTipoProceso: string;
  lblProcesar: string;

  isLoading = false;
  isValidate = false;
  isProcessing = false;

  camposConsultar: DocumentoPlantillaCaracteristicaDTO[];

  documentosGenerados: LoadLineDTO[];
  documentosGeneradosMultiple: LoadLineDTO[];
  inicialCamposConsultar = 0;

  currentPedido: PedidoVentaDTO;

  fieldIdInTemplateSecondary: DocumentoPlantillaCaracteristicaDTO;

  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];
  titleColumns: string[] = [];

  files: FileList;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private api: ApiService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.plantillaId = params.template;
      this.urlServer = params.server;
      if (this.plantillaId) {
        this.plantilla = this.templateService.getTemplate(
          this.plantillaId,
          this.urlServer
        );
        this.startForm();
      } else {
        this.router.navigate(['/main']);
      }
    });
    this.dialog.closeAll();
  }

  startForm() {
    if (!this.plantilla) {
      this.router.navigate(['/main']);
    } else {
      // Obtener Variables
      this.canMassive = !PlantillaHelper.isEmpty(
        this.plantilla.propiedades,
        PlantillaHelper.PERMISO_PLANTILLA_CARGA_MASIVA
      );
      if (!this.canMassive) {
        // this.closeMassiveForm();
      }
      this.validateCamposPlantilla(this.plantilla);

      const propertyLoadMassiveMultiple = PlantillaHelper.buscarPropiedad(
        this.plantilla.propiedades,
        PlantillaHelper.PLANTILLA_CARGA_MASIVA_MULTIPLE
      );

      if (propertyLoadMassiveMultiple) {
        const fieldMultiple: DocumentoPlantillaCaracteristicaDTO =
          getFieldFromTemplate(
            this.plantilla,
            propertyLoadMassiveMultiple.valor
          );
        const crudProperty: string = PlantillaHelper.buscarValor(
          fieldMultiple.propiedades,
          PlantillaHelper.PROCESO_ACCIONES
        );

        if (!crudProperty) {
          Swal.fire(
            'Unsupported',
            'No encotramos la propiedad CRUD del campo ' + fieldMultiple.nombre
          );
          return;
        }

        const template: DocumentoPlantillaDTO =
          this.templateService.getTemplate(crudProperty, null);

        if (!template.caracteristicas) {
          this.isProcessing = true;
          this.api.obtenerCampos(crudProperty, template.server).subscribe({
            next: (plantilla: DocumentoPlantillaDTO) => {
              this.isProcessing = false;
              this.loadFiledInMultipleTemplate(plantilla);
              this.templateService.getTemplate(
                plantilla.llaveTabla,
                plantilla.server
              ).caracteristicas = plantilla.caracteristicas;
            },
            error: () => {
              this.isProcessing = false;
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
      );
      if (dbProperty) {
        for (let j = 0; j < dbProperty.length; j++) {
          const elementProperty = dbProperty[j];
          if (elementProperty.valor === this.plantilla.llaveTabla) {
            this.fieldIdInTemplateSecondary = element;
            return;
          }
        }
      }
    }
    if (!this.fieldIdInTemplateSecondary) {
      Swal.fire(
        'Unsupported',
        'En la plantilla ' +
        template.nombre +
        ' no encontramos ningun campo con fuente de datos ' +
        this.plantilla.nombre
      );
    }
  }

  /////////////// DESCARGAR ARCHIVO BASE ///////////////////////////
  downloadBase(type: string) {
    if (!this.plantilla) {
    } else {
      if (!this.validateCamposPlantilla(this.plantilla)) {
        return;
      }
      if (type === 'xml') {
        const blob = new Blob([this.generateXMLBase()], {
          type: 'text/plain;charset=utf-8',
        });
        saveAs(blob, this.plantilla.nombre + '.xml');
      } else {
        const blob = new Blob([this.generateXMLBaseExcel()], {
          type: 'text/csv;charset=utf-8;',
        });
        saveAs(blob, this.plantilla.nombre + '.csv');
      }
    }
  }

  validateCamposPlantilla(template: DocumentoPlantillaDTO): boolean {
    if (template.caracteristicas === null) {
      Swal.fire(
        '',
        'Revisa porque no tienes caracteristicas de la plantilla ' +
        template.nombre,
        'warning'
      );
    }
    return true;
  }

  generateXMLBase(): string {
    this.lblCarga = 'GENERANDO  XML';
    this.isLoading = true;
    try {
      let xmlBase = '<root>';
      const nombre = this.formatStringXML(this.plantilla.codigo);
      for (let index = 1; index <= 2; index++) {
        xmlBase = xmlBase + '<' + nombre + '>';
        for (let i = 0; i < this.plantilla.caracteristicas.length; i++) {
          const iCampo = this.plantilla.caracteristicas[i];
          if(iCampo.formato!==DocumentoPlantillaCaracteristicaEnum.SECCION){
            const campoNombre: string = this.formatStringXML(iCampo.nombre);
            xmlBase = xmlBase + '<' + campoNombre + '>';
            xmlBase = xmlBase + getXMLBase(iCampo);
            xmlBase = xmlBase + '</' + campoNombre + '>';
          }
        }
        xmlBase = xmlBase + '</' + nombre + '>';
      }
      xmlBase = xmlBase + '</root>';
      this.isLoading = false;
      return xmlBase.toString();
    } catch (error) {
      Swal.fire('', error.message, 'error');
      this.isLoading = false;
    }
    return null;
  }

  generateXMLBaseExcel(): string {
    this.lblCarga = 'GENERANDO  EXCEL';
    this.isLoading = true;
    try {
      let xmlBase = '';
      for (let iCampo of this.plantilla.caracteristicas) {
        const campoNombre: string = this.formatStringXML(iCampo.nombre);
        xmlBase = xmlBase + campoNombre + ';';
      }
      this.isLoading = false;
      return xmlBase.toString();
    } catch (error) {
      Swal.fire('', error.message, 'error');
      this.isLoading = false;
    }
    return null;
  }

  formatStringXML(texto: string): string {
    if (!texto) {
      return 'EMPTY';
    }
    texto = texto.replace(new RegExp(' ', 'g'), '_');
    texto = texto.replace('Ñ', 'N');
    texto = texto.trim();
    return texto;
  }

  /////////////CARGAR MULTIPLE///////////////////////////////////

  handleFileInputMultiple(files: FileList) {
    if (!this.fieldIdInTemplateSecondary) {
      Swal.fire(
        'Unsupported',
        'No encontramos la propiedad carga masiva plantilla multiple '
      );
      return;
    }
    const template = this.templateService.getTemplate(
      this.fieldIdInTemplateSecondary.plantilla,
      null
    );
    this.validateCamposPlantilla(template);
    for (let i = 0; i < files.length; i++) {
      this.lblCarga = 'CARGANDO XML MULTIPLE ' + '<--' + this.lblCarga;
      const reader = new FileReader();
      reader.onload = () => {
        this.onDataLoaded(reader.result.toString(), template, 1);
      };
      reader.readAsText(files[i]);
    }
  }

  ///////////////////// CARGAR /////////////////////////////////

  handleFileInput(files: FileList) {
    if (this.plantilla) {
      if (!this.validateCamposPlantilla(this.plantilla)) {
        return;
      }
    } else {
      Swal.fire('Carga plantilla',
        'No encontramos la informacion de la plantilla',
        'info'
      );
    }
    for (let i = 0; i < files.length; i++) {
      this.lblCarga = 'CARGANDO XML' + ' <-- ' + this.lblCarga;
      const reader = new FileReader();
      const fileUpload = files[i];
      if (fileUpload.name.endsWith('.xml')) {
        reader.onload = () => {
          this.onDataLoaded(reader.result.toString(), this.plantilla, 1);
        };
        reader.readAsText(fileUpload);
      } else {
        reader.onload = (e: any) => {
          this.onDataLoaded(e.target.result, this.plantilla, 2);
        };
        reader.readAsBinaryString(fileUpload);
      }
    }
  }

  generateColumnNames(template:DocumentoPlantillaDTO){
    this.titleColumns = [];
    this.displayedColumns = ['orderNumber'];
    this.displayedColumns.push('status');
    this.displayedColumns.push('messages');
    for (let k = 0; k < template.caracteristicas.length; k++) {
      const iCampo = template.caracteristicas[k];
      this.displayedColumns.push(iCampo.nombre);
      this.titleColumns.push(iCampo.nombre);
    }
    
  }

  onDataLoaded(_file: string, template: DocumentoPlantillaDTO, format: number) {
    let documentos;
    let encabezado = 0;
    if (format === 2) {
      const wb: XLSX.WorkBook = XLSX.read(_file, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      documentos = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, dateNF: 'number' });
      encabezado = 1;
    } else {
      if (!window.DOMParser) {
        Swal.fire('Unsupported', 'Intente en explorador chrome');
        return;
      }

      const parser = new DOMParser();
      const xml = parser.parseFromString(_file, 'text/xml');

      if (template) {
        documentos = xml.getElementsByTagName(
          this.formatStringXML(template.codigo)
        );
      }
    }

    if (documentos.length > 20000) {
      Swal.fire(
        'Cantidad maxima',
        'El maximo de documentos a cargar son 20000',
        'info'
      );
    } else {
      this.isValidate = false;
      this.failedDocuments = [];
      this.lblProcesar = '';

      this.camposConsultar = [];
      this.lblCarga =
        'CARGANDO ' +
        (documentos.length - encabezado).toString() +
        ' DOCUMENTOS ' +
        ' <-- ' +
        this.lblCarga;
      this.inicio = new Date();
      if (template.llaveTabla === this.plantilla.llaveTabla) {
        this.generateColumnNames(this.plantilla);
        this.documentosGenerados = this.generateVO(documentos, template);
        this.dataSource = new MatTableDataSource(this.documentosGenerados);
        if (!this.documentosGenerados || this.documentosGenerados.length === 0) {
          this.lblCarga = this.lblCarga + 'Revisa la carga debido a que no se generaron documentos';
          //Swal.fire('No documents', 'Revisa la carga debido a que no se generaron documentos', 'error');
          return;
        }
        this.inicio = new Date();
        this.cantidadProcesada = 1;
        this.inicialCamposConsultar = this.camposConsultar.length;
        this.procesarCamposProceso(
          this.camposConsultar,
          template,
          this.documentosGenerados
        );
      } else {
        this.documentosGeneradosMultiple = this.generateVO(
          documentos,
          template
        );
        if (!this.documentosGeneradosMultiple || this.documentosGeneradosMultiple.length === 0) {
          Swal.fire('No documents', 'Revisa la carga debido a que no se generaron documentos', 'error');
          return;
        }
        this.inicio = new Date();
        this.cantidadProcesada = 1;
        this.inicialCamposConsultar = this.camposConsultar.length;
        this.procesarCamposProceso(
          this.camposConsultar,
          template,
          this.documentosGeneradosMultiple
        );
      }
    }
  }

  generateVO(source, template: DocumentoPlantillaDTO): LoadLineDTO[] {
    if (!template || !template.caracteristicas) return;
    let documentosNewsFromXML: LoadLineDTO[] = [];
    let pedido: PedidoVentaDTO;
    let indexInicialProcesar = 0;
    let map = new Map();
    if (!(source instanceof HTMLCollection)) {
      indexInicialProcesar = 1;
    }
    for (let i = indexInicialProcesar; i < source.length; i++) {
      pedido = new PedidoVentaDTO();
      pedido.textoFiltro = (documentosNewsFromXML.length +1).toString();//Esto es para colocar una columna de cantidad
      pedido.imagen = template.imagen;
      pedido.plantilla = template.llaveTabla;
      pedido.caracteristicas = [];

      for (let k = 0; k < template.caracteristicas.length; k++) {
        const iCampo = template.caracteristicas[k];
        let campo: PedidoVentaCaracteristicaDTO =
          new PedidoVentaCaracteristicaDTO();
        campo.campo = iCampo.llaveTabla;
        campo.campoDTO = iCampo;

        if (source instanceof HTMLCollection) {
          const camposTexto = source[i].children;
          for (let j = 0; j < camposTexto.length; j++) {
            const nombreCampoXML = this.formatStringXML(
              camposTexto[j].localName
            );
            if (this.formatStringXML(iCampo.nombre) === nombreCampoXML) {
              campo.valorText = camposTexto[j].textContent;
              if(campo.valorText) {campo.valorText = campo.valorText.trim();}
              campo = procesarXMLBase(campo);
              break;
            }
          }
        } else {
          for (let j = 0; j < source[i].length; j++) {
            const nombreCampoXML = this.formatStringXML(source[0][j]);
            if (this.formatStringXML(iCampo.nombre) === nombreCampoXML) {
              if (source[i][j] || source[i][j]===0) { 
                campo.valorText = source[i][j].toString(); 
                if(campo.valorText) {campo.valorText = campo.valorText.trim();}
              }
              campo = procesarXMLBase(campo);
              break;
            }
          }
        }

        if (!campo) {
          this.mensajeValidacion(pedido, i);
          this.isLoading = false;
          return;
        }

        if (
          campo.campoDTO.formato ===
          DocumentoPlantillaCaracteristicaEnum.PROCESO &&
          !campo.valorOpcion &&
          !PlantillaHelper.buscarValor(campo.campoDTO.propiedades, PlantillaHelper.DEPENDE) &&
          campo.valorText
        ) {
          this.acumularProcesosConsulta(campo.campoDTO, campo.valorText);
        }
        pedido.caracteristicas.push(campo);
      }
      const line = new LoadLineDTO();
      line.document = pedido;
      line.orderNumber = documentosNewsFromXML.length + 1;
      documentosNewsFromXML.push(line);
    }
    if (source instanceof HTMLCollection) {
      const camposTexto = source[0].children;
      for (let j = 0; j < camposTexto.length; j++) {
        const nombreCampoXML = this.formatStringXML(
          camposTexto[j].localName
        );
        map.set(nombreCampoXML, true);
      }
    } else {
      for (let j = 0; j < source[0].length; j++) {
        const nombreCampoXML = this.formatStringXML(source[0][j]);
        map.set(nombreCampoXML, true);
      }
    }
    for (let k = 0; k < template.caracteristicas.length; k++) {
      const iCampo = template.caracteristicas[k];
      map.delete(this.formatStringXML(iCampo.nombre));
    }
    if (map.size > 0) {
      let camposSinValidar = '';
      for (let key of map.keys()) {
        if (!key.endsWith("_NUMID")) { camposSinValidar = key + ", " + camposSinValidar; }
      }
      if (camposSinValidar) Swal.fire("Atencion", "CIUDADO hay campos que no se tienen en cuenta. " + camposSinValidar, "warning");
    }
    return documentosNewsFromXML;
  }

  mensajeValidacion(pedido: PedidoVentaDTO, i: number) {
    let detalle =
      'VALIDANDO DOCUMENTO # ' +
      i +
      ' INICIO : ' +
      this.inicio.toISOString() +
      ' HORA ACTUAL : ' +
      new Date().toISOString() +
      ' DURACION : ' +
      (new Date().getTime() - this.inicio.getTime()) / 1000 +
      'seg';
    if (pedido != null) {
      let valorTexto = '';
      for (let k = 0; k < pedido.caracteristicas.length; k++) {
        const iCampoPedido = pedido.caracteristicas[k];
        valorTexto =
          iCampoPedido.valorText == null ? '' : iCampoPedido.valorText;
        detalle =
          detalle +
          '<br/>      ' +
          iCampoPedido.campoDTO.nombre +
          ' : ' +
          valorTexto;
      }
    }
    this.lblCarga = detalle;
  }

  acumularProcesosConsulta(
    campo: DocumentoPlantillaCaracteristicaDTO,
    id: string
  ) {
    if (
      this.fieldIdInTemplateSecondary &&
      this.fieldIdInTemplateSecondary.llaveTabla === campo.llaveTabla
    )
      return;
    if (!campo || !campo.llaveTabla) {
      Swal.fire('', 'No se puede acumular un proceso sin campo', 'info');
      return;
    }
    if (!id) {
      Swal.fire('', 'No se puede acumular un proceso sin id', 'info');
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
        this.lblTipoProceso = detalle;
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
        this.isProcessing = true;
        this.api
          .validarTipoProcesoCarga(currentCampo, template.server)
          .subscribe({
            next:(value: DocumentoPlantillaCaracteristicaDTO)=>{
              this.isProcessing = false;
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
              this.isProcessing = false;
            }
          });
      }
    } else {
      this.isLoading = false;
      // Validar que sean correctos
      const failedDocuments = documentsToRefactor.filter(x=> x.status ==='FAILED');
      if(failedDocuments && failedDocuments.length !==0){
        for (let i = 0; i < failedDocuments.length; i++) {
          const elementFailed = failedDocuments[i];
          documentsToRefactor.splice(documentsToRefactor.indexOf(elementFailed), 1);
          documentsToRefactor.unshift(elementFailed);
        }
        this.dataSource = new MatTableDataSource(this.documentosGenerados);
        this.isValidate = false;
        this.lblTipoProceso = this.lblTipoProceso + " SE ENCONTRARON ERRORES POR FAVOR CORRIJALOS Y VUELVA A ENVIAR LA CARGA"
      }else{
        if (
          !this.fieldIdInTemplateSecondary ||
          template.llaveTabla !== this.plantilla.llaveTabla
        )
          this.isValidate = true;
      }
      
      
      this.cantidadProcesada = 1;
    }
  }

  //////////////////////////INICIA LA CARGA MASIVA//////////////////////
  startLoad() {
    this.inicio = new Date();
    this.isProcessing = true;
    this.procesarDocumentos();
  }

  procesarDocumentos() {
    if (this.cantidadProcesada < this.documentosGenerados.length + 1) {
      let detalle =
        'PROCESANDO DOCUMENTO # ' +
        (this.cantidadProcesada + this.failedDocuments.length).toString()
      ' INICIO : ' +
        this.inicio.toISOString() +
        ' HORA ACTUAL : ' +
        new Date().toISOString() +
        ' DURACION : ' +
        (new Date().getTime() - this.inicio.getTime()) / 1000 +
        'seg';
      let valorTexto = '';
      if (this.plantilla) {
        this.currentPedido =
          this.documentosGenerados[this.cantidadProcesada - 1].document;
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
              if(iCampo.valorText && !iCampo.valorText.startsWith('http')){
                for (let j = 0; j < this.files.length; j++) {
                  if(this.files[j].name === iCampo.valorText){
                    this.isProcessing = true;
                    this.api.uploadFile(this.files[j], this.urlServer).subscribe({
                      next: (value) => {
                        iCampo.valorText = value.message;
                        this.procesarDocumentos();
                        this.isProcessing = false;
                      },
                      error: (err: any) => {
                        console.log(err);
                        this.isProcessing = false;
                      }
                    });
                    return;
                  }
                }
              }
            }
        }
        this.isProcessing = true;
        this.api
          .guardarDocumento(this.currentPedido, this.plantilla.server, Date.now().toString())
          .subscribe({
            next: (value: PedidoVentaDTO) => {
              this.isProcessing = false;
              if (value) {
                if(value.messages){
                  this.documentosGenerados[this.cantidadProcesada - 2].messages = value.messages;
                  this.documentosGenerados[this.cantidadProcesada - 2].status = 'FAILED';
                } else{
                  this.documentosGenerados[this.cantidadProcesada - 2].status = 'SAVE OK';
                  this.documentosGenerados[this.cantidadProcesada - 2].documentId = value.llaveTabla;
                  this.documentosGenerados[this.cantidadProcesada - 2].documentName = value.nombre;
                }
                this.procesaMultiple(
                  value,
                  (this.cantidadProcesada - 1).toString()
                );
                // this.procesarDocumentos();
              }
            },
            error: (err: any) => {
              this.isProcessing = false;
              if (err) {
                const msg = new DocumentMessage();
                msg.message = err;
                this.documentosGenerados[this.cantidadProcesada - 2].messages = [msg];
                this.documentosGenerados[this.cantidadProcesada - 2].status = 'FAILED';
                this.failedDocuments.push(this.currentPedido);
                this.documentosGenerados.splice(0, 1);
                this.cantidadProcesada = this.cantidadProcesada - 1;
                Swal.fire({
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
                    this.isProcessing = false;
                  }
                });
              }
            },
          });
      }
      this.lblProcesar = detalle;
      this.cantidadProcesada++;
    } else {
      Swal.fire('Carga masiva completa', '', 'success');
      this.isProcessing = false;
      this.isValidate = false;
    }
  }

  procesaMultiple(newDocument: PedidoVentaDTO, consecutive: string) {
    if (!this.documentosGeneradosMultiple) {
      this.procesarDocumentos();
      return;
    }
    for (
      let index = 0;
      index < this.documentosGeneradosMultiple.length;
      index++
    ) {
      const element = this.documentosGeneradosMultiple[index];
      for (let j = 0; j < element.document.caracteristicas.length; j++) {
        const fieldDoc = element.document.caracteristicas[j];
        if (fieldDoc.campo === this.fieldIdInTemplateSecondary.llaveTabla) {
          if (fieldDoc.valorText === consecutive) {
            fieldDoc.valorOpcion = newDocument.llaveTabla;
            this.isProcessing = true;
            this.api
              .guardarDocumento(element.document, this.plantilla.server, Date.now().toString())
              .subscribe({
                next: (resultDocument: PedidoVentaDTO) => {
                  this.isProcessing = false;
                  const indexList =
                    this.documentosGeneradosMultiple.indexOf(element);
                  if (indexList !== -1) {
                    if(resultDocument.messages){
                      this.documentosGeneradosMultiple[indexList].messages = resultDocument.messages;
                    } else{
                      this.documentosGeneradosMultiple[indexList].status = 'SAVE OK';
                    }
                    this.documentosGeneradosMultiple.splice(indexList, 1);
                  }
                  this.procesaMultiple(newDocument, consecutive);
                },
                error: (err: any) => {
                  this.isProcessing = false;
                  if (err) {
                    Swal.fire({
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
                          this.documentosGeneradosMultiple.indexOf(element);
                        if (index !== -1) {
                            this.documentosGeneradosMultiple[indexList].messages = err;
                            this.documentosGeneradosMultiple[indexList].status = 'ERROR';
                          
                          this.documentosGeneradosMultiple.splice(indexList, 1);
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
    this.failedDocuments = [];

    this.lblCarga = '';
    this.lblTipoProceso = '';
    this.lblProcesar = '';

    this.isLoading = false;
    this.isValidate = false;
    this.isProcessing = false;

    this.camposConsultar = [];

    this.dataSource.data = [];
    this.documentosGenerados = undefined;
    this.documentosGeneradosMultiple = undefined;

    this.inicialCamposConsultar = 0;

  }

  handleFileInputToLoadArchivo(files: FileList) {
    // En caso que no escoja nada
    if (files.length === 0) {
      return;
    }

    // Valido que todos los archivos se encuentren
    for (let j = 0; j < files.length; j++) {
      for (let i = 0; i <  this.documentosGenerados.length; i++) {
        const pDocumento = this.documentosGenerados[i].document;
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

    for (let i = 0; i <  this.documentosGenerados.length; i++) {
      const pDocumento = this.documentosGenerados[i].document;
      for (let b = 0; b < pDocumento.caracteristicas.length; b++) {
        const iCampo = pDocumento.caracteristicas[b];
        if (iCampo.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.ARCHIVO) {
          if (iCampo.valorText ===  'SIN CARGAR'){
            Swal.fire(
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
