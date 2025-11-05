import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationCenterService } from 'app/notification/notification-center.service';
import { LoginService } from '../authentication/login.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private jwtAuth: LoginService,
    private notificationCenter: NotificationCenterService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error) => {
        let errorMessage = '';
        if (error.error &&  error.error.message) { // client-side error
          errorMessage = error.error.message;
          if (errorMessage.indexOf('CODE:caud_usuario') !== -1 || errorMessage.indexOf("Required request header 'Authorization'") !== -1) {
            this.jwtAuth.signout();
          } else{
            if (errorMessage.indexOf('CODE:private_user') !== -1 || errorMessage.indexOf("Required request header 'Authorization'") !== -1) {
              this.jwtAuth.signout();
              //this.templateService.clear();
            } else{
              let showButton = true;
              if(errorMessage.indexOf("ERROR: NOT_OK")!==-1) {
                errorMessage = errorMessage.substring(errorMessage.indexOf("ERROR: NOT_OK") + "ERROR: NOT_OK".length);
                showButton = false;
                const audio = new Audio();
                audio.src = 'assets/audio/incorrect.mp3';
                audio.load();
                audio.play();
              }
              this.notificationCenter.error(errorMessage, error.error.detail);
            }
          }
        } else { // backend error
          errorMessage = `Connection error: ${error.status} ${error.message}`;
          if (error.status === 404 && error.message.indexOf('assets/conf.xml') !== -1) {

          } else {
            this.notificationCenter.info('Error de conexion', errorMessage);
          }
        }
        return throwError(errorMessage);
      })
    );
  }
}
