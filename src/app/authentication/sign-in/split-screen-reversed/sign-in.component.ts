import { Component, effect, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { OrganizacionDTO, UsuarioAutenticacionDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { environment } from 'environments/environment';
import { MatInput } from '@angular/material/input';
import { ImageFormatPipe } from '../../../shared/local-image';
import { ParticleBackgroundDirective } from '../../shared/particle-background';


@Component({
    selector: 'sign-in-split-screen-reversed',
    templateUrl: './sign-in.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatInput, ImageFormatPipe, ParticleBackgroundDirective]
})
export class SignInSplitScreenReversedComponent implements OnInit {
    private _formBuilder = inject(FormBuilder);
    private _cdr = inject(ChangeDetectorRef);
    loginservice = inject(LoginService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private utilsService = inject(UtilsService);


    templateNewUser: string;

    signInForm!: FormGroup;
    isLoading = false;
    company: OrganizacionDTO | undefined;
    currentApplicationVersion = environment.appVersion;
    logo: SafeHtml;
    


    constructor() {
        effect(() => {
            const company = this.loginservice.company();
            if (!company || !company.llaveTabla) {
                this.company = undefined;
                return;
            }
            this.company = company;
            this.templateNewUser = PlantillaHelper.buscarValor(
                this.company.propiedades,
                PlantillaHelper.PLANTILLA_NUEVO_USUARIO
            );
            this.logo = PlantillaHelper.buscarValor(
                this.company.propiedades,
                PlantillaHelper.LOGIN_HTML
            );
            this._cdr.markForCheck();
        });
    }


    ngOnInit(): void {

        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required]
        });
        this.loginservice.checkTokenIsValid()
            .subscribe((result: boolean) => {
                if (!result) { this.loginservice.getUrlServices(); }
            });

    }


    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }
        // Disable the form
        this.signInForm.disable();
        this.isLoading = true;
        // Sign in
        const formValue = this.signInForm.value as any;
        this.loginservice.signin(formValue.username, formValue.password, null!)!
            .subscribe({
                next: (_val: UsuarioAutenticacionDTO) => {
                    this.isLoading = false;
                    this.signInForm.enable();
                    this.signInForm.controls['password'].setValue('');
                    const APP_DFA = PlantillaHelper.buscarValor(_val.organizacion.propiedades, PlantillaHelper.APP_DFA);
                    if (APP_DFA) {
                        this.utilsService.modalUserChangePassOther(_val.usuarioDTO).subscribe((result) => {
                            if (result) {
                                this.loginservice.authenticationOK(_val);
                                const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || '/main';
                                this.router.navigateByUrl(redirectURL);
                            } else {
                                console.warn('Autenticación cancelada o código incorrecto');
                            }
                        }
                        );
                    } else {
                        this.loginservice.authenticationOK(_val);
                        const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || '/main';
                        // Navigate to the redirect url
                        this.router.navigateByUrl(redirectURL);
                    }

                },
                error: (response) => {
                    // Re-enable the form
                    this.signInForm.enable();
                    this.isLoading = false;
                    if (response.startsWith('Por seguridad')) {
                        this.router.navigateByUrl('sessions/recover');
                    }
                }
            }
            );
    }

    recoverPassword() {
        this.router.navigateByUrl('/sessions/recover');
    }

    newUser() {
        if (!this.templateNewUser) { return; }
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = this.templateNewUser;
        this.utilsService.modalWithParams(pedidoVenta, true).subscribe((documentResponse) => {

            this.signInForm.controls['username'].setValue(documentResponse.data.nombre);
            this.signInForm.controls['password'].setValue(documentResponse.data.nombre);
            this.signIn();
        });
    }

    testPrint(){
        this.utilsService.openPDF().subscribe({ error: () => {} });
    }
}
