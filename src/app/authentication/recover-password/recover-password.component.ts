import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-recover-password',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './recover-password.component.html'
})
export class RecoverPasswordComponent implements OnInit, OnDestroy {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  recoverForm: FormGroup;
  errorMsg = '';
  
  private _unsubscribeAll: Subject<any>;

  constructor(
    private jwtAuth: LoginService
  ) {
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

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    this.jwtAuth.recoverPassword(signinData.identificacion, signinData.correo).subscribe({
      next: () => {
        this.jwtAuth.signout();
        Swal.fire('Revisa tu correo', 'Hemos enviado un mensaje a tu correo electronico, hay puedes obtener el link para crear una clave y tambien tendras el codigo de seguridad.','info');
      },
      error: () => {
        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';
      }
    });
  }

}
