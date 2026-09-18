import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocalConstants, LocalStoreService } from './local-store.service';

// Helper function to reuse formatting logic in code
export function formatImageUrl(ls: LocalStoreService, url: string | undefined) {
  if (!url) return url;
  if (url.startsWith('www.')) {
    url = 'http://' + url;
  }
  if (!url.startsWith('http')) {
    url = (ls.getItem(LocalConstants.URL_CONF) || '') + '/upload' + url;
  }
  return url;
}

/* resolvedUrl = computed(() => {
        const url = this.value();
        if (!url) return null;
        if (/^https?:\/\//i.test(url)) return url;
        const ruta = url.replace(/\\/g, '/');
        const path = ruta.startsWith('/') ? ruta : '/' + ruta;
        return this.ls.getUrlAccess('/upload').concat(path);
    });
    */

@Pipe({ name: 'imageFormat' })
export class ImageFormatPipe implements PipeTransform {
  private ls: LocalStoreService;

  constructor(ls?: LocalStoreService) {
    this.ls = ls ?? inject(LocalStoreService);
  }

  transform(url: string | undefined) {
    return formatImageUrl(this.ls, url);
  }
}