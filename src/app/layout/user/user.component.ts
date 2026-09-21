import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect,  inject } from '@angular/core';
import { TemplateService } from 'app/document/service/template.service';
import { ApiService } from 'app/document/document.api';
import { LoginService } from 'app/authentication/login.service';
import { environment } from 'environments/environment';
import { UtilsService } from 'app/document/service/utils.service';
import { MatIcon } from '@angular/material/icon';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [MatIcon, DropdownComponent, DropdownItemComponent]
})
export class UserComponent {
    readonly jwtAuth = inject(LoginService);

    private apiService = inject(ApiService);
    private templateService = inject(TemplateService);
    private utilService = inject(UtilsService);

    time = new Date();
    currentApplicationVersion = environment.appVersion;

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
