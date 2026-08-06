import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';
import { Router, RouterLink } from '@angular/router';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-recover-password',
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
    templateUrl: './recover-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, RouterLink, MatProgressBar]
})
export class RecoverPasswordComponent implements OnInit, OnDestroy {
  private loginService = inject(LoginService);
  private router = inject(Router);

  readonly progressBar = viewChild(MatProgressBar);
  readonly submitButton = viewChild(MatButton);

  recoverForm: FormGroup;
  errorMsg = '';
  
  private _unsubscribeAll: Subject<any>;

  constructor() {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.recoverForm = new FormGroup({
      identificacion: new FormControl('', Validators.required),
      correo: new FormControl('', Validators.required)
    });
  }


  ngOnDestroy() {
    // this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  signin() {
    const signinData = this.recoverForm.value;

    this.submitButton().disabled = true;
    this.progressBar().mode = 'indeterminate';

    this.loginService.recoverPassword(signinData.identificacion, signinData.correo).subscribe({
      next: () => {
        this.loginService.signout();
        Swal.fire('Revisa tu correo', 'Hemos enviado un mensaje a tu correo electronico, hay puedes obtener el link para crear una clave y tambien tendras el codigo de seguridad.','info');
        this.router.navigateByUrl('main');
      },
      error: () => {
        this.submitButton().disabled = false;
        this.progressBar().mode = 'determinate';
      }
    });
  }

}
