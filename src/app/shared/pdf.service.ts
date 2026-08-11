// pdf.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { config } from 'config';

@Injectable({ providedIn: 'root' })
export class PdfService {
  private http = inject(HttpClient);

  obtenerPdf(params?: Record<string, string | number | boolean>) {
    const url = config.reporte.url;
    const httpParams = new HttpParams()
      .set('nombre', 'dced80a3f26647b4b7f1d316cf56756b')
      .set('P_KEY', config.reporte.pKey)
      .set('P_TOKEN', config.reporte.pToken);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          httpParams.append(key, value);
        }
      }
    }
    return this.http.get(url, {
      responseType: 'blob',
      params: httpParams
    });
  }
}
