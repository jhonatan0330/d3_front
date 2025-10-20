import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatCarouselModule } from "@magloft/material-carousel";

import { SharedModule } from "app/shared/shared.module";
import { ProfileComponent } from "./profile/profile.component";
import { TemplateComponent } from "./profile/template/template.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatTableModule } from "@angular/material/table";
import { FuseNavigationModule } from "@fuse/components/navigation";
import { FuseScrollbarModule } from "@fuse/directives/scrollbar";
import { FuseScrollResetModule } from "@fuse/directives/scroll-reset";
import { IndicatorsComponent } from "app/indicators/indicatorsPag/indicators.component";

@NgModule({
    declarations: [
        TemplateComponent,
        ProfileComponent
    ],
    imports: [
        RouterModule.forChild([
            {
              path: '',
              component: ProfileComponent
            },
            {
              path: ':type',
              component: ProfileComponent
            },
            {
              path: ':type/:id',
              component: ProfileComponent
            }
          ]),

          MatDialogModule,
          MatDividerModule,

          MatMenuModule,
          MatTooltipModule,
          MatProgressBarModule,
          MatSelectModule,
          MatSidenavModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatTableModule,
          FuseNavigationModule,
          FuseScrollbarModule,
          FuseScrollResetModule,

        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatCarouselModule.forRoot(),
        IndicatorsComponent
    ]
})
export class ProfileModule {
}
