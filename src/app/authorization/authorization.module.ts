import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatCarouselModule } from "@magloft/material-carousel";

import { SharedModule } from "app/shared/shared.module";
import { ProfileComponent } from "./profile/profile.component";
import { profileRoutes } from "./authorization.routing";
import { TemplateComponent } from "./profile/template/template.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";

@NgModule({
    declarations: [
        TemplateComponent,
        ProfileComponent
    ],
    imports: [
        RouterModule.forChild(profileRoutes),
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatCarouselModule.forRoot(),
    ]
})
export class ProfileModule {
}
