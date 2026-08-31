import { Injectable, inject } from '@angular/core';
import { ReporteBaseDTO } from 'app/document/model/sw42.domain';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({ providedIn: 'root' })
export class FormReportService {
  private ls = inject(LocalStoreService);
  private templateService = inject(TemplateService);

  buildReportUrl(reporte: ReporteBaseDTO, pKey: string): string {
    console.log(reporte);
    console.log(pKey);
    let serverUrl = reporte.servidorUrl;
    console.log(serverUrl);
    if (!serverUrl) {
      serverUrl = this.ls.getItem(LocalConstants.URL_CONF);
    }
    console.log(serverUrl);
    let url = serverUrl + '/reporte?nombre=' + reporte.llaveTabla + '&P_KEY=' + pKey + '&P_TOKEN=' + this.templateService.getTokenConnection(serverUrl);
    console.log(url);
    if (reporte.variables) {
      url = url + '&' + reporte.variables;
    }
  console.log(url);
    return url;
  }

  openReport(reporte: ReporteBaseDTO, pKey: string): void {
    if (!reporte) { return; }
    window.open(this.buildReportUrl(reporte, pKey), '_blank');
  }

  filterByState(reports: ReporteBaseDTO[], estadoExpediente: string | undefined): ReporteBaseDTO[] {
    if (!reports || reports.length === 0) { return []; }
    return reports.filter(reporte => {
      const propVisibleState = PlantillaHelper.buscarValorMultiple(reporte.propiedades, PlantillaHelper.REP_VISIBLE_STATE);
      return !propVisibleState || !estadoExpediente || propVisibleState.some(x => x.valor === estadoExpediente);
    });
  }
}
