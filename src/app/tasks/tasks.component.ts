import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
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
    private _jwt = inject(LoginService);
    private _router = inject(Router);

    ngOnInit(): void {

        if (!this._jwt.validateAccessModule('tasks')) {
            this._router.navigate(['/main']);
            return;
        }
    }
}
