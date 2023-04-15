import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "app/shared/shared.module";
import { VotarComponent } from "./votar/votar.component";
import { surveyRoutes } from "./survey.routing";



@NgModule({
    declarations: [
        VotarComponent
    ],
    imports: [
        RouterModule.forChild(surveyRoutes),
        SharedModule
    ]
})
export class SurveyModule {
}
