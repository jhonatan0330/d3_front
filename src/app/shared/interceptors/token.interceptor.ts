import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private templateService: TemplateService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    let token  = this.templateService.getTokenConnection(req.url)
    let changedReq: HttpRequest<any>;
    if (token) {
      changedReq = req.clone({
        setHeaders: {
          Authorization: `${token}`,
        },
      });
    } else {
      changedReq = req;
    }
    this.convert(changedReq.body);
    return next.handle(changedReq).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.convertResponse(event.body);
        }
        return event;
      })
    );
  }

  isIsoDateString(value: any): boolean {
    if (!value) {
      return false;
    }
    if (value instanceof Date) {
      return true;
    }
    return false;
  }

  convert(body: any) {
    if (!body) {
      return body;
    }
    if (typeof body !== 'object') {
      return body;
    }
    for (const key of Object.keys(body)) {
      const value = body[key];
      if (this.isIsoDateString(value)) {
        body[key] = new Date(value)
          .toISOString()
          .replace('T', '@')
          .replace('Z', '-0000');
      } else {
        if (typeof value === 'object') {
          this.convert(value);
        }
      }
    }
  }

  convertResponse(body: any) {
    if (!body) {
      return body;
    }
    if (typeof body !== 'object') {
      return body;
    }
    for (const key of Object.keys(body)) {
      const value = body[key];
      if (this.isStringDate(value)) {
        body[key] = new Date(
          value.toString().replace('@', 'T').replace('-0000', 'Z')
        );
      } else {
        if (typeof value === 'object') {
          this.convertResponse(value);
        }
      }
    }
  }

  isStringDate(value: any): boolean {
    if (!value) {
      return false;
    }
    if (typeof value === 'string' && value.match(/\d*\-\d*\-\d*\@/g)) {
      return true;
    }
    return false;
  }
}
