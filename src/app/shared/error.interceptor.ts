import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../authentication/login.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private jwtAuth: LoginService,
    private templateService: TemplateService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error) => {
        let errorMessage = '';
        if (error.error &&  error.error.message) { // client-side error
          errorMessage = error.error.message;
          if (errorMessage.indexOf('CODE:caud_usuario') !== -1 || errorMessage.indexOf("Required request header 'Authorization'") !== -1) {
            this.jwtAuth.signout();
            this.templateService.clear();
          } else{
            let showButton = true;
            if(errorMessage.startsWith("ERROR: NOT_OK")) {
              errorMessage = errorMessage.replace("ERROR: NOT_OK","");
              showButton = false;
              const audio = new Audio();
              audio.src = 'assets/audio/incorrect.mp3';
              audio.load();
              audio.play();
            }
            Swal.fire({
              icon: 'error',
              title: errorMessage,
              showConfirmButton: showButton,
              text: error.error.detail
            });
          }
        } else { // backend error
          errorMessage = `Connection error: ${error.status} ${error.message}`;
          if (error.status === 404 && error.message.indexOf('assets/conf.xml') !== -1) {

          } else {
            Swal.fire({
              icon: 'info',
              title: 'Error de conexión',
              text: errorMessage
            });
          }
        }
        return throwError(errorMessage);
      })
    );
  }
}
