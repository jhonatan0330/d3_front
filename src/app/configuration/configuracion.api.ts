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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getConsecutivoById(key: string): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    createConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), consecutivo
        );
    }

    updateConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), consecutivo
        );
    }

    inactivateConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${consecutivo.llaveTabla}/inactivate`), consecutivo
        );
    }

    assignConsecutivo(consecutivo: ConsecutivoDTO): Observable<ConsecutivoDTO> {
        return this.http.post<ConsecutivoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${consecutivo.llaveTabla}/assign`), consecutivo
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getMessageById(key: string): Observable<MensajeDTO> {
        return this.http.post<MensajeDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    resendMessage(key: string): Observable<MensajeDTO> {
        return this.http.post<MensajeDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/resend`), {}
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getAutoTaskById(key: string): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    createAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), task
        );
    }

    updateAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), task
        );
    }

    inactivateAutoTask(task: ProcesoTransicionAutomaticaDTO): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${task.llaveTabla}/inactivate`), task
        );
    }

    scheduleAutoTask(key: string, programacion: { tipo: string; cron?: string; fecha?: Date }): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/schedule`), programacion
        );
    }

    executeAutoTask(key: string): Observable<ProcesoTransicionAutomaticaDTO> {
        return this.http.post<ProcesoTransicionAutomaticaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/execute`), {}
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getTemplateById(key: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    getAdminTemplates(): Observable<DocumentoPlantillaDTO[]> {
        const payload = { estado: 'A' };
        return this.http.post<DocumentoPlantillaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/admin`), payload
        );
    }

    createTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), template
        );
    }

    updateTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), template
        );
    }

    inactivateTemplate(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/inactivate`), template
        );
    }

    duplicateTemplate(templateKey: string): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/duplicate`), {}
        );
    }

    getTemplateFields(templateKey: string): Observable<DocumentoPlantillaCaracteristicaDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<DocumentoPlantillaCaracteristicaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/fields`), payload
        );
    }

    getFieldById(key: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${key}`), {}
        );
    }

    getField(key: string): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.getFieldById(key);
    }

    getTemplateProperties(templateKey: string): Observable<PropiedadDTO[]> {
        const payload = { estado: 'A', campo: templateKey };
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess('/api/config/properties/list'), payload
        );
    }

    inactivateProperty(property: PropiedadDTO): Observable<PropiedadDTO[]> {
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess('/api/config/properties/inactivate'), property
        );
    }

    createField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields`), field
        );
    }

    updateField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${field.llaveTabla}`), field
        );
    }

    inactivateField(field: DocumentoPlantillaCaracteristicaDTO): Observable<DocumentoPlantillaCaracteristicaDTO> {
        return this.http.post<DocumentoPlantillaCaracteristicaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/fields/${field.llaveTabla}/inactivate`), field
        );
    }

    getTemplateFieldsComplete(template: DocumentoPlantillaDTO): Observable<DocumentoPlantillaDTO> {
        return this.http.post<DocumentoPlantillaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/fields-complete`), template
        );
    }

    getTemplateReports(templateKey: string): Observable<ReporteBaseDTO[]> {
        const payload = { estado: 'A', plantilla: templateKey };
        return this.http.post<ReporteBaseDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${templateKey}/reports`), payload
        );
    }

    getReportById(key: string): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${key}`), {}
        );
    }

    createReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports`), report
        );
    }

    updateReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${report.llaveTabla}`), report
        );
    }

    inactivateReport(report: ReporteBaseDTO): Observable<ReporteBaseDTO> {
        return this.http.post<ReporteBaseDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/reports/${report.llaveTabla}/inactivate`), report
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getTemplateById(key: string): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    createTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), template
        );
    }

    updateTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), template
        );
    }

    inactivateTemplate(template: MensajePlantillaCorreoDTO): Observable<MensajePlantillaCorreoDTO> {
        return this.http.post<MensajePlantillaCorreoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${template.llaveTabla}/inactivate`), template
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getPropertyValueById(key: string): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    getByOrigen(origen: string, origenCategoria?: string): Observable<PropiedadValorDefinidoDTO[]> {
        const payload = { origen, origenCategoria: origenCategoria || '' };
        return this.http.post<PropiedadValorDefinidoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/by-origen`), payload
        );
    }

    createPropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), value
        );
    }

    updatePropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), value
        );
    }

    inactivatePropertyValue(value: PropiedadValorDefinidoDTO): Observable<PropiedadValorDefinidoDTO> {
        return this.http.post<PropiedadValorDefinidoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${value.llaveTabla}/inactivate`), value
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getWebServiceById(key: string): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    createWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), ws
        );
    }

    updateWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), ws
        );
    }

    inactivateWebService(ws: WebServiceDTO): Observable<WebServiceDTO> {
        return this.http.post<WebServiceDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${ws.llaveTabla}/inactivate`), ws
        );
    }

    executeWebService(key: string, parametros: string): Observable<WebServiceEjecucionDTO> {
        return this.http.post<WebServiceEjecucionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/execute`), { parametros }
        );
    }

    getExecutions(filter?: WebServiceEjecucionFilterDTO): Observable<WebServiceEjecucionDTO[]> {
        return this.http.post<WebServiceEjecucionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/executions`), filter
        );
    }

    getExecutionsByWebService(webServiceKey: string): Observable<WebServiceEjecucionDTO[]> {
        return this.http.post<WebServiceEjecucionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${webServiceKey}/executions`), { estado: 'A' }
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getServidorById(key: string): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    createServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), server
        );
    }

    updateServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), server
        );
    }

    inactivateServidor(server: ServidorDTO): Observable<ServidorDTO> {
        return this.http.post<ServidorDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${server.llaveTabla}/inactivate`), server
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getOrganizacionById(key: string): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    getPrincipal(): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/principal`), {}
        );
    }

    createOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), org
        );
    }

    updateOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), org
        );
    }

    inactivateOrganizacion(org: OrganizacionDTO): Observable<OrganizacionDTO> {
        return this.http.post<OrganizacionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${org.llaveTabla}/inactivate`), org
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getProcessById(key: string): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}`), {}
        );
    }

    getProcessTree(): Observable<ProcesoDTO[]> {
        const payload = { estado: 'A' };
        return this.http.post<ProcesoDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/tree`), payload
        );
    }

    getProcessForGraph(key: string): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${key}/graph`), {}
        );
    }

    createProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), process
        );
    }

    updateProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), process
        );
    }

    inactivateProcess(process: ProcesoDTO): Observable<ProcesoDTO> {
        return this.http.post<ProcesoDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${process.llaveTabla}/inactivate`), process
        );
    }

    getTransitions(processKey: string): Observable<ProcesoTransicionDTO[]> {
        const payload = { estado: 'A', proceso: processKey };
        return this.http.post<ProcesoTransicionDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${processKey}/transitions`), payload
        );
    }

    getTransitionById(key: string): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${key}`), {}
        );
    }

    createTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions`), transition
        );
    }

    updateTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${transition.llaveTabla}`), transition
        );
    }

    inactivateTransition(transition: ProcesoTransicionDTO): Observable<ProcesoTransicionDTO> {
        return this.http.post<ProcesoTransicionDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/transitions/${transition.llaveTabla}/inactivate`), transition
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
            this.ls.getUrlAccess(`${this.baseUrl}/list`), filter
        );
    }

    getPropertyById(key: string): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/by-id`), key
        );
    }

    createProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/create`), property
        );
    }

    updateProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/update`), property
        );
    }

    inactivateProperty(property: PropiedadCampoDTO): Observable<PropiedadDTO[]> {
        return this.http.post<PropiedadDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/inactivate`), property
        );
    }

    getRelations(filter: RelacionInternaFilterDTO): Observable<RelacionInternaDTO[]> {
        return this.http.post<RelacionInternaDTO[]>(
            this.ls.getUrlAccess(`${this.baseUrl}/${filter.propiedad}/relations`), filter
        );
    }

    createRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${relation.propiedad}/relations/create`), relation
        );
    }

    updateRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${relation.propiedad}/relations/update`), relation
        );
    }

    inactivateRelation(relation: RelacionInternaDTO): Observable<RelacionInternaDTO> {
        return this.http.post<RelacionInternaDTO>(
            this.ls.getUrlAccess(`${this.baseUrl}/${relation.propiedad}/relations/inactivate`), relation
        );
    }
}
