import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from 'app/authentication/login.service';

@Component({
    selector: 'tasks',
    templateUrl: './tasks.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet]
})
export class TasksComponent implements OnInit{
    constructor(
        private _jwt: LoginService,
        private _router: Router
    ) {
    }
    ngOnInit(): void {

        if (!this._jwt.validateAccessModule('tasks')) {
            this._router.navigate(['/main']);
            return;
        }
    }
}
