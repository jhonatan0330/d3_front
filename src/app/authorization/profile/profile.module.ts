import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseCardModule } from "@fuse/components/card";
import { SharedMaterialModule } from "app/shared/shared-material.module";
import { SharedModule } from "app/shared/shared.module";
import { ProfileComponent } from "./profile.component";
import { profileRoutes } from "./profile.routing";
import { TemplateComponent } from "./template/template.component";

@NgModule({
    declarations: [
        TemplateComponent,
        ProfileComponent
    ],
    imports: [
        RouterModule.forChild(profileRoutes),
        FuseCardModule,
        SharedModule,
        SharedMaterialModule,        

    ]
})
export class ProfileModule {
}
