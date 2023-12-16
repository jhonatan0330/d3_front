import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { LoginService } from 'app/authentication/login.service';

import Swal from 'sweetalert2';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit {
    securityForm: UntypedFormGroup;
    isLoading = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private jwtAuth: LoginService
    ) {
    }

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
