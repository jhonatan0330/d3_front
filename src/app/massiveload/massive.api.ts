import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { MassiveParseResponse } from './domain/MassiveParseResponse';
import { PlantillaBaseResponse } from './domain/PlantillaBaseResponse';

@Injectable({
	providedIn: 'root'
})
export class MassiveApiService {

	private static TEMPLATE_ENDPOINT = '/massive-load/template';
	private static PARSE_ENDPOINT = '/massive-load/parse';

	private http = inject(HttpClient);
	private ls = inject(LocalStoreService);

	generarBasePlantilla(templateId: string, format: string): Observable<PlantillaBaseResponse> {
		return this.http.post<PlantillaBaseResponse>(
			this.ls.getUrlAccess(MassiveApiService.TEMPLATE_ENDPOINT),
			{ templateId, format }
		);
	}

	parseArchivo(file: File, templateId: string): Observable<MassiveParseResponse> {
		const formData = new FormData();
		formData.append('file', file);
		return this.http.post<MassiveParseResponse>(
			this.ls.getUrlAccess(MassiveApiService.PARSE_ENDPOINT),
			formData,
			{ params: { template: templateId } }
		);
	}
}