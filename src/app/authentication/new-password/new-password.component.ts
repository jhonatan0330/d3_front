import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html'
})
export class NewPasswordComponent implements OnInit, OnDestroy {

  recoverForm: FormGroup;
  errorMsg = '';
  autorizationId: string;
  
  private _unsubscribeAll: Subject<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) {
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
