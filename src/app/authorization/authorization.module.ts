import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatCarouselModule } from "@magloft/material-carousel";

import { SharedModule } from "app/shared/shared.module";
import { ProfileComponent } from "./profile/profile.component";
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
        RouterModule.forChild([
            {
              path: 'main',
              component: ProfileComponent
            },
            {
              path: 'main/:type/:id',
              component: ProfileComponent
            }
          ]),
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatCarouselModule.forRoot(),
    ]
})
export class ProfileModule {
}
