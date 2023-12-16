import { Injectable } from '@angular/core';
import {
  DocumentoPlantillaDTO,
  RelacionInternaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BehaviorSubject } from 'rxjs';
import { clone } from 'lodash';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { OrganizacionDTO } from 'app/authentication/authentication.domain';

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

  constructor(
    private ls: LocalStoreService
  ) { }

  getTemplate(id: string, urlServer: string): DocumentoPlantillaDTO {
    if (!this.template) { return null; }
    let result = null;
    if (!urlServer) {
      result = this.template.find((item) => id === item.llaveTabla);
    } else {
      if (this.conectionTemplates) {
        const org = this.conectionTemplates.find((itemOrg) => urlServer === itemOrg.llaveTabla);
        if (org) {
          result = org.plantillas.find((itemExternal) => id === itemExternal.llaveTabla);
        }
      }
    }
    return result;
  }

  setOtherSystems(value: OrganizacionDTO[])  {
    this.conectionTemplates = value;
    this.ls.setItem(LocalConstants.SERVERS, value);
  }


  getTemplateOfProcess(processId: string): DocumentoPlantillaDTO[] {
    if (!this.template) { return null; }
    return Object.assign([], this.template).filter(
      (item) => (item.proceso && item.proceso.toLowerCase().indexOf(processId.toLowerCase()) > -1)
    );
  }

  setTemplates(value: DocumentoPlantillaDTO[]) {
    this.template = value;
    this.templates$.next(value);
    this.colores = null;
    this.getColor('');
  }

  addTemplatesFromOtherSystems() {
    if(!this.conectionTemplates) {return;}
    let allTemplates = clone(this.template);
    for (let i = 0; i < this.conectionTemplates.length; i++) {
      allTemplates = allTemplates.concat(clone(this.conectionTemplates[i].plantillas));
    }
    this.templates$.next(allTemplates);

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
    if (!this.coloresOthers) {
      if (this.conectionTemplates) {
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
    if (this.coloresOthers) {
      const prop2 = this.coloresOthers.find(item => item.campo === stateId);
      if (prop2) {
        return prop2.valor;
      }
    }
    // No se porque se repirte tanto pero la cosa es que hay se mejora el color
    return null;
  }

  private hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // function from https://stackoverflow.com/a/9733420/3695983                     
  private luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
        ? v / 12.92
        : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  getColorFont(stateId: string): string {
    const color1 = '#ffffff';
    const color3 = '#000000'; //Black
    const color2 = this.getColor(stateId);
    if (!color2) return color3;
    // read the colors and transform them into rgb format
    if(color2.length!=7) { console.log('Color incorrecto' + color2);   }

    const color1rgb = this.hexToRgb(color1);
    const color2rgb = this.hexToRgb(color2);

    // calculate the relative luminance
    const color1luminance = this.luminance(color1rgb.r, color1rgb.g, color1rgb.b);
    const color2luminance = this.luminance(color2rgb.r, color2rgb.g, color2rgb.b);

    // calculate the color contrast ratio
    const ratio = color1luminance > color2luminance
      ? ((color2luminance + 0.05) / (color1luminance + 0.05))
      : ((color1luminance + 0.05) / (color2luminance + 0.05));

    if (ratio < 1 / 3) {
      return color1;
    }
    return color3;

  }

  private exploreTemplateColor(element: DocumentoPlantillaDTO, array: PropiedadDTO[]) {
    if (element.estados) {
      for (let y = 0; y < element.estados.length; y++) {
        const iEstado = element.estados[y];
        if (iEstado.propiedades) {
          const pColor = PlantillaHelper.buscarPropiedad(
            iEstado.propiedades,
            PlantillaHelper.COLOR
          );
          if (pColor) {
            array.push(pColor);
          }
        }
      }
    }
  }

  clear() {
    this.templates$.next([]);
    this.template = null;
    this.colores = null;
    this.tableros = null;
  }

  setTableros(value: PropiedadDTO[]) {
    this.tableros = value;
  }

  getTablero(id: string): PropiedadDTO {
    if (this.tableros && this.tableros.length !== 0) {
      return this.tableros.find(x => x.llaveTabla === id);
    }
  }

  getProceso(id: string): DocumentoPlantillaDTO {
    if (this.template && this.template.length !== 0) {
      return this.template.find(x => (!x.llaveTabla && x.proceso === id));
    }
  }

  addRelations(relations: RelacionInternaDTO[]) {
    if (!this.propiedadesConRelaciones) this.propiedadesConRelaciones = [];
    this.propiedadesConRelaciones = this.propiedadesConRelaciones.concat(relations);
  }

  getPropertyRelation(propiedad: string): RelacionInternaDTO[] {
    if (!this.propiedadesConRelaciones) return;
    return this.propiedadesConRelaciones.filter(x => (x.propiedad && x.propiedad === propiedad));
  }

  getTokenConnection(urlServer: string) {
    if (this.conectionTemplates && urlServer) {
      for (let i = 0; i < this.conectionTemplates.length; i++) {
        const element = this.conectionTemplates[i];
        if (urlServer.indexOf(element.servidor) !== -1) {
          return element.token;
        }
      }
    }
    return this.ls.getItem(LocalConstants.JWT_TOKEN);
  }
}
