import { PedidoVentaDTO } from 'app/model/sw42.domain';
import { TemplateService } from 'app/service/template.service';
import { UtilsService } from 'app/service/utils.service';
import { ImageFormatPipe } from 'app/shared/pipes/local-image';
import { LocalStoreService } from 'app/shared/services/local-store.service';

export class Puesto {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  imagen: string;
  nombre: string;
  key: string;
  shape: number[][];
  selected = false;
  dto: PedidoVentaDTO;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private template: TemplateService,
    private utils: UtilsService,
    private ls: LocalStoreService,
    componente: PedidoVentaDTO
  ) {
    this.imagen = componente.imagen;
    this.x = componente.dinero.saldo;
    this.y = componente.dinero.valorTotal;
    this.key = componente.llaveTabla;
    this.nombre = componente.nombre;
    this.dto = componente;
    // componente.estado = null;
  }

  draw() {
    this.ctx.clearRect(this.x, this.y, this.ancho, this.alto);
    const render = new Image();
      render.src = new ImageFormatPipe(this.ls).transform(this.imagen);
      render.onload = () => {
        this.ctx.drawImage(render, this.x, this.y);
        this.ancho = render.width;
        this.alto = render.height;
        let colorFill;
        if (this.dto.llaveTabla) {
          colorFill = this.template.getColor(this.dto.estadoExpediente);
          if (!colorFill) { colorFill = 'green'; }
        }else{
          if (this.selected) {
            colorFill= 'green';
          }
        }
        
        if (colorFill) {
          this.ctx.fillStyle = colorFill;
          this.ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        }

      };
      render.onerror = () => {
        this.ancho = 10;
        this.alto = 10;
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.x,this.y,10,10);
      }
  }

  onClick() {
    if (this.dto.llaveTabla) {
      this.utils.modalWithParams(this.dto);
    } else{
      this.selected = !this.selected;
      this.draw();
    }
  }
}
