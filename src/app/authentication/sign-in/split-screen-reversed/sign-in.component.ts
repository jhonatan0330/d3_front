import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { OrganizacionDTO, UsuarioAutenticacionDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
    selector: 'sign-in-split-screen-reversed',
    templateUrl: './sign-in.component.html'
})
export class SignInSplitScreenReversedComponent implements OnInit {

    templateNewUser: string;

    signInForm: UntypedFormGroup;
    isLoading = false;
    company: OrganizacionDTO;
    currentApplicationVersion = environment.appVersion;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    logo: SafeHtml;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        public loginservice: LoginService,
        private route: ActivatedRoute,
        private router: Router,
        private utilsService: UtilsService
    ) { }


    ngOnInit(): void {

        // Subscribe to the company
        this.loginservice.company$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((company: OrganizacionDTO) => {
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
            });
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required]
        });
        this.loginservice.checkTokenIsValid()
            .subscribe((result: boolean) => {
                if (!result) { this.loginservice.getUrlServices(); }
            });
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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
        this.loginservice.signin(this.signInForm.value.username, this.signInForm.value.password, null)
            .subscribe({
                next: (_val: UsuarioAutenticacionDTO) => {
                    this.isLoading = false;
                    this.signInForm.enable();
                    this.signInForm.controls['password'].setValue('');
                    const _today = new Date().getTime(); //fecha de hoy
                    const _fechaMaxima = _val.fechaMaxima?.getTime(); //fecha de vencimiento de la clave
                    if (( _today - (_fechaMaxima + 60*60*24*3000))>= 0) {  //  60 segundos * 60 minutos * 24 horas * 3 dias * 1000 milisegundos es el tiempo de 3 dias para que muestre el popo up faltando 3 dias en adelante.
                        //Swal.fire('Cambia tu contraseña', 'Te quedan ' + Math.trunc((_fechaMaxima - _today)/(3600*24*1000)) + ' dias para cambiar tu contraseña.');
                        this.utilsService.modalUserChangePass().subscribe();
                        /*this.loginservice.recoverPassword(_val.usuarioDTO.identificacion, _val.usuarioDTO.correo).subscribe(() => {});*/
                    }
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
}
