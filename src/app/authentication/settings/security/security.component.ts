import { ChangeDetectionStrategy, Component, OnInit,  inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';

import Swal from 'sweetalert2';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule,ReactiveFormsModule,MatFormField,MatLabel,MatIcon,MatPrefix,MatInput]
})
export class SettingsSecurityComponent implements OnInit {
    data = inject<{
    key: UsuarioDTO;
}>(MAT_DIALOG_DATA);
    private _formBuilder = inject(UntypedFormBuilder);
    private jwtAuth = inject(LoginService);
    private destroyRef = inject(DestroyRef);

    securityForm: UntypedFormGroup;
    isLoading = signal(false);
    keyData = signal<UsuarioDTO | null>(null);

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

        if(this.data){
            this.keyData.set(this.data?.key ?? null);
        }
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
        this.isLoading.set(true);

        if (this.keyData()) {

            this.jwtAuth.changePwdOther(this.keyData()!.llaveTabla, signinData.oldPwd, signinData.newPwd, null!)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.isLoading.set(false);
                    Swal.fire(
                        'Cambio Exitoso',
                        'La nueva clave del usuario '+this.keyData()!.nombre+' se cambio de forma exitosa',
                        'success'
                    );
                },
                error: () => {
                    this.isLoading.set(false);
                },
            });
        } else {
            this.jwtAuth.changePwd(signinData.oldPwd, signinData.newPwd, null!)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.isLoading.set(false);
                    Swal.fire(
                        'Cambio Exitoso',
                        'La nueva clave se cambio de forma exitosa',
                        'success'
                    );
                },
                error: () => {
                    this.isLoading.set(false);
                },
            });
        }

    }
}
