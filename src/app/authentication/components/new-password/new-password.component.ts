import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { LoginService } from '../../login.service';
import { ParticleBackgroundDirective } from '../../business/particle-background';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { LayoutService } from 'app/layout/layout.service';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RouterLink, ParticleBackgroundDirective]
})
export class NewPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loginService = inject(LoginService);
  private layoutService = inject(LayoutService);
  private destroyRef = inject(DestroyRef);
  private notificationCenter = inject(NotificationCenterService);


  recoverForm: FormGroup<{ first: FormControl<string | null>, second: FormControl<string | null> }>;
  errorMsg = '';
  autorizationId: string | null = null;
  isSubmitting = false;

  ngOnInit() {
    this.layoutService.getOrganization();
    this.autorizationId = this.route.snapshot.paramMap.get('id');
    this.recoverForm = new FormGroup({
      first: new FormControl('', Validators.required),
      second: new FormControl('', Validators.required)
    });
  }


  signin() {
    if (this.isSubmitting) { return; }
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    const signinData = this.recoverForm.getRawValue();

    if(signinData.first !== signinData.second){
      this.notificationCenter.fire('Confirma el password', 'Tu nueva clave no concuerda con la segunda clave.','error');
      return;
    }

    if (!this.autorizationId) {
      this.notificationCenter.fire('Enlace inválido', 'No encontramos la autorización para cambiar la clave. Solicita nuevamente la recuperación.','error');
      return;
    }

    this.isSubmitting = true;
    this.loginService.changePwd(signinData.first ?? '', signinData.first ?? '', this.autorizationId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
      next: () => {
        this.loginService.signout();
        this.notificationCenter.fire('Todo perfecto', 'Tu nueva clave se ha confirmado, agradecemos tu paciencia, mejoramos para cuidar tu seguridad.','info');
        this.router.navigateByUrl('sign-in');
      },
      error: (err: unknown) => {
        const httpError = err as { message?: string; error?: { message?: string; detail?: string } | string };
        const message = typeof httpError.error === 'string'
          ? httpError.error
          : httpError.error?.message || httpError.error?.detail || httpError.message || '';
        if (message.toLowerCase().includes('token vencido')) {
          this.router.navigateByUrl('sessions/recover');
          return;
        }
        this.notificationCenter.fire('No se pudo cambiar la clave', message || 'Verifica que el enlace siga vigente e intenta nuevamente.', 'error');
      }
    });
  }

}
