import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { JwtAuthService } from 'app/authentication/jwt-auth.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { NotificationsService } from 'app/notification/notification.service';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { DocumentoPlantillaDTO, OrganizacionDTO, UsuarioAutenticacionDTO, UsuarioOrganizacionDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user'
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        public jwtAuth: JwtAuthService,
        private templateService: TemplateService,
        private notificationService: NotificationsService,
        private apiService: ApiService,
        private _navigationService: NavigationService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.getMenu();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign out
     */
    signOut(): void {
        this.templateService.clear();
        this.jwtAuth.signout();
        this.notificationService.clear();
        this._userService.clear();
        this.user = null;
    }

    getFullTemplates() {
        this.templateService.setTemplates([]);
        this.apiService.listarDocumentosFull().subscribe({
            next: (value) => {
                this.templateService.setTemplates(value);
            }
        });
    }


    getMenu() {
        if (!this.user) { return; }
        if (
            !this.templateService.template ||
            this.templateService.template.length === 0
        ) {
            this.apiService.listarPlantillas(null)
                .subscribe(templates => {
                    this.templateService.setTemplates(templates);
                    const processToMenu = [];
                    // Transform document to MenuItems
                    templates.forEach((element) => {
                        if (!element.llaveTabla) {
                            element.estado = 'T';
                            processToMenu.push(element);
                        }
                    });

                    this._navigationService.generate(processToMenu);
                    this.conect2Other();
                });
        }
    }

    goToMyAccount() {
        this._router.navigate(['/settings']);
    }


    conect2Other() {
        if (this.jwtAuth.otherCompany && this.jwtAuth.otherCompany.length !== 0) {
            this.templateService.setOtherSystems(this.jwtAuth.otherCompany);
            for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
                const element = this.templateService.conectionTemplates[i];
                if (!element.token) {
                    this.logInOtherSystem(element);
                } else {
                    this.handlerLoginOther(element.token, element.servidor);
                }
            }
        }
    }

    logInOtherSystem(element: OrganizacionDTO, reloadPassword: Boolean = false) {
        this.apiService
            .autenticar(
                this.jwtAuth.user.identificacion,
                element.usuarioSystem,
                element.llaveTabla
            )
            .subscribe({
                next: (auth: UsuarioAutenticacionDTO) => {
                    if (reloadPassword) {
                        const newKEy = new UsuarioOrganizacionDTO();
                        newKEy.organizacion = element.llaveTabla;
                        newKEy.usuario = this.jwtAuth.user.llaveTabla;
                        newKEy.tokenServer = element.usuarioSystem;
                        this.jwtAuth.changePwdOtherSystem(newKEy).subscribe();
                    }
                    this.handlerLoginOther(auth.token, element.llaveTabla);
                },
                error: () => {
                    this.handlerErrorLoginOther(element);
                },
            });
    }

    handlerLoginOther(authToken: string, servidor: string) {
        for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
            const element = this.templateService.conectionTemplates[i];
            if (element.llaveTabla === servidor) {
                element.token = authToken;
                element.mensajeIngreso = 'Cargando plantillas';
                if (!element.plantillas) {
                    this.apiService.listarPlantillas(servidor).subscribe({
                        next: (_t: DocumentoPlantillaDTO[]) => {
                            this.handlerTemplateOther(_t, servidor);
                        },
                        error: () => { },
                    });
                } else {
                }
            }
        }
    }

    handlerErrorLoginOther(element: OrganizacionDTO) {
        element.usuarioSystem = undefined;
    }

    /*signin(element: OrganizacionDTO) {
        const signinData = this.signinForm.value;
        element.usuarioSystem = signinData.password;
        this.logInOtherSystem(element, true);
    }*/

    handlerTemplateOther(
        plantillas: DocumentoPlantillaDTO[],
        servidor: string
    ) {
        for (let i = 0; i < this.templateService.conectionTemplates.length; i++) {
            const otherSystem = this.templateService.conectionTemplates[i];
            if (otherSystem.llaveTabla === servidor) {
                for (let j = 0; j < plantillas.length; j++) {
                    const templateFromOtherSystem = plantillas[j];
                    templateFromOtherSystem.server = otherSystem.llaveTabla;
                    if (templateFromOtherSystem.reportes) {
                        for (let r = 0; r < templateFromOtherSystem.reportes.length; r++) {
                            const reportInTemplateFromOtherSystem = templateFromOtherSystem.reportes[r];
                            if (!reportInTemplateFromOtherSystem.servidorUrl) { reportInTemplateFromOtherSystem.servidorUrl = otherSystem.servidorUrl; }
                        }
                    }
                }
                otherSystem.plantillas = plantillas;
                this.templateService.addTemplatesFromOtherSystems();
                /*
                element.menuPlantillas = plantillas.filter((item) =>
                    PlantillaHelper.buscarPropiedad(item.propiedades, PlantillaHelper.PERMISO_PLANTILLA_LISTAR_MENU)
                );
                element.reportePlantillas = plantillas.filter((item) =>
                    PlantillaHelper.buscarPropiedad(
                        item.propiedades,
                        PlantillaHelper.PLANTILLA_TIPO_REPORTE
                    )
                );*/
                break;
            }
        }
    }
}
