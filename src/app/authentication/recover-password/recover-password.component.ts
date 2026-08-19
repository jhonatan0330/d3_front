import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';
import { Router, RouterLink } from '@angular/router';
import { ParticleBackgroundDirective } from '../shared/particle-background';

@Component({
    selector: 'app-recover-password',
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
    templateUrl: './recover-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, RouterLink, ParticleBackgroundDirective]
})
export class RecoverPasswordComponent implements OnInit {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  recoverForm: FormGroup<{ identificacion: FormControl<string | null>, correo: FormControl<string | null> }>;
  errorMsg = '';
  submitting = false;

  ngOnInit() {
    this.recoverForm = new FormGroup({
      identificacion: new FormControl('', Validators.required),
      correo: new FormControl('', Validators.required)
    });
  }


  signin() {
    const signinData = this.recoverForm.value;

    this.submitting = true;

    this.loginService.recoverPassword(signinData.identificacion!, signinData.correo!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.loginService.signout();
        Swal.fire('Revisa tu correo', 'Hemos enviado un mensaje a tu correo electronico, hay puedes obtener el link para crear una clave y tambien tendras el codigo de seguridad.','info');
        this.router.navigateByUrl('main');
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

}
