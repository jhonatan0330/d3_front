import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect,  inject } from '@angular/core';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { LoginService } from 'app/authentication/login.service';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { environment } from 'environments/environment';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatDivider, MatMenuItem]
})
export class UserComponent {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    jwtAuth = inject(LoginService);
    private apiService = inject(ApiService);
    private templateService = inject(TemplateService);
    private utilService = inject(UtilsService);


    user: UsuarioDTO;
    time = new Date();
    currentApplicationVersion = environment.appVersion;

    constructor() {
        effect(() => {
            this.user = this.jwtAuth.user();
            this._changeDetectorRef.markForCheck();
        });
    }



    signOut(): void {
        this.jwtAuth.signout();
    }

    getRefreshTemplates(pProfile:string) {
        this.templateService.setTemplates([]);
        this.apiService.listarPlantillas(pProfile).subscribe({
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
