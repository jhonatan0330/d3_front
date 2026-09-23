import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInput } from '@angular/material/input';
import { EMPTY, finalize, switchMap, tap } from 'rxjs';
import { LoginService } from 'app/authentication/login.service';
import { PedidoVentaDTO } from 'app/document/document.types';
import { UtilsService } from 'app/document/service/utils.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ImageFormatPipe } from '../../../shared/local-image';
import { ParticleBackgroundDirective } from '../../business/particle-background';
import { environment } from 'environments/environment';
import { SafeHtml } from '@angular/platform-browser';
import { UsuarioAutenticacionDTO } from 'app/authentication/domain/UsuarioAutenticacionDTO';
import { LayoutService } from 'app/layout/layout.service';

@Component({
    selector: 'sign-in-split-screen-reversed',
    templateUrl: './sign-in.component.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInput,
        ImageFormatPipe,
        ParticleBackgroundDirective
    ]
})
export class SignInSplitScreenReversedComponent {
    public readonly layoutService = inject(LayoutService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly loginService = inject(LoginService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly utilsService = inject(UtilsService);
    private readonly destroyRef = inject(DestroyRef);


    readonly company = this.layoutService.company;
    readonly isLoading = signal(false);
    readonly currentApplicationVersion = environment.appVersion;

    readonly templateNewUser = computed(() =>
        PlantillaHelper.buscarValor(
            this.layoutService.company()?.propiedades ?? [],
            PlantillaHelper.PLANTILLA_NUEVO_USUARIO
        )
    );

    readonly logo = computed<SafeHtml | null>(() =>
        PlantillaHelper.buscarValor(
            this.layoutService.company()?.propiedades ?? [],
            PlantillaHelper.LOGIN_HTML
        ) ?? null
    );

    readonly isDfaEnabled = computed(() =>
        !!PlantillaHelper.buscarValor(
            this.layoutService.company()?.propiedades ?? [],
            PlantillaHelper.APP_DFA
        )
    );


    readonly signInForm = this.formBuilder.nonNullable.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });


    constructor() {
        this.layoutService.getOrganization();

        this.loginService
            .checkTokenIsValid()
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    signIn(): void {

        if (this.signInForm.invalid || this.isLoading()) {
            this.signInForm.markAllAsTouched();
            return;
        }

        const {
            username,
            password
        } = this.signInForm.getRawValue();

        this.isLoading.set(true);
        this.signInForm.disable();

        const authentication$ = this.loginService.signin(
            username,
            password,
            null
        );

        if (!authentication$) {
            this.isLoading.set(false);
            this.signInForm.enable();
            return;
        }

        authentication$
            .pipe(
                switchMap((response: UsuarioAutenticacionDTO) => {

                    if (!this.isDfaEnabled()) {
                        return this.redirectURL();
                    }

                    return this.utilsService
                        .modalUserChangePassOther(response.usuario)
                        .pipe(
                            tap(result => {
                                if (!result) {
                                    console.warn(
                                        'Autenticación cancelada o código incorrecto'
                                    );
                                }
                            }),
                            switchMap(result => {

                                if (!result) {
                                    return EMPTY;
                                }

                                return this.redirectURL();
                            })
                        );
                }),

                finalize(() => {
                    this.isLoading.set(false);
                    this.signInForm.enable();
                    this.signInForm.controls.password.setValue('');
                }),

                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                error: response => {

                    if (
                        typeof response === 'string' &&
                        response.startsWith('Por seguridad')
                    ) {
                        this.router.navigateByUrl(
                            'sessions/recover'
                        );
                    }
                }
            });

    }

    private redirectURL(): string {

        return (
            this.route.snapshot.queryParamMap.get('redirectURL') ??
            '/main'
        );
    }

    recoverPassword(): void {
        this.router.navigateByUrl('/sessions/recover');
    }


    // -------------------------------------------------------------------------
    // New user
    // -------------------------------------------------------------------------

    newUser(): void {

        const template = this.templateNewUser();

        if (!template) {
            return;
        }

        const pedidoVenta = new PedidoVentaDTO();

        pedidoVenta.plantilla = template;

        this.utilsService
            .modalWithParams(pedidoVenta, true)
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(documentResponse => {

                const username = documentResponse.data.nombre;

                this.signInForm.patchValue({
                    username,
                    password: username
                });

                this.signIn();
            });
    }
}
