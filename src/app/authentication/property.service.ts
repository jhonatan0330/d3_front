import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStoreService } from 'app/shared/local-store.service';
import { Observable } from 'rxjs';
import { PropiedadDTO, PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {

    selectedProperty: PropiedadDTO;
    selectedType: PropiedadValorDefinidoDTO;

    constructor(
        private http: HttpClient,
        private ls: LocalStoreService) {
    }

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