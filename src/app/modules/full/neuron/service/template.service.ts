import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  DocumentoPlantillaDTO,
  RelacionInternaDTO,
  RelacionInternaFilterDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { StatesEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PropiedadDTO } from 'app/shared/shared.domain';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';
import { NavigationService } from 'app/layout/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private ls = inject(LocalStoreService);
  private http = inject(HttpClient);
  private _navigationService = inject(NavigationService);

  private readonly _template = signal<DocumentoPlantillaDTO[]>([]);

  get template() {
    return this._template.asReadonly();
  }
  private colores: PropiedadDTO[] | null;

  private propiedadesConRelaciones: RelacionInternaDTO[];
  private _modules: PropiedadDTO[] | null;

  getTemplate(id: string, urlServer: string): DocumentoPlantillaDTO | null | undefined {
    const template = this.template();
    if (!template) { return null; }
    if (!urlServer) {
      return template.find((item) => id === item.llaveTabla) ?? null;
    }
    return null;
  }

  getTemplateOfProcess(processId: string): DocumentoPlantillaDTO[] | null {
    const template = this.template();
    if (!template) { return null; }
    return (Object.assign([] as DocumentoPlantillaDTO[], template)).filter(
      (item) => (item.proceso && item.proceso.toLowerCase().indexOf(processId.toLowerCase()) > -1)
    );
  }

  setTemplates(value: DocumentoPlantillaDTO[]) {
    this._template.set(value);
    this.colores = null;
    this.getColor('');
    const processToMenu: DocumentoPlantillaDTO[] = [];
    // Transform document to MenuItems
    value.forEach((element) => {
      if (!element.llaveTabla) {
        element.estado = 'T';
        processToMenu.push(element);
      }
    });
    this._navigationService.generate();
  }


  getColor(stateId: string): string | null {
    const template = this.template();
    if (!stateId || !template) {
      return null;
    }
    if (!this.colores) {
      // Cargo los colores
      this.colores = [];
      for (let x = 0; x < template.length; x++) {
        this.exploreTemplateColor(template[x], this.colores);
      }
    }
    const prop = this.colores.find(item => item.campo === stateId);
    if (prop) {
      return prop.valor;
    }
   
    // No se porque se repirte tanto pero la cosa es que hay se mejora el color
    return null;
  }

  private hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // function from https://stackoverflow.com/a/9733420/3695983                     
  private luminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
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
    if (color2.length != 7) { }

    const color1rgb = this.hexToRgb(color1)!;
    const color2rgb = this.hexToRgb(color2)!;

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
    this.colores = null;
    this.setTemplates([]);
    this._modules = null;
  }
  setModules(value: PropiedadDTO[]) {
    this._modules = value;
  }

  getProceso(id: string): DocumentoPlantillaDTO | undefined {
    const template = this.template();
    if (template && template.length !== 0) {
      return template.find(x => (!x.llaveTabla && (x.proceso === id || x.codigo === id)));
    }
  }

  addRelations(relations: RelacionInternaDTO[]) {
    if (!this.propiedadesConRelaciones) this.propiedadesConRelaciones = [];
    this.propiedadesConRelaciones = this.propiedadesConRelaciones.concat(relations);
  }

  getPropertyRelation(propiedad: string): RelacionInternaDTO[] | undefined {
    if (!this.propiedadesConRelaciones) return;
    return this.propiedadesConRelaciones.filter(x => (x.propiedad && x.propiedad === propiedad));
  }

  /*
  getOrFetchRelations(propiedad: string, urlServer: string): Observable<RelacionInternaDTO[]> {
    const cached = this.getPropertyRelation(propiedad);
    if (cached && cached.length > 0) {
      return of(cached);
    }
    const filtro: RelacionInternaFilterDTO = new RelacionInternaFilterDTO();
    filtro.estado = StatesEnum.ACTIVE;
    filtro.propiedad = propiedad;
    return this.http.post<RelacionInternaDTO[]>(
      this.ls.getUrlAccess('/template/getPropertyRelations', urlServer),
      filtro
    ).pipe(
      tap(relations => this.addRelations(relations))
    );
  }*/

    getOrFetchRelations(
  propiedad: string,
  urlServer: string
): Observable<RelacionInternaDTO[]> {

  const cached = this.getPropertyRelation(propiedad);

  if (cached && cached.length > 0) {
    return of(cached);
  }

  const filtro = new RelacionInternaFilterDTO();
  filtro.estado = StatesEnum.ACTIVE;
  filtro.propiedad = propiedad;

  return this.http.post<RelacionInternaDTO[]>(
    this.ls.getUrlAccess('/template/getPropertyRelations', urlServer),
    filtro
  ).pipe(
    map(relations => {

      if (!relations || relations.length === 0) {

        const ri = new RelacionInternaDTO();

        ri.propiedad = propiedad;
        ri.campo = 'FALSE';
        ri.plantilla = 'FALSE';
        ri.auxiliar = 'FALSE';

        relations = [ri];
      }

      return relations;
    }),

    tap(relations => this.addRelations(relations))
  );
}

  getTokenConnection(urlServer: string) {
    return this.ls.getItem(LocalConstants.JWT_TOKEN);
  }

}
