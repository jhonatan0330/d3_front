import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
  HttpEvent,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { TemplateService } from 'app/modules/admin/apps/bpm/template.service';
import { JwtAuthService } from 'app/modules/admin/apps/bpm/jwt-auth.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private jwtAuth: JwtAuthService,
    private templateService: TemplateService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error) => {
        let errorMessage = '';
        if (error.error &&  error.error.message) { // client-side error
          errorMessage = error.error.message;
          Swal.fire({
            icon: 'error',
            title: errorMessage,
            text: error.error.detail
          });
          if (errorMessage.indexOf('CODE:caud_usuario') !== -1) {
            this.jwtAuth.signout();
            this.templateService.clear();
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
