import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import {
    ConsecutivoDTO, ConsecutivoFilterDTO,
    MensajeDTO, MensajeFilterDTO,
    ProcesoTransicionAutomaticaDTO, ProcesoTransicionAutomaticaFilterDTO,
    DocumentoPlantillaDTO, DocumentoPlantillaFilterDTO, DocumentoPlantillaCaracteristicaDTO, ReporteBaseDTO,
    MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO,
    WebServiceDTO, WebServiceFilterDTO, WebServiceEjecucionDTO, WebServiceEjecucionFilterDTO,
    ServidorDTO, ServidorFilterDTO,
    OrganizacionDTO, OrganizacionFilterDTO,
    ProcesoDTO, ProcesoFilterDTO, ProcesoTransicionDTO, ProcesoTransicionFilterDTO,
} from 'app/document/model/sw42.domain';
import {
    PropiedadDTO, PropiedadCampoDTO, PropiedadValorDefinidoDTO, PropiedadValorDefinidoFilterDTO,
    RelacionInternaDTO, RelacionInternaFilterDTO,
} from 'app/shared/shared.domain';

@Injectable({ providedIn: 'root' })
export class ConsecutiveService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/consecutives';

    getConsecutivos(filter?: ConsecutivoFilterDTO): Observable<ConsecutivoDTO[]> {
        return this.http.post<ConsecutivoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getConsecutivoById(key: string): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    createConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), consecutivo
        );
    }

    updateConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), consecutivo
        );
    }

    inactivateConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${consecutivo.llaveTabla}/inactivate`, undefined), consecutivo
        );
    }

    assignConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${consecutivo.llaveTabla}/assign`, undefined), consecutivo
        );
    }
}

@Injectable({ providedIn: 'root' })
export class MessageService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/messages';

    getMessages(filter?: MensajeFilterDTO): Observable<MensajeDTO[]> {
        return this.http.post<MensajeDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getMessageById(key: string): Observable<MensajeDTO> {
        return this.http.post<MensajeDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    resendMessage(key: string): Observable<MensajeDTO> {
        return this.http.post<MensajeDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/resend`, undefined), {}
        );
    }
}

@Injectable({ providedIn: 'root' })
export class AutoTaskService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/auto-tasks';

    getAutoTasks(filter?: ProcesoTransicionAutomaticaFilterDTO): Observable<ProcesoTransicionAutomaticaDTO[]> {
        return this.http.post<ProcesoTransicionAutomaticaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getAutoTaskById(key: string): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    createAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), task
        );
    }

    updateAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), task
        );
    }

    inactivateAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${task.llaveTabla}/inactivate`, undefined), task
        );
    }

    scheduleAutoTask(key: string, programacion: { tipo: string; cron?: string; fecha?: Date }): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/schedule`, undefined), programacion
        );
    }

    executeAutoTask(key: string): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/execute`, undefined), {}
        );
    }
}

@Injectable({ providedIn: 'root' })
export class DocumentTemplateService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/document-templates';

    getTemplates(filter?: DocumentoPlantillaFilterDTO): Observable<DocumentoPlantillaDTO[]> {
        return this.http.post<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getTemplateById(key: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    getAdminTemplates(): Observable<DocumentoPlantillaDTO[]> {
        const payload = { estado: 'A' };
        return this.http.post<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/admin`, undefined), payload
        );
    }

    createTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), template
        );
    }

    updateTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), template
        );
    }

    inactivateTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/inactivate`, undefined), template
        );
    }

    duplicateTemplate(templateKey: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/duplicate`, undefined), {}
        );
    }

    getTemplateFields(templateKey: string): Observable<DocumentoPlantillaCaracteristicaDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<DocumentoPlantillaCaracteristicaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/fields`, undefined), payload
        );
    }

    getFieldById(key: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${key}`, undefined), {}
        );
    }

    getField(key: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.getFieldById(key);
    }

    getTemplateProperties(templateKey: string): Observable<PropiedadDTO[]> {
        const payload = { estado: 'A', campo: templateKey };
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess('/api/config/properties/list', undefined), payload
        );
    }

    inactivateProperty(property: PropiedadDTO): Observable<PropiedadDTO[]> {
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess('/api/config/properties/inactivate', undefined), property
        );
    }

    createField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields`, undefined), field
        );
    }

    updateField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${field.llaveTabla}`, undefined), field
        );
    }

    inactivateField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${field.llaveTabla}/inactivate`, undefined), field
        );
    }

    getTemplateFieldsComplete(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/fields-complete`, undefined), template
        );
    }

    getTemplateReports(templateKey: string): Observable<ReporteBaseDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<ReporteBaseDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/reports`, undefined), payload
        );
    }

    getReportById(key: string): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${key}`, undefined), {}
        );
    }

    createReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports`, undefined), report
        );
    }

    updateReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${report.llaveTabla}`, undefined), report
        );
    }

    inactivateReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${report.llaveTabla}/inactivate`, undefined), report
        );
    }
}

