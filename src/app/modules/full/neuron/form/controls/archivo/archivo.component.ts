import { Component, OnInit, ViewChild } from '@angular/core';
import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-archivo',
  templateUrl: './archivo.component.html'
})
export class ArchivoComponent extends BaseComponent implements OnInit {
  @ViewChild(SignaturePadComponent) signaturePad: SignaturePadComponent;

  static SEPARADOR = ';;';

  multipleFiles = false;
  validateOrientation: string;
  firma = false;
  maximoSize: number;
  source: string;
  filtroExtension: string;
  isEnd = false;
  files = [];

  // PreviewImage
  selectedFiles: FileList;
  currentIndex: number;

  //load url
  allowUrlTextFromUser = false;
  isLoadingUrl = false;
  urlText = '';

  constructor(private api: ApiService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.isEnabled && !this.formIsEnabled) {
      this.isEnabled = false;
    }
    this.multipleFiles =
      this.obtenerPropiedad(PlantillaHelper.MULTIPLE_FILE) != null;
    this.allowUrlTextFromUser =
      this.obtenerPropiedad(PlantillaHelper.ARCHIVO_URL_USUARIO) != null;
    this.firma = this.obtenerPropiedad(PlantillaHelper.ARCHIVO_FIRMA) != null;
    this.validateOrientation = this.obtenerValor(
      PlantillaHelper.VALIDATE_ORIENTATION
    );
    this.maximoSize = Number(
      this.obtenerValor(PlantillaHelper.ARCHIVO_TAMANO_MAXIMO)
    );
    this.filtroExtension = this.obtenerValor(PlantillaHelper.ARCHIVO_TIPO);
    if (!this.isEmpty(this.filtroExtension)) {
      const extensiones = this.filtroExtension.split(',');
      let extensionFilter = '';
      for (let i = 0; i < extensiones.length; i++) {
        const extension = extensiones[i];
        if(extension.indexOf("*") < 0) {extensionFilter + '.' ; }
        extensionFilter = extensionFilter + extension + ',';
      }
      this.filtroExtension = extensionFilter;
    } else {
      this.filtroExtension = '.pdf,.png,.jpg,jpeg';
    }
    if (this.maximoSize === 0) {
      this.maximoSize = 1024;
    }
    this.source = this.data.valorText;
    this.actualizarVista();
  }

  handleFileInput(files: FileList) {
    // En caso que no escoja nada
    if (files.length === 0) {
      return;
    }

    if (this.maximoSize) {
      for (let j = 0; j < files.length; j++) {
        const iFile: File = files.item(j);
        if (iFile.size / 1024 > this.maximoSize) {
          Swal.fire(
            'Espacio maximo superado.',
            iFile.name + '.  ' + this.maximoSize + 'KB. - ' + iFile.size / 1024,
            'error'
          );
          return;
        }
      }
    }
    this.selectedFiles = files;
    this.currentIndex = 0;
    if (!this.multipleFiles && this.files.length !== 0) {
      this.deleteFile(this.files[0]);
    }
    this.sincronizeFiles();
  }

  validateOrientationHandler(image, item) {
    if (this.validateOrientation && this.isEnabled) {
      if (this.validateOrientation === '1') {
        if (image.width < image.height) {
          Swal.fire(
            'Orientacion Horizontal',
            'El ancho de la imagen es menor al alto. ' +
              image.width +
              'x' +
              image.height,
            'error'
          );
          this.deleteFile(item);
          return;
          // this.remove2ValidateOrientation(image.name);
        }
      } else {
        if (image.width > image.height) {
          Swal.fire(
            'Orientacion Vertical',
            'El alto de la imagen es menor al ancho. ' +
              image.width +
              'x' +
              image.height,
            'error'
          );
          this.deleteFile(item);
          return;
          // this.remove2ValidateOrientation(image.name);
        }
      }
    }
    this.uploadFileToActivity(item);
  }

  remove2ValidateOrientation(pName: string) {
    if (!this.files || this.files.length === 0) {
      return;
    }
    for (let i = 0; i < this.files.length; i++) {
      const element = this.files[i];
      if (element.url === pName) {
        this.deleteFile(element);
        break;
      }
    }
  }

  sincronizeFiles() {
    if (!this.selectedFiles || this.selectedFiles.length <= this.currentIndex) {
      return;
    }
    const iFile: File = this.selectedFiles.item(this.currentIndex);
    this.currentIndex = this.currentIndex + 1;
    if (iFile.type.match(/image\/*/)) {
      var reader = new FileReader();
      reader.readAsDataURL(iFile);
      reader.onload = (_event) => {
        this.addFileToTable(iFile.name, reader.result, iFile);
      };
    } else {
      this.uploadFileToActivity(this.addFileToTable(iFile.name, null, iFile));
    }
    this.sincronizeFiles();
  }

  addFileToTable(pName: string, pBlob, pFile): any {
    if (!this.files) {
      this.files = [];
    }
    const item = {
      url: pName,
      index: this.files.length + 1,
      file: pFile,
      blob: pBlob,
      isLoading: true,
    };
    this.files.push(item);
    if (!this.multipleFiles) {
      this.isEnd = true;
    }
    return item;
  }

  hasPendingLoadFiles(): boolean {
    if (this.files && this.files.length !== 0) {
      for (let j = 0; j < this.files.length; j++) {
        const iFile = this.files[j];
        if (iFile.isLoading) {
          return true;
        }
      }
    }
    return false;
  }

  uploadFileToActivity(fileToUpload: any) {
    if (fileToUpload.isLoading) {
      let internalFile = fileToUpload.file;
      if (!internalFile && fileToUpload.blob) {
        internalFile = this.b64toFile(fileToUpload.blob);
      }
      this.api.uploadFile(internalFile, this.urlServer).subscribe(
        (data) => {
          const returnedData = data.message;
          if (!this.source) {
            this.source = returnedData;
          } else {
            // Sucede que llegaba y como era lenta la carga entonces se duplicaban
            if(this.multipleFiles){
              this.source = this.source + ArchivoComponent.SEPARADOR + returnedData;
            } else {
              this.source = returnedData;
            }
          }
          fileToUpload.isLoading = false;
          fileToUpload.url = returnedData;
          this.actualizar();
          // this.currentIndex = this.currentIndex + 1;
          // this.uploadFileToActivity();
        },
        (error) => {
          this.isLoading = false;
          this.files[this.currentIndex].message = error;
          alert(error);
        }
      );
    }
  }

  actualizar() {
    if (this.source != null) {
      if (
        this.source.length > 2 &&
        this.source.substr(this.source.length - 2) ===
          ArchivoComponent.SEPARADOR
      ) {
        this.source = this.source.substr(0, this.source.length - 2);
      }
      if (this.source === '') {
        this.source = null;
      }
    }
    if (this.data.valorText !== this.source) {
      this.data.valorText = this.source;
      this.avisarModificacion();
      // this.actualizarVista();
    }
  }

  actualizarVista() {
    this.files = [];
    this.isEnd = false;
    if (this.source) {
      const items: string[] = this.source.split(ArchivoComponent.SEPARADOR);
      for (let i = 0; i < items.length; i++) {
        const iSource = items[i];
        if (iSource) {
          this.files.push({
            url: iSource,
            index: i + 1,
            file: null,
            isLoading: false,
          });
        }
      }
      if (!this.multipleFiles) {
        this.isEnd = true;
      }
    }
  }

  openImage(item: any) {
    if (item.blob) {
      return;
    }
    window.open(item.url, '_blank');
  }

  deleteFile(item: any) {
    const index: number = this.files.indexOf(item);
    if (index !== -1) {
      this.files.splice(index, 1);
    }
    if (!item.isLoading) {
      const _url = item.url;
      if (this.source) {
        this.source = this.source.replace(
          _url + ArchivoComponent.SEPARADOR,
          ''
        );
        this.source = this.source.replace(_url, '');
      }
      this.actualizar();
    }
    this.isEnd = false;
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  takeSignature() {
    this.addFileToTable('Signature', this.signaturePad.toDataURL(), null);
    this.clearSignature();
    // this.addFileToTable('Signature' , this.b64toFile(this.signaturePad.toDataURL()));
    // this.uploadFileToActivity(this.b64toFile(this.signaturePad.toDataURL()));
  }

  b64toFile(dataURI): File {
    // convert the data URL to a byte string
    const byteString = atob(dataURI.split(',')[1]);

    // pull out the mime type from the data URL
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // Convert to byte array
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create a blob that looks like a file.
    const blob = new Blob([ab], { type: mimeString });
    blob['lastModifiedDate'] = new Date().toISOString();
    blob['name'] = 'file';

    // Figure out what extension the file should have
    switch (blob.type) {
      case 'image/jpeg':
        blob['name'] += '.jpg';
        break;
      case 'image/png':
        blob['name'] += '.png';
        break;
    }
    // cast to a File
    return <File>blob;
  }

  send2Server(): boolean {
    if (this.hasPendingLoadFiles()) {
      Swal.fire(
        'Carga de imagenes',
        'Todavia tienes imagenes pendientes por cargar, danos un minuto mas',
        'info'
      );
      return false;
    }
    return true;
  }

  onClickExternal() {
    document.getElementById(this.structure.llaveTabla + '_file').click();
  }

  onClickLoadUrl(){
    if (this.isLoadingUrl) {
     this.source = this.urlText;
     this.actualizarVista();
     this.actualizar();
    }
    this.isLoading =  !this.isLoadingUrl;
    this.isLoadingUrl = !this.isLoadingUrl;
  }

  isImage(url) {
    if(!url) {return false;}
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase());
  }
  
}
