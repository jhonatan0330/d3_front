import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DocumentoPlantillaDTO, PedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CrudsService {


  private _plantilla: BehaviorSubject<DocumentoPlantillaDTO> = new BehaviorSubject(null);
  private _dataProvider: BehaviorSubject<PedidoVentaDTO[]> = new BehaviorSubject(null);
  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------
  /**
   * Getter for folders
   */
  get plantilla$(): Observable<DocumentoPlantillaDTO> {
    return this._plantilla.asObservable();
  }

    /**
   * Getter for folders
   */
    get dataProvider$(): Observable<PedidoVentaDTO[]> {
      return this._dataProvider.asObservable();
    }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------


}