@Injectable({ providedIn: 'root' })
export class MessageTemplateService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/message-templates';

    getTemplates(filter?: MensajePlantillaCorreoFilterDTO): Observable<MensajePlantillaCorreoDTO[]> {
        return this.http.post<MensajePlantillaCorreoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getTemplateById(key: string): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    createTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), template
        );
    }

    updateTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), template
        );
    }

    inactivateTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/inactivate`, undefined), template
        );
    }
}

@Injectable({ providedIn: 'root' })
export class PropertyValueService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/property-values';

    getPropertyValues(filter?: PropiedadValorDefinidoFilterDTO): Observable<PropiedadValorDefinidoDTO[]> {
        return this.http.post<PropiedadValorDefinidoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getPropertyValueById(key: string): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    getByOrigen(origen: string, origenCategoria?: string): Observable<PropiedadValorDefinidoDTO[]> {
        const payload = { origen, origenCategoria: origenCategoria || '' };
        return this.http.post<PropiedadValorDefinidoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/by-origen`, undefined), payload
        );
    }

    createPropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), value
        );
    }

    updatePropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), value
        );
    }

    inactivatePropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${value.llaveTabla}/inactivate`, undefined), value
        );
    }
}

@Injectable({ providedIn: 'root' })
export class WebServiceConfigService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/web-services';

    getWebServices(filter?: WebServiceFilterDTO): Observable<WebServiceDTO[]> {
        return this.http.post<WebServiceDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getWebServiceById(key: string): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    createWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), ws
        );
    }

    updateWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), ws
        );
    }

    inactivateWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${ws.llaveTabla}/inactivate`, undefined), ws
        );
    }

    executeWebService(key: string, parametros: string): Observable<WebServiceEjecucionDTO> {
        return this.http.post<WebServiceEjecucionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/execute`, undefined), { parametros }
        );
    }

    getExecutions(filter?: WebServiceEjecucionFilterDTO): Observable<WebServiceEjecucionDTO[]> {
        return this.http.post<WebServiceEjecucionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/executions`, undefined), filter
        );
    }

    getExecutionsByWebService(webServiceKey: string): Observable<WebServiceEjecucionDTO[]> {
        return this.http.post<WebServiceEjecucionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${webServiceKey}/executions`, undefined), { estado: 'A' }
        );
    }
}

@Injectable({ providedIn: 'root' })
export class ServerService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/servers';

    getServidores(filter?: ServidorFilterDTO): Observable<ServidorDTO[]> {
        return this.http.post<ServidorDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getServidorById(key: string): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    createServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), server
        );
    }

    updateServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), server
        );
    }

    inactivateServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${server.llaveTabla}/inactivate`, undefined), server
        );
    }
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/organizations';

    getOrganizaciones(filter?: OrganizacionFilterDTO): Observable<OrganizacionDTO[]> {
        return this.http.post<OrganizacionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getOrganizacionById(key: string): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    getPrincipal(): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/principal`, undefined), {}
        );
    }

    createOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), org
        );
    }

    updateOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), org
        );
    }

    inactivateOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${org.llaveTabla}/inactivate`, undefined), org
        );
    }
}

@Injectable({ providedIn: 'root' })
export class ProcessService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/processes';

    getProcesses(filter?: ProcesoFilterDTO): Observable<ProcesoDTO[]> {
        return this.http.post<ProcesoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getProcessById(key: string): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`, undefined), {}
        );
    }

    getProcessTree(): Observable<ProcesoDTO[]> {
        const payload = { estado: 'A' };
        return this.http.post<ProcesoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/tree`, undefined), payload
        );
    }

    getProcessForGraph(key: string): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/graph`, undefined), {}
        );
    }

    createProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), process
        );
    }

    updateProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), process
        );
    }

    inactivateProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${process.llaveTabla}/inactivate`, undefined), process
        );
    }

    getTransitions(processKey: string): Observable<ProcesoTransicionDTO[]> {
        const payload = { estado: 'A', proceso: processKey };
        return this.http.post<ProcesoTransicionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${processKey}/transitions`, undefined), payload
        );
    }

    getTransitionById(key: string): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${key}`, undefined), {}
        );
    }

    createTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions`, undefined), transition
        );
    }

    updateTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${transition.llaveTabla}`, undefined), transition
        );
    }

    inactivateTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${transition.llaveTabla}/inactivate`, undefined), transition
        );
    }
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);
    private baseUrl = '/api/config/properties';

    getProperties(filter?: { campo?: string; estado?: string }): Observable<PropiedadDTO[]> {
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/list`, undefined), filter
        );
    }

    getPropertyById(key: string): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/by-id`, undefined), key
        );
    }

    createProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`, undefined), property
        );
    }

    updateProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`, undefined), property
        );
    }

    inactivateProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO[]> {
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/inactivate`, undefined), property
        );
    }

    getRelations(filter: RelacionInternaFilterDTO): Observable<RelacionInternaDTO[]> {
        return this.http.post<RelacionInternaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${filter.propiedad}/relations`, undefined), filter
        );
    }

    createRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${relation.propiedad}/relations/create`, undefined), relation
        );
    }

    updateRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${relation.propiedad}/relations/update`, undefined), relation
        );
    }

    inactivateRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${relation.propiedad}/relations/inactivate`, undefined), relation
        );
    }
}
