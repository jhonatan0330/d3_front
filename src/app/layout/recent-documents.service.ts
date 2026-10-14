import { Injectable, effect, inject, signal } from '@angular/core';
import { LocalStoreService, RecentDocumentEntry } from 'app/shared/local-store.service';
import { LayoutService } from './layout.service';

export const RECENT_DOCUMENTS_LIMIT = 10;

@Injectable({ providedIn: 'root' })
export class RecentDocumentsService {

  private readonly ls = inject(LocalStoreService);
  private readonly layoutService = inject(LayoutService);

  readonly documents = signal<RecentDocumentEntry[]>([]);

  constructor() {
    effect(() => {
      const user = this.layoutService.user();
      this.documents.set(user?.llaveTabla ? this.ls.getRecentDocuments(user.llaveTabla) : []);
    });
  }

  record(entry: Omit<RecentDocumentEntry, 'fecha'> & { fecha?: string }): void {
    const userId = this.layoutService.user()?.llaveTabla;
    if (!userId || !entry.llaveTabla) { return; }

    const newEntry: RecentDocumentEntry = {
      llaveTabla: entry.llaveTabla,
      nombre: entry.nombre,
      plantillaNombre: entry.plantillaNombre,
      plantillaIcon: entry.plantillaIcon,
      fecha: entry.fecha ?? new Date().toISOString(),
    };

    const current = this.documents().filter(doc => doc.llaveTabla !== newEntry.llaveTabla);
    const updated = [newEntry, ...current].slice(0, RECENT_DOCUMENTS_LIMIT);
    this.documents.set(updated);
    this.ls.setRecentDocuments(userId, updated);
  }
}
