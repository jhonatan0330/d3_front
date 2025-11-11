import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import Swal from 'sweetalert2';
import { PedidoVentaDTO } from '../../../model/sw42.domain';


interface RenderItem {
  exp: PedidoVentaDTO;
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  loaded: boolean;
}

@Component({
  selector: 'app-croquis',
  templateUrl: './croquis.component.html'
})
export class CroquisComponent extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // Plano base
  baseImg = new Image();
  baseLoaded = false;

  // Lista renderizada de componentes
  items: RenderItem[] = [];

  // Controles UI
  nombreCtrl = new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(120)] });
  valorTextCtrl = new FormControl<string>('', { nonNullable: true });

  // archivos (ocultos en la plantilla)
  @ViewChild('fileBase', { static: true }) fileBaseRef!: ElementRef<HTMLInputElement>;
  @ViewChild('fileItem', { static: true }) fileItemRef!: ElementRef<HTMLInputElement>;

  // Drag
  private dragging: RenderItem | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Tamaños por defecto de ítems si no se conoce aún el tamaño de la imagen
  private defaultItemSize = 48;
  exp: PedidoVentaDTO;

  constructor(
    private api: ApiService
  ) {
    super();
  }

  // ---------- Ciclo de vida ----------
  ngOnInit(): void {
    super.ngOnInit();

    // Si venía un valorText (plano), lo guardamos en el control
    if (this.data?.valorText) {
      this.valorTextCtrl.setValue(this.data.valorText);
    }

    // Cargar expedientes existentes a capa de render
    if (Array.isArray(this.data?.expedientes)) {
      for (const exp of this.data.expedientes as PedidoVentaDTO[]) {
        this.pushRenderItemFromExp(exp);
      }
    }

    // Cargar imagen base si existe
    if (this.data?.valorText) {
      this.loadBaseFromUrl(this.data.valorText);
    }
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      Swal.fire('Error', 'No se pudo inicializar el canvas', 'error');
      return;
    }
    this.ctx = ctx;

    // Eventos canvas
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('dblclick', this.onDblClick);

    // Primer pintado
    this.draw();
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.removeEventListener('mousedown', this.onMouseDown);
      canvas.removeEventListener('mousemove', this.onMouseMove);
      canvas.removeEventListener('dblclick', this.onDblClick);
    }
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  // ---------- Render ----------
  private clear(): void {
    const c = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
  }

  private draw(): void {
    const c = this.canvasRef.nativeElement;
    this.clear();

    // Plano base
    if (this.baseLoaded) {
      this.ctx.drawImage(this.baseImg, 0, 0, c.width, c.height);
    } else {
      // fondo simple cuando no hay base
      this.ctx.fillStyle = '#fafafa';
      this.ctx.fillRect(0, 0, c.width, c.height);
      this.ctx.fillStyle = '#999';
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText('Sin plano. Usa "Subir plano".', 12, 24);
    }

    // Componentes
    for (const it of this.items) {
      const x = it.x;
      const y = it.y;
      const w = it.loaded ? it.w : this.defaultItemSize;
      const h = it.loaded ? it.h : this.defaultItemSize;

      if (it.loaded) {
        this.ctx.drawImage(it.img, x, y, w, h);
      } else {
        // marcador temporal mientras carga
        this.ctx.strokeStyle = '#444';
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.moveTo(x + w, y);
        this.ctx.lineTo(x, y + h);
        this.ctx.stroke();
      }

      // etiqueta opcional
      if (it.exp?.nombre) {
        this.ctx.fillStyle = '#111';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText(it.exp.nombre, x + 2, y - 4);
      }
    }
  }

  // ---------- Carga de base y componentes ----------
  setBase(): void {
    if (!this.isEnabled) return;
    this.fileBaseRef.nativeElement.click();
  }

  addComponente(): void {
    if (!this.isEnabled) return;
    if (!this.baseLoaded) {
      Swal.fire('Advertencia', 'Primero sube el plano', 'warning');
      return;
    }
    if (!this.nombreCtrl.value?.trim()) {
      Swal.fire('Advertencia', 'Escribe un nombre para el componente', 'warning');
      return;
    }
    this.fileItemRef.nativeElement.click();
  }

  async onFileBaseChange(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // limpia para poder volver a elegir el mismo archivo luego
    if (!file) return;

    try {
      const url = await this.uploadFile(file); // <<< ajusta a tu ApiService real
      this.data.valorText = url;
      this.valorTextCtrl.setValue(url);
      this.loadBaseFromUrl(url);
      this.avisarModificacion();
      Swal.fire('Éxito', 'Plano subido correctamente', 'success');
    } catch (e) {
      Swal.fire('Error', 'No se pudo subir el plano', 'error');
    }
  }

  async onFileItemChange(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!this.nombreCtrl.value?.trim()) {
      Swal.fire('Advertencia', 'Escribe un nombre para el componente', 'warning');
      return;
    }

    try {
      const url = await this.uploadFile(file); // <<< ajusta a tu ApiService real
      const count = (this.data.expedientes?.length || 0) + 1; // corregido: paréntesis

      this.exp.llaveTabla = this.structure.llaveTabla;
      this.exp.nombre = this.nombreCtrl.value.trim();
      this.exp.imagen = url;
      this.exp.dinero.saldo = 30 + 5 * count;
      this.exp.dinero.valorTotal = 30 + 5 * count;


      if (!Array.isArray(this.data.expedientes)) this.data.expedientes = [];
      this.data.expedientes.push(this.exp);
      this.pushRenderItemFromExp(this.exp);
      this.nombreCtrl.setValue('');
      this.avisarModificacion();
      Swal.fire('Éxito', 'Componente agregado', 'success');
    } catch (e) {
      Swal.fire('Error', 'No se pudo subir el componente'+e, 'error');
    }
  }

  private loadBaseFromUrl(url: string): void {
    this.baseLoaded = false;
    this.baseImg = new Image();
    this.baseImg.crossOrigin = 'anonymous';
    this.baseImg.onload = () => {
      this.baseLoaded = true;
      this.fitCanvasToBase(); // opcional: ajusta tamaño canvas al de la base
      this.draw();
    };
    this.baseImg.onerror = () => {
      this.baseLoaded = false;
      Swal.fire('Error', 'No se pudo cargar el plano', 'error');
      this.draw();
    };
    this.baseImg.src = url;
  }

  private fitCanvasToBase(): void {
    const c = this.canvasRef.nativeElement;
    // Si deseas ajustar el canvas al tamaño natural del plano, descomenta:
    // c.width = this.baseImg.naturalWidth;
    // c.height = this.baseImg.naturalHeight;
  }

  private pushRenderItemFromExp(exp: PedidoVentaDTO): void {
    const it: RenderItem = {
      exp,
      img: new Image(),
      x: Math.round(exp.dinero?.saldo ?? 40),
      y: Math.round(exp.dinero?.valorTotal ?? 40),
      w: this.defaultItemSize,
      h: this.defaultItemSize,
      loaded: false,
    };
    it.img.crossOrigin = 'anonymous';
    it.img.onload = () => {
      // Puedes mantener tamaño natural o forzar un tamaño fijo si prefieres
      it.w = it.img.naturalWidth || this.defaultItemSize;
      it.h = it.img.naturalHeight || this.defaultItemSize;
      it.loaded = true;
      this.draw();
    };
    it.img.onerror = () => {
      it.loaded = false; // deja placeholder
      this.draw();
    };
    if (exp.imagen) it.img.src = exp.imagen;
    this.items.push(it);
    this.draw();
  }

  // ---------- Drag & Drop en canvas ----------
  private onMouseDown = (ev: MouseEvent) => {
    if (!this.isEnabled) return;
    const { offsetX, offsetY } = ev;
    const top = this.pickTopmost(offsetX, offsetY);
    if (!top) return;
    this.dragging = top;
    this.dragOffsetX = offsetX - top.x;
    this.dragOffsetY = offsetY - top.y;
  };

  private onMouseMove = (ev: MouseEvent) => {
    if (!this.dragging) return;
    const { offsetX, offsetY } = ev;
    const nx = offsetX - this.dragOffsetX;
    const ny = offsetY - this.dragOffsetY;
    // límites simples dentro del canvas
    const c = this.canvasRef.nativeElement;
    const w = this.dragging.loaded ? this.dragging.w : this.defaultItemSize;
    const h = this.dragging.loaded ? this.dragging.h : this.defaultItemSize;
    this.dragging.x = Math.max(0, Math.min(nx, c.width - w));
    this.dragging.y = Math.max(0, Math.min(ny, c.height - h));
    this.draw();
  };

  private onMouseUp = (_ev: MouseEvent) => {
    if (!this.dragging) return;
    
    // Persistimos x/y en el expediente (como Flex: dinero.saldo / valorTotal)
    this.dragging.exp.dinero = this.dragging.exp.dinero ;
    this.dragging.exp.dinero.saldo = this.dragging.x;
    this.dragging.exp.dinero.valorTotal = this.dragging.y;
    this.dragging = null;
    this.avisarModificacion();
  };

  private onDblClick = (ev: MouseEvent) => {
    if (!this.isEnabled) return;
    const { offsetX, offsetY } = ev;
    const top = this.pickTopmost(offsetX, offsetY);
    if (!top) return;
    // Eliminar
    const idx = this.items.indexOf(top);
    if (idx !== -1) this.items.splice(idx, 1);
    // Remover del data.expedientes por llaveTabla
    if (Array.isArray(this.data.expedientes)) {
      const i2 = (this.data.expedientes as PedidoVentaDTO[]).findIndex(
        e => e.llaveTabla === top.exp.llaveTabla
      );
      if (i2 !== -1) (this.data.expedientes as PedidoVentaDTO[]).splice(i2, 1);
    }
    this.draw();
    this.avisarModificacion();
    Swal.fire('Eliminado', 'Componente retirado', 'success');
  };

  private pickTopmost(x: number, y: number): RenderItem | null {
    // Recorre al revés para “topmost”
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      const w = it.loaded ? it.w : this.defaultItemSize;
      const h = it.loaded ? it.h : this.defaultItemSize;
      if (x >= it.x && x <= it.x + w && y >= it.y && y <= it.y + h) {
        return it;
      }
    }
    return null;
  }

  // ---------- Guardado manual (opcional) ----------
  guardar(): void {
    // Ya se sincroniza en mouseup; este botón es por UX.
    this.avisarModificacion();
    Swal.fire('Guardado', 'Posiciones guardadas correctamente', 'success');
  }

  // ---------- Upload helper ----------
  private async uploadFile(file: File): Promise<string> {
    // Ajusta a tu ApiService real. Ejemplo usando FormData:
    const fd = new FormData();
    fd.append('file', file);
    // Si tienes un endpoint como /rest/uploadResponseString:
    // return await firstValueFrom(this.api.post<string>(`${this.urlServer}/rest/uploadResponseString`, fd));

    // Mock local para pruebas: devuelve un blob URL
    return await new Promise<string>((resolve) => {
      const local = URL.createObjectURL(file);
      resolve(local);
    });
  }
}
