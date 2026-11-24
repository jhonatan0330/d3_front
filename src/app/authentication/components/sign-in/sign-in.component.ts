import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { TenantRuntime } from 'app/multitenancy/business/tenant-runtime';
import { TenantUrlService } from 'app/multitenancy/business/tenant-url.service';
import { prefixForTenant } from 'app/multitenancy/business/tenant-url.strategy';
import { LocalStoreService } from 'app/shared/local-store.service';
import { EMPTY, finalize, switchMap, tap } from 'rxjs';
import { LoginService } from 'app/authentication/login.service';
import { PedidoVentaDTO } from 'app/document/document.types';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent } from 'app/document/form/form.component';
import { documentFormDialogConfig } from 'app/document/form/document-form.dialog';
import { dfaComponent } from 'app/authentication/components/DFA/dfa';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ImageFormatPipe } from '../../../shared/local-image';
import { ParticleBackgroundDirective } from '../../business/particle-background';
import { environment } from 'environments/environment';
import { SafeHtml } from '@angular/platform-browser';
import { UsuarioAutenticacionDTO } from 'app/authentication/domain/UsuarioAutenticacionDTO';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'sign-in-split-screen-reversed',
    templateUrl: './sign-in.component.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatIcon,
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
    private readonly dialog = inject(MatDialog);
    private readonly localStore = inject(LocalStoreService);
    private readonly tenantUrl = inject(TenantUrlService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly notificationCenter = inject(NotificationCenterService);


    readonly company = this.layoutService.company;
    readonly isLoading = signal(false);
    readonly currentApplicationVersion = environment.appVersion;
    readonly pendingPreviousKey = signal<string | null>(null);
    readonly showRevert = computed(() => this.pendingPreviousKey() !== null);

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

    private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');


    constructor() {
        this.layoutService.getOrganization();

        this.loginService
            .checkTokenIsValid()
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(valid => {
                if (valid && this.route.snapshot.queryParamMap.get('pendingSwitch') !== '1') {
                    this.redirectURL();
                }
            });

        this.route.queryParamMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => this.applyPendingTenantSwitch(params));
    }

    private applyPendingTenantSwitch(params: ParamMap): void {
        if (params.get('pendingSwitch') !== '1') {
            this.pendingPreviousKey.set(null);
            return;
        }
        const tenantKey = params.get('tenant');
        if (tenantKey) {
            let target = TenantRuntime.findByKey(tenantKey);
            if (!target) {
                target = { key: tenantKey, name: tenantKey, token: null };
                TenantRuntime.upsert(target);
            }
            TenantRuntime.setCurrent(target);
            this.localStore.setTenants(TenantRuntime.getTenants());
            this.layoutService.getOrganization();
        }
        this.pendingPreviousKey.set(params.get('previous') || null);
    }

    revertToPrevious(): void {
        const previousKey = this.pendingPreviousKey();
        if (previousKey) {
            const previous = TenantRuntime.findByKey(previousKey);
            if (previous) {
                TenantRuntime.setCurrent(previous);
                this.localStore.setTenants(TenantRuntime.getTenants());
                this.layoutService.getOrganization();
            }
        }
        this.pendingPreviousKey.set(null);
        this.redirectURL();
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

                    return this.dialog
                        .open(dfaComponent, { disableClose: false, data: response.usuario })
                        .afterClosed()
                        .pipe(
                            tap(result => {
                                if (!result) {
                                   
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
                next: () => {
                    this.pendingPreviousKey.set(null);
                },
                error: response => {

                    if (
                        typeof response === 'string' &&
                        response.startsWith('Por seguridad')
                    ) {
                        this.router.navigateByUrl(
                            'sessions/recover'
                        );
                        return;
                    }

                    this.focusPasswordAfterError();
                }
            });

    }

    private focusPasswordAfterError(): void {
        this.notificationCenter
            .whenClosed()
            .then(() => this.passwordInput()?.nativeElement.focus());
    }

    private redirectURL(): Promise<boolean> {
        this.tenantUrl.setPrefix(prefixForTenant(TenantRuntime.getCurrent()));
        return this.router.navigateByUrl(
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

        this.dialog
            .open(FormComponent, documentFormDialogConfig(pedidoVenta, { close2Save: true }))
            .afterClosed()
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
