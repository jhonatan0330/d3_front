import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoginService } from 'app/authentication/login.service';
import Swal from 'sweetalert2';
import { ImageUploaderComponent } from 'app/upload/image-uploader/image-uploader.component';
@Component({
    selector: 'app-change-picture',
    templateUrl: './change-picture.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ImageUploaderComponent]
})
export class ChangePictureComponent {
  jwtAuth = inject(LoginService);
  submitted = false;

  get imagen(): string {
    return this.jwtAuth.user()?.imagen;
  }

  onChanged(url: string | null) {
    if (!url) return;
    this.submitted = true;
    this.jwtAuth.changePicture(url).subscribe({
      next: (data) => {
        this.jwtAuth.user.set(data);
        this.submitted = false;
        Swal.fire('Video', 'Cambio exitoso', 'success');
      },
      error: (error) => {
        this.submitted = false;
        Swal.fire('Video', error, 'error');
      }
    });
  }
}
