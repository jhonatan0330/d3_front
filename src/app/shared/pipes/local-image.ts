import { Pipe, PipeTransform } from '@angular/core';
import { LocalConstants, LocalStoreService } from 'app/shared/services/local-store.service';


@Pipe({ name: 'imageFormat' })
export class ImageFormatPipe implements PipeTransform {
  constructor(private ls: LocalStoreService) { }
  transform(url: string) {
    if(!url)return url;
		if(url.startsWith("www.")) {url = "http://" + url;}
		if(!url.startsWith("http")) { url = this.ls.getItem(LocalConstants.URL_CONF) + "/resource?nombre=" + url; }
		return url;
  }
}