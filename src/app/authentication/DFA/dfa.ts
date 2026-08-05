import {
    Component,
    Inject,
} from '@angular/core';
import { Validators, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UsuarioAutenticacionDTO } from '../authentication.domain';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
    selector: 'app-new-password',
    templateUrl: './dfa.html',
    imports: [
        ReactiveFormsModule
    ]
})
export class dfaComponent {

    public recoverForm: FormGroup;
    errorMsg = '';
    autorizationId: string;


    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<dfaComponent>

    ) {

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
        _user.usuario = this.data.key.llaveTabla;
        _user.token = this.recoverForm.value.code;

        this.apiService.verificarToken(_user).subscribe({
            next: () => {
                this.dialogRef.close(true);
            },
            error: () => {
                //this.dialogRef.close(false);
            }
        });
    }

}
