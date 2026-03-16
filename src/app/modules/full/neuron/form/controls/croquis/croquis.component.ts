import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

import { BaseComponent } from '../base/base.component';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { DocumentMessage, PedidoVentaDTO } from '../../../model/sw42.domain';
import { ApiErrorResponse } from '../../../model/sw42.utils';

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
  templateUrl: './croquis.component.html',
})
export class CroquisComponent extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy {

  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private canvasInitialized = false;

  // Plano base
  baseImg = new Image();
  baseLoaded = false;
  private baseNaturalWidth = 0;
  private baseNaturalHeight = 0;

  // Lista de componentes renderizados
  items: RenderItem[] = [];

  // Controles de la interfaz
  nombreCtrl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.maxLength(120)],
  });

  valorTextCtrl = new FormControl<string>('', { nonNullable: true });

  // Arrastre (drag)
  private dragging: RenderItem | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Tamaño por defecto de los ítems
  private readonly defaultItemSize = 24;

  // Plantilla base para nuevo componente (si es necesaria)
  exp: PedidoVentaDTO = {} as PedidoVentaDTO;

  constructor(
    private api: ApiService,
    private dialog: MatDialog
  ) {
    super();
  }

  // ---------- POPUP ----------
  openCroquisDialog(tpl: TemplateRef<any>): void {
    const dialogRef = this.dialog.open(tpl, {
      width: '900px',
      maxWidth: '95vw',
    });

    dialogRef.afterOpened().subscribe(() => {
      this.initCanvasIfNeeded();
      this.draw();
    });

    dialogRef.afterClosed().subscribe(() => {
      this.removeCanvasListeners();
      this.canvas = undefined;
      this.ctx = undefined;
      this.canvasInitialized = false;
    });
  }

  ngOnInit(): void {
    super.ngOnInit();

    // URL del plano existente
    if (this.data?.valorText) {
      this.valorTextCtrl.setValue(this.data.valorText);
    }

    // Cargar expedientes existentes
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
    // El canvas se obtiene cuando se abre el popup
  }

  ngOnDestroy(): void {
    this.removeCanvasListeners();
  }

  private initCanvasIfNeeded(): void {
    if (this.canvasInitialized) return;

    const canvas = document.getElementById('croquisCanvas') as HTMLCanvasElement | null;
    if (!canvas) {
      Swal.fire('Error', 'No se encontró el canvas del croquis', 'error');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      Swal.fire('Error', 'No se pudo inicializar el canvas', 'error');
      return;
    }

    this.canvas = canvas;
    this.ctx = ctx;

    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('dblclick', this.onDblClick);
    window.addEventListener('mouseup', this.onMouseUp);

    this.canvasInitialized = true;
    //  tamaño natural como resolución interna del canvas para que las coordenadas de los ítems sigan siendo consistentes.
    if (this.baseLoaded && this.baseNaturalWidth > 0 && this.baseNaturalHeight > 0) {
      this.canvas.width = this.baseNaturalWidth;
      this.canvas.height = this.baseNaturalHeight;
      this.canvas.style.width = '90%';
      this.canvas.style.height = 'auto';
    } else {
      this.syncCanvasSizeToView();
    }
  }

  private removeCanvasListeners(): void {
    if (!this.canvas) return;

    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('dblclick', this.onDblClick);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  private syncCanvasSizeToView(): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(rect.width));
    this.canvas.height = Math.max(1, Math.round(rect.height));
  }

  // ---------- coordenadas mouse en sistema del canvas ----------
  private getMousePos(ev: MouseEvent): { x: number; y: number } {
    if (!this.canvas) {
      return { x: 0, y: 0 };
    }

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (ev.clientX - rect.left) * scaleX;
    const y = (ev.clientY - rect.top) * scaleY;

    return { x, y };
  }

  // ---------- Render ----------
  private clear(): void {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private draw(): void {
    if (!this.canvas || !this.ctx) return;

    this.clear();

    // Plano base
    if (this.baseLoaded) {
      this.ctx.drawImage(this.baseImg, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#fafafa';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#999';
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText('Sin plano. Usa "Subir plano".', 12, 24);
    }

    // Componentes
    for (const it of this.items) {
      const { x, y } = it;
      const w = it.loaded ? it.w : this.defaultItemSize;
      const h = it.loaded ? it.h : this.defaultItemSize;

      if (it.loaded) {
        this.ctx.drawImage(it.img, x, y, w, h);
      } else {
        this.ctx.strokeStyle = '#444';
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.moveTo(x + w, y);
        this.ctx.lineTo(x, y + h);
        this.ctx.stroke();
      }

      if (it.exp?.nombre) {
        const text = it.exp.nombre;
        const fontSize = 12/w*2/text.length;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';

        const centerX = x + w / 2;
        const centerY = y + h / 2;

        this.ctx.fillStyle = '#111';
        this.ctx.fillText(text, centerX, centerY);
        // restaurar valores por defecto
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'alphabetic';
      }
    }
  }

  setBase(): void {
    if (!this.isEnabled) return;
    const input = document.getElementById('fileBaseInput') as HTMLInputElement | null;
    input?.click();
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

    const input = document.getElementById('fileItemInput') as HTMLInputElement | null;
    input?.click();
  }

  async onFileBaseChange(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    try {
      const url = (await this.uploadFile(file)).message;
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
      const url = (await this.uploadFile(file)).message;

      const count = (this.data.expedientes?.length || 0) + 1;

      const nuevoExp: PedidoVentaDTO = {
        ...this.exp,
        llaveTabla: this.structure.llaveTabla,
        nombre: this.nombreCtrl.value.trim(),
        imagen: url,
        dinero: {
          ...(this.exp.dinero ?? { saldo: 0, valorTotal: 0 }),
          saldo: 30 + 5 ,
          valorTotal: 30 + 5 ,
        },
      } as PedidoVentaDTO;

      if (!Array.isArray(this.data.expedientes)) {
        this.data.expedientes = [];
      }

      this.data.expedientes.push(nuevoExp);
      this.pushRenderItemFromExp(nuevoExp);
      this.nombreCtrl.setValue('');
      this.avisarModificacion();
      Swal.fire('Éxito', 'Componente agregado', 'success');
    } catch (e) {
      Swal.fire('Error', 'No se pudo subir el componente ' + e, 'error');
    }
  }

  private loadBaseFromUrl(url: string): void {
    this.baseLoaded = false;

    // Intentar cargar con CORS primero .
    const tryLoad = (useCors: boolean) => {
      const img = new Image();
      if (useCors) img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.baseImg = img;
        this.baseLoaded = true;
        // almacenar tamaño natural
        this.baseNaturalWidth = img.naturalWidth || img.width || 0;
        this.baseNaturalHeight = img.naturalHeight || img.height || 0;

        // Si el canvas ya está inicializado, establece su resolución interna al tamaño natural de la imagen
        if (this.canvas) {
          if (this.baseNaturalWidth > 0 && this.baseNaturalHeight > 0) {
            this.canvas.width = this.baseNaturalWidth;
            this.canvas.height = this.baseNaturalHeight;
            // Mantener ancho CSS responsivo
            this.canvas.style.width = '90%';
            this.canvas.style.height = 'auto';
          } else {
            this.syncCanvasSizeToView();
          }
        }

        this.draw();
      };

      img.onerror = (error) => {
        if (useCors) {
          // Reintentar sin CORS
          tryLoad(false);
          return;
        }

        console.error('Error cargando imagen', error, url);
        this.baseLoaded = false;
        Swal.fire('Error', 'No se pudo cargar el plano', 'error');
        this.draw();
      };

      img.src = url;
    };

    tryLoad(true);
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

    const loadItemImage = (url?: string) => {
      if (!url) return;

      const attempt = (useCors: boolean) => {
        const img = new Image();
        if (useCors) img.crossOrigin = 'anonymous';

        img.onload = () => {
          it.img = img;
          it.w = img.naturalWidth || this.defaultItemSize;
          it.h = img.naturalHeight || this.defaultItemSize;
          it.loaded = true;
          this.draw();
        };

        img.onerror = () => {
          if (useCors) {
            attempt(!false);
            return;
          }

          it.loaded = false;
          this.draw();
        };

        img.src = url;
      };

      attempt(!true);
    };

    if (exp.imagen) {
      loadItemImage(exp.imagen);
    }

    this.items.push(it);
    this.draw();
  }

  // ---------- Drag & Drop ----------
  private onMouseDown = (ev: MouseEvent) => {
    if (!this.isEnabled) return;

    const { x, y } = this.getMousePos(ev);
    const top = this.pickTopmost(x, y);
    if (!top) return;

    this.dragging = top;
    this.dragOffsetX = x - top.x;
    this.dragOffsetY = y - top.y;
  };

  private onMouseMove = (ev: MouseEvent) => {
    if (!this.dragging || !this.canvas) return;

    const { x, y } = this.getMousePos(ev);
    const nx = x - this.dragOffsetX;
    const ny = y - this.dragOffsetY;

    const w = this.dragging.loaded ? this.dragging.w : this.defaultItemSize;
    const h = this.dragging.loaded ? this.dragging.h : this.defaultItemSize;

    this.dragging.x = Math.max(0, Math.min(nx, this.canvas.width - w));
    this.dragging.y = Math.max(0, Math.min(ny, this.canvas.height - h));

    this.draw();
  };

  private onMouseUp = (_ev: MouseEvent) => {
    if (!this.dragging) return;

    if (!this.dragging.exp.dinero) {
      this.dragging.exp.dinero = { saldo: 0, valorTotal: 0 } as any;
    }

    this.dragging.exp.dinero.saldo = this.dragging.x;
    this.dragging.exp.dinero.valorTotal = this.dragging.y;

    this.dragging = null;
    this.avisarModificacion();
  };

  private onDblClick = (ev: MouseEvent) => {
    if (!this.isEnabled) return;

    const { x, y } = this.getMousePos(ev);
    const top = this.pickTopmost(x, y);
    if (!top) return;

    const idx = this.items.indexOf(top);
    if (idx !== -1) {
      this.items.splice(idx, 1);
    }

    if (Array.isArray(this.data.expedientes)) {
      const arr = this.data.expedientes as PedidoVentaDTO[];
      const i2 = arr.findIndex(e => e.llaveTabla === top.exp.llaveTabla);
      if (i2 !== -1) arr.splice(i2, 1);
    }

    this.draw();
    this.avisarModificacion();
    Swal.fire('Eliminado', 'Componente retirado', 'success');
  };

  private pickTopmost(x: number, y: number): RenderItem | null {
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

  // ---------- Guardado ----------
  guardar(): void {
    this.avisarModificacion();
    Swal.fire('Guardado', 'Posiciones guardadas correctamente', 'success');
  }

  private async uploadFile(file: File): Promise<ApiErrorResponse> {
    try {
      const resp = await firstValueFrom(this.api.uploadFile(file, null));
      return resp;
    } catch (error) {
      return error as ApiErrorResponse;
    }
  }
}
