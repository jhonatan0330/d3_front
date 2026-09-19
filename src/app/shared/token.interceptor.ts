import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { map } from 'rxjs';
import { TemplateService } from 'app/document/service/template.service';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const templateService = inject(TemplateService);
  const localStore = inject(LocalStoreService);

  const token = templateService.getTokenConnection(req.url);
  const setHeaders: Record<string, string> = {};
  if (token && !req.url.includes('openrouter.ai')) {
    setHeaders['Authorization'] = `${token}`;
  }
  const tenantId = localStore.getItem(LocalConstants.TENANT_ID);
  if (tenantId && !req.url.includes('/multi-tenancy')) {
    setHeaders['X-Tenant-ID'] = `${tenantId}`;
  }
  const changedReq = Object.keys(setHeaders).length > 0
    ? req.clone({ setHeaders })
    : req;
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
