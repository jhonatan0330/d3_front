import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from 'app/shared/interceptors/token.interceptor';
import { AuthenticationService } from './authentication.service';

@NgModule({
    imports  : [
        HttpClientModule
    ],
    providers: [
        AuthenticationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
          }
    ]
})
export class AuthenticationModule
{
}
