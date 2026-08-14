import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect,  inject } from '@angular/core';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { LoginService } from 'app/authentication/login.service';
import { UsuarioDTO } from 'app/authentication/authentication.domain';
import { environment } from 'environments/environment';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { MatIcon } from '@angular/material/icon';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item.component';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [MatIcon, DropdownComponent, DropdownItemComponent]
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
            },
            error: () => {}
        });
    }

    cambiarClave() {
        this.utilService.modalUserChangePass().subscribe({ error: () => {} });
    }
    
    cambiarClaveOther(pUsuario) {
        this.utilService.modalUserChangePassOther(pUsuario).subscribe({ error: () => {} });
    }

    goToMyAccount(pUsuario) {
        this.utilService.modalUser(pUsuario.llaveTabla).subscribe({ error: () => {} });    
    }

}
