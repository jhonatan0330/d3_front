import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownComponent } from 'app/shared/components/dropdown/dropdown/dropdown.component';
import { DropdownItemComponent } from 'app/shared/components/dropdown/dropdown-item/dropdown-item.component';
import { MensajePlantillaCorreoDTO, MensajePlantillaCorreoFilterDTO } from 'app/document/document.types';
import { MessageTemplateService } from 'app/configuration/configuracion.api';
import { MessageTemplateFormComponent } from '../../message-templates/message-template-form/message-template-form.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-message-template-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        DropdownComponent,
        DropdownItemComponent
    ],
    templateUrl: './message-template-list.component.html',
})
export class MessageTemplateListComponent implements OnInit, AfterViewInit, OnDestroy {
    private templateService = inject(MessageTemplateService);
    private dialog = inject(MatDialog);
    @ViewChild('loadMoreTpl') loadMoreTplRef!: ElementRef<HTMLDivElement>;
    private tplObserver?: IntersectionObserver;

    private readonly pageSize = 25;

    tplLoading = signal(false);
    tplData = signal<MensajePlantillaCorreoDTO[]>([]);
    tplCurrentPage = signal(0);
    tplHasMore = signal(true);
    tplFilter: MensajePlantillaCorreoFilterDTO = {
        estado: 'A',
        nombre: '',
        servidor: '',
        paginacionRegistroInicial: 0,
        paginacionRegistroFinal: 25,
        filtroParametro: '',
        llaveTabla: '',
    };

    ngOnInit(): void {
        this.loadTplNext();
    }

    ngAfterViewInit(): void {
        this.tplObserver = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) this.loadTplNext(); });
        this.tplObserver.observe(this.loadMoreTplRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.tplObserver?.disconnect();
    }

    loadTplNext(): void {
        if (this.tplLoading() || !this.tplHasMore()) return;
        this.tplLoading.set(true);
        const f = this.tplFilter;
        f.paginacionRegistroInicial = this.tplCurrentPage() * this.pageSize;
        f.paginacionRegistroFinal = this.pageSize;
        this.templateService.getTemplates(f).subscribe({
            next: (res) => { this.tplData.update(items => [...items, ...res]); this.tplCurrentPage.update(p => p + 1); if (res.length < this.pageSize) this.tplHasMore.set(false); this.tplLoading.set(false); this.checkTplMore(); },
            error: () => this.tplLoading.set(false)
        });
    }

    private checkTplMore(): void {
        requestAnimationFrame(() => {
            if (this.tplLoading() || !this.tplHasMore() || this.tplData().length === 0) return;
            const rect = this.loadMoreTplRef.nativeElement.getBoundingClientRect();
            if (rect.top < window.innerHeight) this.loadTplNext();
        });
    }

    onTplFilterChange(): void { this.reload(); }

    reload(): void {
        this.tplCurrentPage.set(0);
        this.tplHasMore.set(true);
        this.tplData.set([]);
        this.loadTplNext();
    }

    openTemplateForm(item?: MensajePlantillaCorreoDTO): void {
        const dialogRef = this.dialog.open(MessageTemplateFormComponent, {
            width: '800px', maxWidth: '90vw', disableClose: true,
            data: item ? { ...item } : null
        });
        dialogRef.afterClosed().subscribe((result: MensajePlantillaCorreoDTO) => { if (result) this.reload(); });
    }

    toggleTemplateStatus(item: MensajePlantillaCorreoDTO): void {
        const newEstado = item.estado === 'A' ? 'I' : 'A';
        const action = newEstado === 'A' ? 'activar' : 'inactivar';
        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} plantilla?`,
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'Sí', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = { ...item, estado: newEstado };
                this.templateService.inactivateTemplate(updated).subscribe({
                    next: () => { Swal.fire('Éxito', `Plantilla ${action}da correctamente`, 'success'); this.reload(); },
                    error: () => Swal.fire('Error', `No se pudo ${action} la plantilla`, 'error')
                });
            }
        });
    }
}
