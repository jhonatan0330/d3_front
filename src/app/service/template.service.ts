import { Injectable } from '@angular/core';
import {
  DocumentoPlantillaDTO,
  OrganizacionDTO,
  PropiedadDTO,
  RelacionInternaDTO,
} from 'app/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  template: DocumentoPlantillaDTO[] = [];
  templates$ = new BehaviorSubject<DocumentoPlantillaDTO[]>(this.template);
  private colores: PropiedadDTO[];
  private coloresOthers: PropiedadDTO[];
  
  conectionTemplates: OrganizacionDTO[];

  private tableros: PropiedadDTO[];
  private propiedadesConRelaciones: RelacionInternaDTO[];

  constructor() {}

  getTemplate(id: string, urlServer: string): DocumentoPlantillaDTO {
    if (!this.template) {
      return null;
    }
    let result = null;
    if(!urlServer){
      result = this.template.find((item) => id === item.llaveTabla);
    } else {
      if (this.conectionTemplates) {
        const org = this.conectionTemplates.find((itemOrg) => urlServer === itemOrg.servidorUrl);
        if (org) {
          result = org.plantillas.find((itemExternal) => id === itemExternal.llaveTabla);
        }
      }
    }
    return result;
  }

  setTemplates(value: DocumentoPlantillaDTO[]) {
    this.templates$.next(value);
    this.template = value;
    this.colores = null;
    this.getColor('');
  }

  getColor(stateId: string): string {
    if (!stateId || !this.template) {
      return null;
    }
    if (!this.colores) {
      // Cargo los colores
      this.colores = [];
      for (let x = 0; x < this.template.length; x++) {
        this.exploreTemplateColor(this.template[x], this.colores);
      }
    }
    const prop = this.colores.find(item => item.campo === stateId);
    if (prop) {
      return prop.valor;
    }
    if (!this.coloresOthers ) {
      if(this.conectionTemplates){
        this.coloresOthers = [];
        for (let i = 0; i < this.conectionTemplates.length; i++) {
          const element = this.conectionTemplates[i];
          if (element.plantillas) {
            for (let y = 0; y < element.plantillas.length; y++) {
              this.exploreTemplateColor(element.plantillas[y], this.coloresOthers);
            }
          }
        }
      } 
    }
    if ( this.coloresOthers) {
      const prop2 = this.coloresOthers.find(item => item.campo === stateId);
      if (prop2) {
        return prop2.valor;
      }
    }
    // No se porque se repirte tanto pero la cosa es que hay se mejora el color
    return null;
  }

  getUrl4Id (id: string): string {
    if(!id || !this.conectionTemplates) { return null; }
    const org = this.conectionTemplates.find(item => id === item.llaveTabla);
    if (org) {
      return org.servidorUrl;
    }
    return null;
  }

  private exploreTemplateColor(element: DocumentoPlantillaDTO, array: PropiedadDTO[]) {
    if (element.estados) {
      for (let y = 0; y < element.estados.length; y++) {
        const iEstado = element.estados[y];
        if (iEstado.propiedades) {
          const pColor =  PlantillaHelper.buscarPropiedad(
            iEstado.propiedades,
            PlantillaHelper.COLOR
          );
          if (pColor){
            array.push(pColor);
          }
        }
      }
    }
  }

  clear() {
    this.template = null;
    this.colores = null;
    this.tableros = null;
  }

  setTableros(value: PropiedadDTO[]) {
    this.tableros = value;
  }

  getTablero(id: string): PropiedadDTO{
    if (this.tableros && this.tableros.length !==0 ) {
      return this.tableros.find(x => x.llaveTabla === id);
    }
  }

  getProceso(id: string): DocumentoPlantillaDTO{
    if (this.template && this.template.length !==0 ) {
      return this.template.find(x => (!x.llaveTabla && x.proceso === id));
    }
  }

  addRelations(relations : RelacionInternaDTO []){
    if (!this.propiedadesConRelaciones) this.propiedadesConRelaciones = [];
    this.propiedadesConRelaciones = this.propiedadesConRelaciones.concat(relations);
  }

  getPropertyRelation(propiedad : string): RelacionInternaDTO []{
    if (!this.propiedadesConRelaciones) return;
    return this.propiedadesConRelaciones.filter(x => (x.propiedad && x.propiedad === propiedad));
  }
}
