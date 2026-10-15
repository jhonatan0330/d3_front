import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ImageFormatPipe } from 'app/shared/local-image';
import { RecentDocumentEntry } from 'app/shared/local-store.service';
import { RecentDocumentsService } from '../../recent-documents.service';
import { UtilsService } from 'app/document/service/utils.service';
import { PedidoVentaDTO } from 'app/document/document.types';

@Component({
  selector: 'recent-documents-card',
  templateUrl: './recent-documents-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip, ImageFormatPipe]
})
export class RecentDocumentsCardComponent {

  private readonly recentDocumentsService = inject(RecentDocumentsService);
  private readonly utilsService = inject(UtilsService);

  readonly documents = this.recentDocumentsService.documents;

  private readonly failedIcons = new Set<string>();

  iconFailed(llaveTabla: string): boolean {
    return this.failedIcons.has(llaveTabla);
  }

  onIconError(doc: RecentDocumentEntry): void {
    this.failedIcons.add(doc.llaveTabla);
  }

  openDocument(doc: RecentDocumentEntry): void {
    if (!doc.plantillaKey) { return; }
    const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
    pedidoVenta.plantilla = doc.plantillaKey;
    pedidoVenta.llaveTabla = doc.llaveTabla;
    this.utilsService.modalWithParams(pedidoVenta, true);
  }

  relativeTime(date: string): string {
    const timestamp = new Date(date).getTime();
    if (isNaN(timestamp)) { return ''; }
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) { return 'ahora'; }
    if (diffMin < 60) { return `hace ${diffMin} min`; }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) { return `hace ${diffHours} h`; }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) { return `hace ${diffDays} d`; }
    return new Date(date).toLocaleDateString();
  }
}
