import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ParticleBackgroundDirective } from '../../business/particle-background';
import { UsuarioAutenticacionDTO } from 'app/authentication/domain/UsuarioAutenticacionDTO';
import { AuthenticationApi } from 'app/authentication/authentication.api';


@Component({
    selector: 'app-dfa',
    templateUrl: './dfa.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        ReactiveFormsModule,
        ParticleBackgroundDirective
    ]
})
export class dfaComponent {
    private fb = inject(FormBuilder);
    private readonly apiService = inject(AuthenticationApi);
    data = inject(MAT_DIALOG_DATA);
    private dialogRef = inject<MatDialogRef<dfaComponent>>(MatDialogRef);
    private destroyRef = inject(DestroyRef);


    public recoverForm: FormGroup;
    errorMsg = '';
    autorizationId: string;


    constructor() {

        this.recoverForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(4)]]
        });
    }

    get showInstruction(): boolean {
        const code = this.recoverForm.get('code')?.value;
        return !code || code.toString().trim() === '';
    }

    signin(): void {
        if (this.recoverForm.invalid) {
            this.errorMsg = 'Por favor introduce el código de seguridad.';
            this.recoverForm.markAllAsTouched();
            return;
        }

        const _user: UsuarioAutenticacionDTO = new UsuarioAutenticacionDTO();
        _user.usuario = this.data;
        _user.token = this.recoverForm.value.code;

        this.apiService.verificarToken(_user)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.dialogRef.close(true);
            },
            error: () => {
                //this.dialogRef.close(false);
            }
        });
    }

}
