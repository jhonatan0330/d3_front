import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ImageFormatPipe } from 'app/shared/local-image';
import { RecentDocumentEntry } from 'app/shared/local-store.service';
import { RecentDocumentsService } from '../../recent-documents.service';

@Component({
  selector: 'recent-documents-card',
  templateUrl: './recent-documents-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ImageFormatPipe]
})
export class RecentDocumentsCardComponent {

  private readonly recentDocumentsService = inject(RecentDocumentsService);

  readonly documents = this.recentDocumentsService.documents;

  private readonly failedIcons = new Set<string>();

  iconFailed(llaveTabla: string): boolean {
    return this.failedIcons.has(llaveTabla);
  }

  onIconError(doc: RecentDocumentEntry): void {
    this.failedIcons.add(doc.llaveTabla);
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
