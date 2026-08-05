import { Pipe, PipeTransform } from '@angular/core';
import { LocalConstants, LocalStoreService } from './local-store.service';

// Helper function to reuse formatting logic in code
export function formatImageUrl(ls: LocalStoreService, url: string) {
  if (!url) return url;
  if (url.startsWith('www.')) {
    url = 'http://' + url;
  }
  if (!url.startsWith('http')) {
    url = (ls.getItem(LocalConstants.URL_CONF) || '') + '/files' + url;
  }
  return url;
}

@Pipe({
    name: 'imageFormat',
    standalone: false
})
export class ImageFormatPipe implements PipeTransform {
  constructor(private ls: LocalStoreService) { }
  transform(url: string) {
    return formatImageUrl(this.ls, url);
  }
}