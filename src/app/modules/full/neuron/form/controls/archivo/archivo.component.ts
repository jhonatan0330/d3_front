import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ChangeDetectionStrategy, inject, viewChild, signal, effect } from '@angular/core';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';
import { BaseComponent } from '../base/base.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import SignaturePad from 'signature_pad';
import { LocalStoreService } from 'app/shared/local-store.service';
import { formatImageUrl } from 'app/shared/local-image';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { ImageFormatPipe } from '../../../../../../shared/local-image';

@Component({
    selector: 'app-archivo',
    templateUrl: './archivo.component.html',
    styles: [`
    canvas {
      touch-action: none; /* evita scroll en móviles */
    }
  `],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule,MatIcon,TitleCasePipe,ImageFormatPipe]
})
export class ArchivoComponent extends BaseComponent implements OnInit {
  private api = inject(ApiService);
  private imageCompress = inject(NgxImageCompressService);
  private ls = inject(LocalStoreService);

  readonly signatureCanvas = viewChild<ElementRef<HTMLCanvasElement>>('signatureCanvas');
  signaturePad?: SignaturePad;

  static SEPARADOR = ';;';

  multipleFiles = signal(false);
  validateOrientation: string;
  firma = signal(false);
  maximoSize: number;
  porcentajeCalidad: number | undefined;
  source = signal<string | null>(null);
  filtroExtension = signal('');
  isEnd = signal(false);
  files = signal<any[]>([]);

  // PreviewImage
  selectedFiles: FileList;
  currentIndex: number;

  //load url
  allowUrlTextFromUser = signal(false);
  isLoadingUrl = signal(false);
  urlText = '';

  constructor() {
    super();
    effect(() => {
        const canvas = this.signatureCanvas();

        if (!canvas || this.signaturePad) {
            return;
        }

        this.signaturePad = new SignaturePad(canvas.nativeElement);
        this.resizeCanvas();
    });
  }
  ngOnInit(): void {
    super.ngOnInit();

    if (this.isEnabled && !this.formIsEnabled) {
      this.isEnabled = false;
    }
    this.multipleFiles.set(
      this.obtenerPropiedad(PlantillaHelper.MULTIPLE_FILE) != null);
    this.allowUrlTextFromUser.set(
      this.obtenerPropiedad(PlantillaHelper.ARCHIVO_URL_USUARIO) != null);
    this.firma.set(this.obtenerPropiedad(PlantillaHelper.ARCHIVO_FIRMA) != null);
    this.validateOrientation = this.obtenerValor(
      PlantillaHelper.VALIDATE_ORIENTATION
    );
    this.maximoSize = Number(
      this.obtenerValor(PlantillaHelper.ARCHIVO_TAMANO_MAXIMO)
    );
    this.porcentajeCalidad = Number(
      this.obtenerValor(PlantillaHelper.PORCENTAJE_CALIDAD)
    );
    if (this.porcentajeCalidad && this.porcentajeCalidad > 100) {
      this.porcentajeCalidad = undefined;
    }
    this.filtroExtension.set(this.obtenerValor(PlantillaHelper.ARCHIVO_TIPO));
    if (!this.isEmpty(this.filtroExtension())) {
      const extensiones = this.filtroExtension().split(',');
      let extensionFilter = '';
      for (let i = 0; i < extensiones.length; i++) {
        const extension = extensiones[i];
        if (extension.indexOf("*") < 0) { extensionFilter + '.'; }
        extensionFilter = extensionFilter + extension + ',';
      }
      this.filtroExtension.set(extensionFilter);
    } else {
      this.filtroExtension.set('.pdf,.png,.jpg,.jpeg');
    }
    if (this.maximoSize === 0) {
      this.maximoSize = 1024;
    }
    this.source.set(this.data.valorText);
    const defaultValue = this.obtenerPropiedad(PlantillaHelper.DEFAULT);
    if (defaultValue && !this.data.principal && !this.data.valorText) {
      this.source.set(defaultValue.valor);
      this.data.valorText = defaultValue.valor;
    }
    this.actualizarVista();
  }


  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
  }

