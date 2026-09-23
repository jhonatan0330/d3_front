import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ImageUploaderComponent } from 'app/upload/components/image-uploader/image-uploader.component';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { UsersApi } from 'app/users/users.api';
import { LayoutService } from '../layout.service';
@Component({
    selector: 'app-change-picture',
    templateUrl: './change-picture.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ImageUploaderComponent]
})
export class ChangePictureComponent {
  readonly layoutService = inject(LayoutService);
  readonly userApi = inject(UsersApi);
  private notificationCenter = inject(NotificationCenterService);
  submitted = false;

  get imagen(): string {
    return this.layoutService.user()?.imagen;
  }

  onChanged(url: string | null) {
    if (!url) return;
    this.submitted = true;
    this.userApi.changePicture(url).subscribe({
      next: (data) => {
        this.layoutService.user.set(data);
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
