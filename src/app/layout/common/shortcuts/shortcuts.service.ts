import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { DocumentoPlantillaDTO } from 'app/model/sw42.domain';
import { TemplateService } from 'app/modules/admin/apps/bpm/template.service';

@Injectable({
    providedIn: 'root'
})
export class ShortcutsService
{
    private _shortcuts: ReplaySubject<DocumentoPlantillaDTO[]> = new ReplaySubject<DocumentoPlantillaDTO[]>(1);

    /**
     * Constructor
     */
    constructor(private _templateService: TemplateService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for shortcuts
     */
    get shortcuts$(): Observable<DocumentoPlantillaDTO[]>
    {
        return this._shortcuts.asObservable();
    }

    addTemplates(templates:DocumentoPlantillaDTO[]){
        this._templateService.setTemplates(templates);
        this._shortcuts.next(templates);
    }

}
