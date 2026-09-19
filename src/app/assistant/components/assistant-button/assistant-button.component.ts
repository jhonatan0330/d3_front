import {
    Component,
    inject,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { AssistantService } from 'app/assistant/business/assistant.service';
import { LoginService } from 'app/authentication/login.service';

@Component({
    selector: 'app-assistant-button',
    standalone: true,
    imports: [ 
        MatIconModule],
    templateUrl: './assistant-button.component.html',
    styleUrl: './assistant-button.component.scss',
})
export class AssistantButtonComponent  {

    readonly assistantService = inject(AssistantService);
    readonly loginService = inject(LoginService);

    onAssistantClick(): void {
        this.assistantService.togglePanel();
    }
}