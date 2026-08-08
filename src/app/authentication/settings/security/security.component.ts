import { ChangeDetectionStrategy, Component, OnInit,  inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';

import Swal from 'sweetalert2';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatIcon, MatPrefix, MatInput, MatButton]
})
export class SettingsSecurityComponent implements OnInit {
    data = inject<{
    key: UsuarioDTO;
}>(MAT_DIALOG_DATA);
    private _formBuilder = inject(UntypedFormBuilder);
    private jwtAuth = inject(LoginService);

    securityForm: UntypedFormGroup;
    isLoading = false;

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.securityForm = this._formBuilder.group({
            oldPwd: new UntypedFormControl('', Validators.required),
            newPwd: new UntypedFormControl('', Validators.required),
            repeatPwd: new UntypedFormControl('', Validators.required),
        });
    }


    changePwd() {
        const signinData = this.securityForm.value;
        if (signinData.newPwd !== signinData.repeatPwd) {
            Swal.fire(
                'Nueva clave',
                'La nueva clave no concuerda con la que se repite',
                'info'
            );
            return;
        }
        this.isLoading = true;

        if (this.data?.key) {

            this.jwtAuth.changePwdOther(this.data.key.llaveTabla, signinData.oldPwd, signinData.newPwd, null).subscribe({
                next: () => {
                    this.isLoading = false;
                    Swal.fire(
                        'Cambio Exitoso',
                        'La nueva clave del usuario '+this.data.key.nombre+' se cambio de forma exitosa',
                        'success'
                    );
                },
                error: () => {
                    this.isLoading = false;
                },
            });
        } else {
            this.jwtAuth.changePwd(signinData.oldPwd, signinData.newPwd, null).subscribe({
                next: () => {
                    this.isLoading = false;
                    Swal.fire(
                        'Cambio Exitoso',
                        'La nueva clave se cambio de forma exitosa',
                        'success'
                    );
                },
                error: () => {
                    this.isLoading = false;
                },
            });
        }

    }
}
