import { CurrencyPipe, DatePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  DocumentoPlantillaDTO,
  PedidoVentaDTO,
  PedidoVentaFilterDTO,
  ReporteBaseDTO,
} from 'app/document/document.types';
import { DocumentApi } from 'app/document/document.api';
import { FormReportService } from 'app/report/business/form-report.service';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { ImageFormatPipe } from 'app/shared/local-image';
import { MatIcon } from '@angular/material/icon';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-full min-h-0 min-w-0 flex-1' },
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatIcon,
    MatTooltip,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    ImageFormatPipe,
    DropdownComponent,
    DropdownItemComponent,
  ],
})
export class DocumentListComponent {
  private readonly api = inject(DocumentApi);
  private readonly reportService = inject(FormReportService);
  private readonly notificationCenter = inject(NotificationCenterService);
  private readonly templateService = inject(TemplateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plantilla = input<DocumentoPlantillaDTO | null>(null);
  readonly filtro = input<PedidoVentaFilterDTO | null>(null);
  readonly viewMode = model<'grid-view' | 'list-view'>('grid-view');
  readonly hasCreatePermission = input(false);
  readonly drawerOpened = input(true);
  readonly embedded = input(false);
  readonly subtitle = input<string | null>(null);

  readonly refreshRequested = output<void>();
  readonly createRequested = output<void>();
  readonly diagramRequested = output<void>();
  readonly filterToggleRequested = output<void>();
  readonly documentSelected = output<PedidoVentaDTO>();
  readonly backRequested = output<void>();
  readonly closeRequested = output<void>();
  readonly loadingChange = output<boolean>();

  readonly defaultTemplateLogo = 'assets/images/logo/dark_264x264.png';
  readonly dataProvider = signal<PedidoVentaDTO[]>([]);
  readonly isLoading = signal(false);
  readonly isEnd = signal(false);
  readonly hasError = signal(false);
  readonly pagina = signal(1);
  readonly pageControl = new FormControl('30', { nonNullable: true });
  readonly selection = new SelectionModel<PedidoVentaDTO>(true, []);
  readonly displayedColumns = computed(() => {
    const plantilla = this.plantilla();
    if (!plantilla) {
      return [];
    }

    const columns: string[] = [];
    if (plantilla.reportes?.length) {
      columns.push('select');
    }
    columns.push('nombre');
    if (!PlantillaHelper.isEmpty(plantilla.propiedades, PlantillaHelper.FORM_DESCRIPCION)) {
      columns.push('descripcion');
    }
    columns.push('estadoExpediente', 'fecha');
    if (!PlantillaHelper.isEmpty(plantilla.propiedades, PlantillaHelper.FORM_TOTAL)) {
      columns.push('valor');
    }
    columns.push('detalles');
    if (plantilla.reportes?.length) {
      columns.push('acciones');
    }
    return columns;
  });

  private lastSelectedSegmentRow: PedidoVentaDTO | null = null;
  private requestId = 0;

  constructor() {
    effect(() => {
      const plantilla = this.plantilla();
      const filtro = this.filtro();
      untracked(() => {
        if (plantilla && filtro) {
          this.loadPage(1, filtro, true);
        } else {
          this.clearResults();
        }
      });
    });
  }

  hasPlantillaImage(): boolean {
    return !!this.plantilla()?.imagen?.trim();
  }

  onPlantillaImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith('dark_264x264.png')) {
      img.src = this.defaultTemplateLogo;
    }
  }

  getColor(estado: string): string | null {
    return this.templateService.getColor(estado);
  }

  getColorFont(estado: string): string | null {
    return this.templateService.getColorFont(estado);
  }

  refresh(): void {
    if (this.embedded()) {
      const filtro = this.filtro();
      if (filtro) {
        this.loadPage(1, filtro, true);
      }
      return;
    }
    this.refreshRequested.emit();
  }

  loadMore(): void {
    const filtro = this.filtro();
    if (!filtro || this.isLoading() || this.isEnd()) {
      return;
    }
    this.loadPage(this.pagina(), filtro, false);
  }

  private loadPage(page: number, filtro: PedidoVentaFilterDTO, force: boolean): void {
    if (this.isLoading() && !force) {
      return;
    }

    const plantilla = this.plantilla();
    if (!plantilla) {
      return;
    }

    const requestId = ++this.requestId;
    const pageSize = Number(this.pageControl.value);
    const request = Object.assign(new PedidoVentaFilterDTO(), filtro);
    const templateId = request.plantilla || plantilla.llaveTabla;
    if (!templateId) {
      return;
    }
    request.plantilla = templateId;
    request.paginacionRegistroInicial = pageSize * (page - 1);
    request.paginacionRegistroFinal = pageSize;

    if (page === 1) {
      this.dataProvider.set([]);
      this.isEnd.set(false);
      this.selection.clear();
      this.lastSelectedSegmentRow = null;
      this.pagina.set(1);
    }
    this.hasError.set(false);
    this.isLoading.set(true);
    this.loadingChange.emit(true);

    this.api.listarDocumentos(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          if (requestId !== this.requestId) {
            return;
          }
          const result = rows ?? [];
          if (page === 1) {
            this.dataProvider.set(result);
          } else {
            this.dataProvider.update(previous => previous.concat(result));
          }
          if (result.length >= pageSize) {
            this.pagina.set(page + 1);
          } else {
            this.isEnd.set(true);
            this.pagina.set(1);
          }
          this.isLoading.set(false);
          this.loadingChange.emit(false);
        },
        error: () => {
          if (requestId !== this.requestId) {
            return;
          }
          this.hasError.set(true);
          this.isLoading.set(false);
          this.loadingChange.emit(false);
        },
      });
  }

  private clearResults(): void {
    this.requestId++;
    this.dataProvider.set([]);
    this.selection.clear();
    this.lastSelectedSegmentRow = null;
    this.pagina.set(1);
    this.isLoading.set(false);
    this.isEnd.set(false);
    this.hasError.set(false);
    this.loadingChange.emit(false);
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataProvider().length;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataProvider().forEach(row => this.selection.select(row));
    }
  }

  multipleSelect(event: MouseEvent, row: PedidoVentaDTO): void {
    if (event.shiftKey) {
      let start = this.lastSelectedSegmentRow
        ? this.dataProvider().findIndex(
          element => element.llaveTabla === this.lastSelectedSegmentRow?.llaveTabla,
        )
        : 0;
      let end = this.dataProvider().findIndex(element => element.llaveTabla === row.llaveTabla);

      if (start > end) {
        [start, end] = [end, start];
      }
      this.dataProvider().slice(start, end).forEach(document => this.selection.select(document));
    }
    this.lastSelectedSegmentRow = row;
  }

  checkboxLabel(row?: PedidoVentaDTO): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre}`;
  }

  showReport(reporte: ReporteBaseDTO, document: PedidoVentaDTO | null): void {
    if (!reporte) {
      return;
    }
    const baseUrl = this.reportService.buildReportUrl(reporte, document?.llaveTabla ?? '');

    if (this.selection.selected.length > 0) {
      let message = `Vas a imprimir ${this.selection.selected.length} documentos .`;
      if (this.selection.selected.length > 50) {
        message += `Lo haremos abriendo ${Math.ceil(this.selection.selected.length / 50)} pestañas en tu explorador, ¿estas deacuerdo?`;
      }
      this.notificationCenter.fire({
        title: 'Impresion de varios documentos',
        text: message,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, quiero continuar!',
        cancelButtonText: 'No, Paremos',
      }).then(result => {
        if (!result.isConfirmed) {
          return;
        }
        let keys = '';
        for (let index = 0; index < this.selection.selected.length; index++) {
          keys += `${this.selection.selected[index].llaveTabla};`;
          if ((index + 1) % 50 === 0) {
            window.open(`${baseUrl}&P_MULTIPLE=${keys}`, '_blank');
            keys = '';
          }
        }
        if (keys) {
          window.open(`${baseUrl}&P_MULTIPLE=${keys}`, '_blank');
        }
      });
      return;
    }
    window.open(baseUrl, '_blank');
  }
}
