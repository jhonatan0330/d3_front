import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { TokenInterceptor } from 'app/shared/interceptor/token.interceptor';

@NgModule({
    imports  : [
        HttpClientModule
    ],
    providers: [
        AuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
          }
    ]
})
export class AuthModule
{
}
