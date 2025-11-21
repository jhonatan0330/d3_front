import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import Swal from 'sweetalert2';
import { PedidoVentaDTO } from '../../../model/sw42.domain';
import { MatDialog } from '@angular/material/dialog';

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

  // Canvas y contexto (dentro del popup)
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private canvasInitialized = false;

  // Plano base
  baseImg = new Image();
  baseLoaded = false;

  // Lista renderizada de componentes
  items: RenderItem[] = [];

  // Controles UI
  nombreCtrl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.maxLength(120)],
  });
  valorTextCtrl = new FormControl<string>('', { nonNullable: true });

  // Drag
  private dragging: RenderItem | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Tamaños por defecto de ítems
  private defaultItemSize = 48;

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
      maxWidth: '95vw'
    });

    dialogRef.afterOpened().subscribe(() => {
      this.initCanvasIfNeeded();
      this.draw(); // pintamos con lo que ya exista (plano + items)
    });

    dialogRef.afterClosed().subscribe(() => {
      this.removeCanvasListeners();
      this.canvas = undefined;
      this.ctx = undefined;
      this.canvasInitialized = false;
    });
  }

  // ---------- Ciclo de vida ----------
  ngOnInit(): void {
    super.ngOnInit();

    // valorText (URL del plano) existente
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
    // El canvas no existe hasta que se abre el popup
  }

  ngOnDestroy(): void {
    this.removeCanvasListeners();
  }

  // ---------- Canvas init & listeners ----------
  private initCanvasIfNeeded(): void {
    if (this.canvasInitialized) return;

    // canvas está en el popup (overlay) → lo buscamos por id
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

    // Eventos canvas
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('dblclick', this.onDblClick);
    window.addEventListener('mouseup', this.onMouseUp);

    this.canvasInitialized = true;

    // Si quieres que el tamaño interno se adapte a la vista del dialog:
    this.syncCanvasSizeToView();
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
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  // ---------- Utilidad: coordenadas reales del canvas ----------
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
      const x = it.x;
      const y = it.y;
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
        this.ctx.fillStyle = '#111';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText(it.exp.nombre, x + 2, y - 4);
      }
    }
  }

  // ---------- Carga de base y componentes ----------
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
      const url = await this.uploadFile(file);
      this.data.valorText = url;
      this.valorTextCtrl.setValue(url);
      this.loadBaseFromUrl(url);
      this.avisarModificacion();
      Swal.fire('Éxito', 'Plano subido correctamente', 'success');
    } catch {
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
      const url = await this.uploadFile(file);
      const count = (this.data.expedientes?.length || 0) + 1;

      const nuevoExp: PedidoVentaDTO = {
        ...this.exp,
        llaveTabla: this.structure.llaveTabla,
        nombre: this.nombreCtrl.value.trim(),
        imagen: url,
        dinero: {
          ...(this.exp.dinero ?? { saldo: 0, valorTotal: 0 }),
          saldo: 30 + 5 * count,
          valorTotal: 30 + 5 * count
        }
      } as PedidoVentaDTO;

      if (!Array.isArray(this.data.expedientes)) this.data.expedientes = [];
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
    this.baseImg = new Image();
    this.baseImg.crossOrigin = 'anonymous';
    this.baseImg.onload = () => {
      this.baseLoaded = true;
      // si el canvas ya está inicializado, pintamos
      this.draw();
    };
    this.baseImg.onerror = () => {
      this.baseLoaded = false;
      Swal.fire('Error', 'No se pudo cargar el plano', 'error');
      this.draw();
    };
    this.baseImg.src = url;
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
      it.w = it.img.naturalWidth || this.defaultItemSize;
      it.h = it.img.naturalHeight || this.defaultItemSize;
      it.loaded = true;
      this.draw();
    };
    it.img.onerror = () => {
      it.loaded = false;
      this.draw();
    };
    if (exp.imagen) it.img.src = exp.imagen;
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
    if (idx !== -1) this.items.splice(idx, 1);

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

  // ---------- Upload helper ----------
  private async uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);

    // Aquí conectas tu ApiService real, por ahora mock local:
    return await new Promise<string>((resolve) => {
      const local = URL.createObjectURL(file);
      resolve(local);
    });
  }
}
