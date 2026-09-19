import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoginService } from 'app/authentication/login.service';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
@Component({
    selector: 'app-change-picture',
    templateUrl: './change-picture.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ImageUploaderComponent]
})
export class ChangePictureComponent {
  jwtAuth = inject(LoginService);
  authenticationService = inject(AuthenticationService);
  private notificationCenter = inject(NotificationCenterService);
  submitted = false;

  get imagen(): string {
    return this.jwtAuth.user()?.imagen;
  }

  onChanged(url: string | null) {
    if (!url) return;
    this.submitted = true;
    this.authenticationService.changePicture(url).subscribe({
      next: (data) => {
        this.jwtAuth.user.set(data);
        this.submitted = false;
        this.notificationCenter.fire('Video', 'Cambio exitoso', 'success');
      },
      error: (error) => {
        this.submitted = false;
        this.notificationCenter.fire('Video', error, 'error');
      }
    });
  }
}
