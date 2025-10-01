import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { LoginService } from 'app/authentication/login.service';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { environment } from 'environments/environment';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user'
})
export class UserComponent implements OnInit, OnDestroy {

    user: UsuarioDTO;
    time = new Date();
    currentApplicationVersion = environment.appVersion;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        public jwtAuth: LoginService,
        private apiService: ApiService,
        private templateService: TemplateService,
        private utilService:UtilsService
    ) {
    }

    ngOnInit(): void {
        this.jwtAuth.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: UsuarioDTO) => {
                this.user = user;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    signOut(): void {
        this.jwtAuth.signout();
    }

    getFullTemplates() {
        this.templateService.setTemplates([]);
        this.apiService.listarDocumentosFull().subscribe({
            next: (value) => {
                this.templateService.setTemplates(value);
            }
        });
    }

    getRefreshTemplates() {
        this.templateService.setTemplates([]);
        this.apiService.listarPlantillas(null).subscribe({
            next: (value) => {
                this.templateService.setTemplates(value);
            }
        });
    }

    cambiarClave() {
        this.utilService.modalUserChangePass().subscribe();
    }
    
    cambiarClaveOther(pUsuario) {
        this.utilService.modalUserChangePassOther(pUsuario).subscribe();
    }

    goToMyAccount(pUsuario) {
        this.utilService.modalUser(pUsuario.llaveTabla).subscribe();    
    }

    downloadApk() {
        const url = '/cs.apk';
        window.open(url, '_blank');
    }

}
