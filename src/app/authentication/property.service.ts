import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Observable } from 'rxjs';
import { PropiedadDTO, PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {
    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    selectedProperty: PropiedadDTO;
    selectedType: PropiedadValorDefinidoDTO;

    getProperties(type: string, field: string): Observable<PropiedadDTO[]> {
        return this.http.get<PropiedadDTO[]>(
            this.ls.getUrlAccess('/property/'+ type + '/' + field)
        );
    }

    getTypes(type: string, filter: string): Observable<PropiedadValorDefinidoDTO[]> {
        return this.http.get<PropiedadValorDefinidoDTO[]>(
            this.ls.getUrlAccess('/property/type/'+ type + '/' + filter)
        );
    }

    createProperty(property: PropiedadDTO): Observable<PropiedadDTO> {
        return this.http.post<PropiedadDTO>(this.ls.getUrlAccess('/property/'), property);
    }

    getProperty(key: string): Observable<PropiedadDTO> {
        return this.http.get<PropiedadDTO>(this.ls.getUrlAccess('/property/' + key));
    }
}