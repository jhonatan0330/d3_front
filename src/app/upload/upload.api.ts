import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { CargaArchivoDTO } from 'app/upload/domain/upload.types';

@Injectable({
    providedIn: 'root'
})
export class UploadService {

    private static UPLOAD_ENDPOINT = '/upload/upload';

    private http = inject(HttpClient);
    private ls = inject(LocalStoreService);

    subirArchivo(file: File): Observable<CargaArchivoDTO> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post<CargaArchivoDTO>(
            this.ls.getUrlAccess(UploadService.UPLOAD_ENDPOINT),
            formData
        );
    }
}