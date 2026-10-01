import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ParticleBackgroundDirective } from '../../business/particle-background';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { AuthenticationApi } from 'app/authentication/authentication.api';

@Component({
    selector: 'app-recover-password',
    templateUrl: './recover-password.component.html',
    imports: [FormsModule, ReactiveFormsModule, RouterLink, ParticleBackgroundDirective]
})
export class RecoverPasswordComponent {
  private authenticationApi = inject(AuthenticationApi);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private notificationCenter = inject(NotificationCenterService);

  recoverForm: FormGroup<{ identificacion: FormControl<string | null>, correo: FormControl<string | null> }> = new FormGroup({
    identificacion: new FormControl('', Validators.required),
    correo: new FormControl('', [Validators.required, Validators.email])
  });
  errorMsg = signal('');
  submitting = signal(false);

  signin() {
    if (this.submitting()) {
      return;
    }
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    this.errorMsg.set('');
    this.submitting.set(true);

    const { identificacion, correo } = this.recoverForm.getRawValue();

    this.authenticationApi.recoverPassword(identificacion ?? '', correo ?? '')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: () => {
          this.notificationCenter.info('Revisa tu correo', 'Hemos enviado un mensaje a tu correo electronico, hay puedes obtener el link para crear una clave y tambien tendras el codigo de seguridad.');
          this.router.navigateByUrl('/sign-in');
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || err?.message || 'No pudimos enviar las instrucciones. Verifica los datos e intenta de nuevo.');
          this.notificationCenter.error('No se pudo enviar', this.errorMsg());
        }
      });
  }

}
