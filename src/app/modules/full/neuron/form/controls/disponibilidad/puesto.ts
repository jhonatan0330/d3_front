import { DetallePedidoVentaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ImageFormatPipe } from 'app/shared/local-image';

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
  detalle: DetallePedidoVentaDTO;

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
      } else {
        if (this.selected) {
          colorFill = 'green';
        }
      }

      if (colorFill) {
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillStyle = colorFill; // 'rgba(0, 255, 0, 0.3)'; CAMBIAAAR
        this.ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        this.ctx.globalAlpha = 1;
      }
      /*if (this.dto?.nombre) {
        const text = this.dto.nombre;
        const fontSize = 12 - this.ancho*this.alto/(this.ancho + text.length);
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';

        const centerX = this.x + this.ancho / 2;
        const centerY = this.y + this.alto / 2;

        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const bgWidth = textWidth + 2;
        const bgHeight = textWidth / text.length + 2;
        const bgX = centerX - bgWidth / 2;
        const bgY = centerY - bgHeight / 2;

        // Fondo para legibilidad
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

        this.ctx.fillStyle = '#111';
        this.ctx.fillText(text, centerX, centerY);
        // restaurar valores por defecto
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'alphabetic';
      }*/

    };
    render.onerror = () => {
      this.ancho = 10;
      this.alto = 10;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.x, this.y, 10, 10);
    }
  }

  onClick() {
    if (this.dto.llaveTabla) {
      this.utils.modalWithParams(this.dto);
    } else {
      if (!this.detalle) {
        this.selected = !this.selected;
        this.draw();
      }

    }
  }
}
