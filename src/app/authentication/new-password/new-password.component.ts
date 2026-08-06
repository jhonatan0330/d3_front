import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Validators, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatButton, RouterLink]
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loginService = inject(LoginService);


  recoverForm: FormGroup;
  errorMsg = '';
  autorizationId: string;
  
  private _unsubscribeAll: Subject<any>;

  constructor() {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.loginService.getUrlServices();
    this.recoverForm = new FormGroup({
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


    this.loginService.changePwd(signinData.clave, signinData.first, this.autorizationId).subscribe({
      next: () => {
        this.loginService.signout();
        Swal.fire('Todo perfecto', 'Tu nueva clave se ha confirmado, agradecemos tu paciencia, mejoramos para cuidar tu seguridad.','info');
        this.router.navigateByUrl('sign-in');
      },
      error: (err:string) => {

        if(err.indexOf('token vencido')!=-1){
          this.router.navigateByUrl('sessions/recover');
        }
      }
    });
  }

}
