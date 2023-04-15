import {
  DetallePedidoVentaDTO,
  DocumentoPlantillaCaracteristicaDTO,
  PedidoVentaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { ImageFormatPipe } from 'app/shared/local-image';
import { BehaviorSubject } from 'rxjs';
import { Puesto } from './puesto';
import { LocalStoreService } from 'app/shared/local-store.service';

export class Estructura {
  ubicaciones: Puesto[] = [];
  imagenFondo: string;
  ancho: number;
  alto: number;
  seleccionados: string;
  cantidad = 0;
  isEnabled = true;
  titulo: string;

  private _navItemSource = new BehaviorSubject<Puesto>(null);
  navItem$ = this._navItemSource.asObservable();

  constructor(
    private ctx: CanvasRenderingContext2D,
    private campo: DocumentoPlantillaCaracteristicaDTO,
    private multiple: boolean,
    private template: TemplateService,
    private utils: UtilsService,
    private ls: LocalStoreService
  ) {
    this.imagenFondo = campo.imagen;
    if (campo.documentos) {
      this.ubicaciones = [];
      for (let it = 0; it < campo.documentos.length; it++) {
        this.ubicaciones.push(new Puesto(this.ctx, template, utils, this.ls, campo.documentos[it]));
      }
    }
    this.ctx.canvas.onclick = (event) => {
      this.clickHandler(event);
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ancho, this.alto);
    const loadedImage = new Image();
    loadedImage.src = new ImageFormatPipe(this.ls).transform(this.imagenFondo);
    loadedImage.onload = () => {
      this.ctx.canvas.width = loadedImage.width;
      this.ctx.canvas.height = loadedImage.height;
      this.ancho = loadedImage.width;
      this.alto = loadedImage.height;
      this.ctx.drawImage(loadedImage, 0, 0);
      for (let index = 0; index < this.ubicaciones.length; index++) {
        this.ubicaciones[index].draw();
      }
      this.seleccionados = null;
      this.cantidad = 0;
    };
    loadedImage.onerror = () =>{
      this.ctx.canvas.width = 200;
      this.ctx.canvas.height = 200;
      this.ancho = 200;
      this.alto = 200;
      for (let index = 0; index < this.ubicaciones.length; index++) {
        this.ubicaciones[index].draw();
      }
      this.seleccionados = null;
      this.cantidad = 0;
    }
  }

  selectFromText(selectedText, products: DetallePedidoVentaDTO[]) {
    if (selectedText) {
      const puestosData = selectedText.split('-');
      for (let j = 0; j < puestosData.length; j++) {
        const iData = puestosData[j];
        if (iData.length !== 0) {
          for (let k = 0; k < this.ubicaciones.length; k++) {
            const componenteTexto = this.ubicaciones[k];
            if (componenteTexto.nombre === iData) {
              if (this.isEnabled) {
                componenteTexto.dto.llaveTabla = null;
              }
              componenteTexto.onClick();
              if(products){
                for (let p = 0; p < products.length; p++) {
                  const iProduct = products[p];
                  if(iProduct.nombre === componenteTexto.nombre){
                    componenteTexto.detalle = iProduct;
                    break;
                  }
                }
              }
              break;
            }
          }
        }
      }
    }
  }

  clickHandler(event: MouseEvent) {
    if (!this.isEnabled) { return; }
    for (let index = 0; index < this.ubicaciones.length; index++) {
      const element = this.ubicaciones[index];
      if (
        event.offsetX >= element.x &&
        event.offsetX < element.x + element.ancho
      ) {
        if (
          event.offsetY >= element.y &&
          event.offsetY < element.y + element.alto
        ) {
          if (!this.multiple) {
            this.clearUbicaciones();
          }
          element.onClick();
          this._navItemSource.next(element);
          break;
        }
      }
    }
  }

  reload(): PedidoVentaDTO[] {
    const result: PedidoVentaDTO[] = [];
    this.cantidad = 0;
    this.seleccionados = '';
    let map = new Map();
    for (let index = 0; index < this.ubicaciones.length; index++) {
      const element = this.ubicaciones[index];
      if (element.selected) {
        this.cantidad++;
        this.seleccionados = this.seleccionados + '-' + element.nombre;
        result.push(element.dto);
      } else {
        if (element.dto && element.dto.estadoNombre) { 
          if(map.get(element.dto.estadoNombre)) {
            map.set(element.dto.estadoNombre, map.get(element.dto.estadoNombre) + 1);
          } else {
            map.set(element.dto.estadoNombre, 1);
          }
        }
      }
    }
    if (map.size!==0){
      this.titulo = '';
      for (let entry of map.entries()) {
        this.titulo = this.titulo + entry[0] +  '  ' + entry[1] + ', ';
      }
    }
    return result;
  }

  clearUbicaciones() {
    for (let index = 0; index < this.ubicaciones.length; index++) {
      const element = this.ubicaciones[index];
      if(element.selected) { element.onClick(); }
    }
  }
}

/*render.onclick = (event) => {
          if (this.seleccionarComponente(event)) {
            if ( this.cantidad === 1) {
              // this.cerrarPlano();
            }
          }
        }*/