resizeCanvas(): void {
    const signatureCanvas = this.signatureCanvas();

    if (!signatureCanvas) {
        return;
    }

    const canvas = signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;

    canvas.getContext('2d')?.scale(ratio, ratio);
}

  handleFileInput(files: FileList) {
    // En caso que no escoja nada
    if (files.length === 0) {
      return;
    }

    if (this.maximoSize) {
      for (let j = 0; j < files.length; j++) {
        const iFile: File = files.item(j)!;
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
    if (!this.multipleFiles() && this.files().length !== 0) {
      this.deleteFile(this.files()[0]);
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
    if (this.files().length === 0) {
      return;
    }
    for (let i = 0; i < this.files().length; i++) {
      const element = this.files()[i];
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
    const iFile: File = this.selectedFiles.item(this.currentIndex)!;
    this.currentIndex = this.currentIndex + 1;
    if (iFile.type.match(/image\/*/)) {
      const reader = new FileReader();
      reader.readAsDataURL(iFile);
      reader.onload = (_event) => {
        if (this.porcentajeCalidad) {
          this.compressFile(reader.result, iFile.name);
        } else {
          this.addFileToTable(iFile.name, reader.result, iFile);
        }
      };
    } else {
      this.uploadFileToActivity(this.addFileToTable(iFile.name, null, iFile));
    }
    this.sincronizeFiles();
  }

  compressFile(image, fileName) {
    const orientation = -1;
    console.warn('Size in bytes is now:', this.imageCompress.byteCount(image) / (1024 * 1024));
    this.imageCompress.compressFile(image, orientation, this.porcentajeCalidad, this.porcentajeCalidad).then(
      result => {
        console.warn('Size in bytes after compression:', this.imageCompress.byteCount(result) / (1024 * 1024));
        // call method that creates a blob from dataUri
        //const imageBlob = this.dataURItoBlob(result);
        //imageFile created below is the new compressed file which can be send to API in form data
        //const imageFile = new File([result], fileName, { type: imageBlob.type });
        this.addFileToTable(fileName, result, null);
      });
  }

  //Esto es casi lo mismo que b64toFile
  dataURItoBlob(dataURI) {
    // convert the data URL to a byte string
    const byteString = window.atob(dataURI.split(',')[1]);

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
    return blob;
  }


  addFileToTable(pName: string, pBlob, pFile): any {
    const item = {
      url: pName,
      index: this.files().length + 1,
      file: pFile,
      blob: pBlob,
      isLoading: true,
    };
    this.files.update(f => [...f, item]);
    if (!this.multipleFiles()) {
      this.isEnd.set(true);
    }
    return item;
  }

  hasPendingLoadFiles(): boolean {
    if (this.files().length !== 0) {
      for (let j = 0; j < this.files().length; j++) {
        const iFile = this.files()[j];
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
          if (!this.source()) {
            this.source.set(returnedData);
          } else {
            // Sucede que llegaba y como era lenta la carga entonces se duplicaban
            if (this.multipleFiles()) {
              this.source.set(this.source() + ArchivoComponent.SEPARADOR + returnedData);
            } else {
              this.source.set(returnedData);
            }
          }
          fileToUpload.isLoading = false;
          fileToUpload.url = returnedData;
          this.actualizar();
          // this.currentIndex = this.currentIndex + 1;
          // this.uploadFileToActivity();
        },
        (error) => {
          this.isLoading.set(false);
          this.files()[this.currentIndex].message = error;
          alert(error);
        }
      );
    }
  }

  actualizar() {
    const _source = this.source();
    if (_source != null) {
      let nuevoValor: string | null = _source;
      if (
        nuevoValor.length > 2 &&
        nuevoValor.substr(nuevoValor.length - 2) ===
        ArchivoComponent.SEPARADOR
      ) {
        nuevoValor = nuevoValor.substr(0, nuevoValor.length - 2);
      }
      if (nuevoValor === '') {
        nuevoValor = null;
      }
      this.source.set(nuevoValor);
    }
    if (this.data.valorText !== this.source()) {
      this.data.valorText = this.source()!;
      this.avisarModificacion();
      // this.actualizarVista();
    }
  }

  actualizarVista() {
    this.files.set([]);
    this.isEnd.set(false);
    const _source = this.source();
    if (_source) {
      const items: string[] = _source.split(ArchivoComponent.SEPARADOR);
      const _files: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const iSource = items[i];
        if (iSource) {
          _files.push({
            url: iSource,
            index: i + 1,
            file: null,
            isLoading: false,
          });
        }
      }
      this.files.set(_files);
      if (!this.multipleFiles()) {
        this.isEnd.set(true);
      }
    }
  }

  openImage(item: any) {
    if (item.blob) {
      return;
    }
    window.open(formatImageUrl(this.ls, item.url), '_blank');
  }

  deleteFile(item: any) {
    const index: number = this.files().indexOf(item);
    if (index !== -1) {
      this.files.update(f => [...f.slice(0, index), ...f.slice(index + 1)]);
    }
    if (!item.isLoading) {
      const _url = item.url;
      const _source = this.source();
      if (_source) {
        let nuevoSource = _source.replace(
          _url + ArchivoComponent.SEPARADOR,
          ''
        );
        nuevoSource = nuevoSource.replace(_url, '');
        this.source.set(nuevoSource);
      }
      this.actualizar();
    }
    this.isEnd.set(false);
  }

  clearSignature() {
    this.signaturePad?.clear();
  }

  takeSignature(): void {
    if (!this.signaturePad) {
        return;
    }

    this.addFileToTable(
        'Signature',
        this.signaturePad.toDataURL(),
        null
    );

    this.clearSignature();
}

  b64toFile(dataURI): File {
    // cast to a File
    return <File>this.dataURItoBlob(dataURI);
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
    document.getElementById(this.structure.llaveTabla + '_file')?.click();
  }

  onClickLoadUrl() {
    if (this.isLoadingUrl()) {
      this.source.set(this.urlText);
      this.actualizarVista();
      this.actualizar();
    }
    this.isLoading.set(!this.isLoadingUrl());
    this.isLoadingUrl.set(!this.isLoadingUrl());
  }

  isImage(url) {
    if (!url) { return false; }
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase());
  }

}
