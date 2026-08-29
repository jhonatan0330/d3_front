import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { DocumentoPlantillaDTO, DocumentoPlantillaCaracteristicaDTO, ReporteBaseDTO, PropiedadDTO } from 'app/document/model/sw42.domain';

@Injectable({
    providedIn: 'root'
})
export class DocumentTemplateService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    private baseUrl = '/api/config/document-templates';

    getTemplate(key: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined),
            {}
        );
    }

    getTemplates(filter?: { estado?: string }): Observable<DocumentoPlantillaDTO[]> {
        const payload = { estado: filter?.estado || 'A' };
        return this.http.post<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined),
            payload
        );
    }

    getTemplateFields(templateKey: string): Observable<DocumentoPlantillaCaracteristicaDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<DocumentoPlantillaCaracteristicaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/fields`, undefined),
            payload
        );
    }

    getField(key: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
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

    getTemplateReports(templateKey: string): Observable<ReporteBaseDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<ReporteBaseDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/reports`, undefined),
            payload
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

    getTemplateProperties(templateKey: string): Observable<PropiedadDTO[]> {
        const payload = { estado: 'A', campo: templateKey };
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess('/api/config/properties/list', undefined),
            payload
        );
    }

    duplicateTemplate(templateKey: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/duplicate`, undefined),
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

    getTemplateFieldsComplete(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/fields-complete`, undefined),
            template
        );
    }
}