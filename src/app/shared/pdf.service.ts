// pdf.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfService {

  private url = 'http://piopollo.softwareparati.com/reporte?nombre=dced80a3f26647b4b7f1d316cf56756b&P_KEY=2dbe67f93eff40df9827cde7023bf181&P_TOKEN=1e00b7b059cf41f49e5dab34b527295f';

  constructor(private http: HttpClient) {}

  obtenerPdf(params?: any) {
    return this.http.get(this.url, {
      responseType: 'blob',
      params
    });
  }
}
