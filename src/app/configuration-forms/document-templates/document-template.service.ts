import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { DocumentoPlantillaDTO, DocumentoPlantillaFilterDTO, DocumentoPlantillaCaracteristicaDTO, ReporteBaseDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class DocumentTemplateService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/document-templates';

    getTemplates(filter?: DocumentoPlantillaFilterDTO): Observable<DocumentoPlantillaDTO[]> {
        const payload = {
            estado: filter?.estado || 'A',
            nombre: filter?.nombre || '',
            consecutivo: filter?.consecutivo || '',
            imagen: filter?.imagen || '',
            color: filter?.color || '',
            codigo: filter?.codigo || '',
            server: filter?.server || '',
            proceso: filter?.proceso || '',
            paginacionRegistroInicial: filter?.paginacionRegistroInicial || 0,
            paginacionRegistroFinal: filter?.paginacionRegistroFinal || 50
        };
        return this.http.post<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getTemplateById(key: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    getAdminTemplates(): Observable<DocumentoPlantillaDTO[]> {
        const payload = { estado: 'A' };
        return this.http.post<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/admin`, undefined),
            payload
        );
    }

    createTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined),
            template
        );
    }

    updateTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined),
            template
        );
    }

    inactivateTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/inactivate`, undefined),
            template
        );
    }

    duplicateTemplate(templateKey: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/duplicate`, undefined),
            {}
        );
    }

    getTemplateFields(templateKey: string): Observable<DocumentoPlantillaCaracteristicaDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<DocumentoPlantillaCaracteristicaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/fields`, undefined),
            payload
        );
    }

    getFieldById(key: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${key}`, undefined),
            {}
        );
    }

    createField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields`, undefined),
            field
        );
    }

    updateField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${field.llaveTabla}`, undefined),
            field
        );
    }

    inactivateField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${field.llaveTabla}/inactivate`, undefined),
            field
        );
    }

    getTemplateFieldsComplete(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/fields-complete`, undefined),
            template
        );
    }

    // Reportes
    getTemplateReports(templateKey: string): Observable<ReporteBaseDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<ReporteBaseDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/reports`, undefined),
            payload
        );
    }

    getReportById(key: string): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${key}`, undefined),
            {}
        );
    }

    createReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports`, undefined),
            report
        );
    }

    updateReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${report.llaveTabla}`, undefined),
            report
        );
    }

    inactivateReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${report.llaveTabla}/inactivate`, undefined),
            report
        );
    }
}