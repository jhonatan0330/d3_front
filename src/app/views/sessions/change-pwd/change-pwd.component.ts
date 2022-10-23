import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html'
})
export class ChangePwdComponent implements OnInit {
  pwChangeForm: FormGroup;
  isLoading = false;

  constructor(
    private jwtAuth: JwtAuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChangePwdComponent>
  ) {}
  ngOnInit() {
    this.pwChangeForm = new FormGroup({
      oldPwd: new FormControl('', Validators.required),
      newPwd: new FormControl('', Validators.required),
      repeatPwd: new FormControl('', Validators.required),
    });
  }

  changePwd() {
    const signinData = this.pwChangeForm.value;
    if (signinData.newPwd !== signinData.repeatPwd) {
      Swal.fire(
        'Nueva clave',
        'La nueva clave no concuerda con la que se repite',
        'info'
      );
      return;
    }
    this.isLoading = true;
    this.jwtAuth.changePwd(signinData.oldPwd, signinData.newPwd, null).subscribe({
      next: () => {
        Swal.fire(
          'Cambio Exitoso',
          'La nueva clave se cambio de forma exitosa',
          'success'
        );
        this.dialogRef.close();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
