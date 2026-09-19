import { Injectable, inject } from '@angular/core';
import { ReporteBaseDTO } from 'app/document/document.types';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({ providedIn: 'root' })
export class FormReportService {
  private ls = inject(LocalStoreService);
  private templateService = inject(TemplateService);

  buildReportUrl(reporte: ReporteBaseDTO, pKey: string): string {
    const serverUrl = (reporte.servidorUrl || this.ls.getItem(LocalConstants.URL_CONF) || '').replace(/\/+$/, '');
    const tenantId = this.ls.getItem(LocalConstants.TENANT_ID);
    const reportPath = tenantId ? '/' + tenantId + '/report/generate' : '/report/generate';
    let url = serverUrl + reportPath + '?nombre=' + reporte.llaveTabla + '&P_KEY=' + pKey + '&P_TOKEN=' + this.templateService.getTokenConnection(serverUrl);
    if (reporte.variables) {
      url = url + '&' + reporte.variables;
    }
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
