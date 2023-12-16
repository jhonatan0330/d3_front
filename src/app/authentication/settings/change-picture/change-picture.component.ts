import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoginService } from 'app/authentication/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-picture',
  templateUrl: './change-picture.component.html'
})
export class ChangePictureComponent {
  WIDTH = 128;

  private static DEFAULT_IMAGE_TYPE: string = 'image/jpeg';
  private static DEFAULT_IMAGE_QUALITY: number = 0.92;

  @ViewChild('video') public video: ElementRef;
  @ViewChild('canvas') public canvas: ElementRef;

  submitted = false;
  dataUrl: string;
  public isTakingPicture = false;
  public isReviewingPicture = false;

  constructor(
    public jwtAuth: LoginService
  ) { }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.video.nativeElement.style = "display = 'block'"
        } else {
          Swal.fire('Video', 'You have no output video device', 'error');
        }
      } catch (e) {
        if (e && e.message) { Swal.fire('Video', e.message, 'error'); }
        else { Swal.fire('Video', 'Error desconocido', 'error'); }
      }
    }
  }

  capture() {
    // set canvas size to actual video size
    const _video = this.video.nativeElement;
    let widthSquare = this.WIDTH;
    let xStart = 0;
    let yStart = 0;
    if (_video.videoWidth) {
      widthSquare = _video.videoWidth;
      if (_video.videoWidth !== _video.videoHeight) {
        if (_video.videoHeight < _video.videoWidth) {
          widthSquare = _video.videoHeight;
          xStart = (_video.videoWidth - _video.videoHeight) / 2;
        } else {
          widthSquare = _video.videoWidth;
          yStart = (_video.videoHeight - _video.videoWidth) / 2;
        }
      }
    }

    const _canvas = this.canvas.nativeElement;
    _canvas.width = widthSquare;
    _canvas.height = widthSquare;

    // paint snapshot image to canvas
    const context2d = _canvas.getContext('2d');
    context2d.drawImage(
      _video,
      xStart,
      yStart,
      widthSquare,
      widthSquare,
      0,
      0,
      widthSquare,
      widthSquare
    );

    // read canvas content as image
    this.dataUrl = _canvas.toDataURL(
      ChangePictureComponent.DEFAULT_IMAGE_TYPE,
      ChangePictureComponent.DEFAULT_IMAGE_QUALITY
    );

    // get the ImageData object from the canvas' context.
    context2d.getImageData(0, 0, widthSquare, widthSquare);

    this.isTakingPicture = false;
    this.isReviewingPicture = true;
  }

  submit() {
    if (this.dataUrl) {
      const internalFile = this.b64toFile(this.dataUrl);
      this.submitFile(internalFile);
    }
  }

  submitFile(internalFile: File) {
    this.submitted = true;
    this.jwtAuth.changePictureUser(internalFile, null).subscribe({
      next: (data) => {
        this.jwtAuth.user = data;
        this.jwtAuth.user$.next(this.jwtAuth.user);
        this.submitted = false;
        this.isReviewingPicture = false;
        this.isTakingPicture = false;
        Swal.fire('Video', 'Cambio exitoso', 'success');
      },
      error: (error) => {
        this.submitted = false;
        this.isReviewingPicture = false;
        this.isTakingPicture = false;
        Swal.fire('Video', error, 'error');
      }
    });
  }

  // Copiado de archivo
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

  onFileSelected(files: FileList) {
    // En caso que no escoja nada
    if (files.length === 0) {
      return;
    }
    for (let j = 0; j < files.length; j++) {
      const iFile: File = files.item(j);
      this.submitFile(iFile);
    }
  }
}
