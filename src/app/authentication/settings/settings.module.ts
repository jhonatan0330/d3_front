import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsComponent } from 'app/authentication/settings/settings.component';
import { SettingsAccountComponent } from 'app/authentication/settings/account/account.component';
import { SettingsSecurityComponent } from 'app/authentication/settings/security/security.component';
import { settingsRoutes } from 'app/authentication/settings/settings.routing';
import { ChangePictureComponent } from './change-picture/change-picture.component';
import { SettingsOrganizationComponent } from './organization/organization.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PropertyForm } from './property-form/property-form.component';

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsAccountComponent,
        SettingsSecurityComponent,
        ChangePictureComponent,
        SettingsOrganizationComponent,
        PropertyForm
    ],
    imports     : [
        RouterModule.forChild(settingsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatAutocompleteModule,
        SharedModule
    ]
})
export class SettingsModule
{
}
