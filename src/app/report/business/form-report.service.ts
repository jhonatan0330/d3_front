import { Injectable, inject } from '@angular/core';
import { ReporteBaseDTO } from 'app/document/document.types';
import { LocalStoreService } from 'app/shared/local-store.service';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({ providedIn: 'root' })
export class FormReportService {
  private ls = inject(LocalStoreService);
  private templateService = inject(TemplateService);

  buildReportUrl(reporte: ReporteBaseDTO, pKey: string): string {
    const serverUrl = (reporte.servidorUrl || this.ls.getUrlConf() || '').replace(/\/+$/, '');
    const tenantId = this.ls.getTenantId();
    const reportPath = '/report/generate';
    let url = serverUrl + reportPath + '?nombre=' + reporte.llaveTabla + '&P_KEY=' + pKey + '&P_TOKEN=' + this.ls.getJwtToken();
    if (tenantId) {
      url = url + '&P_TENANT_ID=' + encodeURIComponent(tenantId);
    }
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
