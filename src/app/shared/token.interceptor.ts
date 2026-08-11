import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const templateService = inject(TemplateService);

  const token = templateService.getTokenConnection(req.url);
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
  convert(changedReq.body);
  return next(changedReq).pipe(
    map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        convertResponse(event.body);
      }
      return event;
    })
  );
};

function isIsoDateString(value: any): boolean {
  if (!value) {
    return false;
  }
  if (value instanceof Date) {
    return true;
  }
  return false;
}

function convert(body: any) {
  if (!body) {
    return body;
  }
  if (typeof body !== 'object') {
    return body;
  }
  for (const key of Object.keys(body)) {
    const value = body[key];
    if (isIsoDateString(value)) {
      body[key] = new Date(value)
        .toISOString()
        .replace('T', '@')
        .replace('Z', '-0000');
    } else {
      if (typeof value === 'object') {
        convert(value);
      }
    }
  }
}

function convertResponse(body: any) {
  if (!body) {
    return body;
  }
  if (typeof body !== 'object') {
    return body;
  }
  for (const key of Object.keys(body)) {
    const value = body[key];
    if (isStringDate(value)) {
      body[key] = new Date(
        value.toString().replace('@', 'T').replace('-0000', 'Z')
      );
    } else {
      if (typeof value === 'object') {
        convertResponse(value);
      }
    }
  }
}

function isStringDate(value: any): boolean {
  if (!value) {
    return false;
  }
  if (typeof value === 'string' && value.match(/\d*\-\d*\-\d*\@/g)) {
    return true;
  }
  return false;
}
