import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html'
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  recoverForm: FormGroup;
  errorMsg = '';
  autorizationId: string;
  
  private _unsubscribeAll: Subject<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwtAuth: LoginService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.recoverForm = new FormGroup({
      clave: new FormControl('', Validators.required),
      first: new FormControl('', Validators.required),
      second: new FormControl('', Validators.required)
    });
  }


  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  signin() {
    if(this.recoverForm.invalid) {return;}

    this.route.params.subscribe((params: Params) => {
      this.autorizationId = params.id;
    });

    const signinData = this.recoverForm.value;

    if(signinData.first !== signinData.second){
      Swal.fire('Confirma el password', 'Tu nueva clave no concuerda con la segunda clave.','error');
      return;
    }
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    this.jwtAuth.changePwd(signinData.clave, signinData.first, this.autorizationId).subscribe({
      next: () => {
        this.jwtAuth.signout();
        Swal.fire('Todo perfecto', 'Tu nueva clave se ha confirmado, agradecemos tu paciencia, mejoramos para cuidar tu seguridad.','info');
      },
      error: (err:string) => {
        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';
        if(err.indexOf('token vencido')!=-1){
          this.router.navigateByUrl('sessions/recover');
        }
      }
    });
  }

}
