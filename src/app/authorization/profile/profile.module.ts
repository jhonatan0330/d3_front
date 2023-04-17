import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseCardModule } from "@fuse/components/card";
import { MatCarouselModule } from "@magloft/material-carousel";

import { SharedModule } from "app/shared/shared.module";
import { ProfileComponent } from "./profile.component";
import { profileRoutes } from "./profile.routing";
import { TemplateComponent } from "./template/template.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@NgModule({
    declarations: [
        TemplateComponent,
        ProfileComponent
    ],
    imports: [
        RouterModule.forChild(profileRoutes),
        FuseCardModule,
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatCarouselModule.forRoot(),
    ]
})
export class ProfileModule {
}
