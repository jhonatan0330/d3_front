import { Component,  inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TemplateService } from 'app/document/service/template.service';
import { DocumentApi } from 'app/document/document.api';
import { LoginService } from 'app/authentication/login.service';
import { environment } from 'environments/environment';
import { UtilsService } from 'app/document/service/utils.service';
import { MatIcon } from '@angular/material/icon';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { LayoutService } from '../layout.service';
import { UsageMeterWidgetComponent } from 'app/usage/components/usage-meter-widget/usage-meter-widget.component';
import { OrganizationHomeFormComponent } from 'app/configuration/components/organizations/organization-home-form/organization-home-form.component';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    imports: [MatIcon, DropdownComponent, DropdownItemComponent, UsageMeterWidgetComponent]
})
export class UserComponent {
    readonly jwtAuth = inject(LoginService);
    readonly layoutService = inject(LayoutService);

    private apiService = inject(DocumentApi);
    private templateService = inject(TemplateService);
    private utilService = inject(UtilsService);
    private dialog = inject(MatDialog);

    time = new Date();
    currentApplicationVersion = environment.appVersion;

    hasImage(): boolean {
        return !!this.layoutService.user()?.imagen?.trim();
    }

    userInitial(): string {
        return this.layoutService.user()?.nombre?.charAt(0)?.toUpperCase() ?? '';
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).style.display = 'none';
    }

    signOut(): void {
        this.jwtAuth.signout();
    }

    getRefreshTemplates(pProfile:string) {
        this.templateService.setTemplates([]);
        this.apiService.listarPlantillas(pProfile).subscribe({
            next: (value) => {
                this.templateService.setTemplates(value, pProfile === 'ADMIN');
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

    openOrganizationHomeForm(): void {
        this.dialog.open(OrganizationHomeFormComponent, {
            width: '1100px',
            maxWidth: '95vw',
            maxHeight: '92vh',
            disableClose: true,
            autoFocus: false,
        });
    }

}
