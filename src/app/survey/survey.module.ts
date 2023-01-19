import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseCardModule } from "@fuse/components/card";
import { SharedMaterialModule } from "app/shared/shared-material.module";
import { SharedModule } from "app/shared/shared.module";
import { VotarComponent } from "./votar/votar.component";
import { surveyRoutes } from "./survey.routing";



@NgModule({
    declarations: [
        VotarComponent
    ],
    imports: [
        RouterModule.forChild(surveyRoutes),
        SharedModule,
        SharedMaterialModule,        

    ]
})
export class SurveyModule {
}
