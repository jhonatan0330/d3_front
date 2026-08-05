import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { ContactsService } from '../contact.services';
import { PermisosDTO, RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { LoginService } from 'app/authentication/login.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Component({
    selector: 'contacts-details',
    templateUrl: 'detail_person.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ContactsDetailsComponent implements OnInit {


    public contact: UsuarioDTO = new UsuarioDTO();
    isSameUser: boolean;

    tags: RolAccesoFilterDTO[];
    permisos: PermisosDTO[];


    constructor(
        private _contactsService: ContactsService,
        @Inject(MAT_DIALOG_DATA) public data: { key: string; },
        private dialogRef: MatDialogRef<ContactsDetailsComponent>,
        public jwtAuth: LoginService,
        private utilService: UtilsService,

    ) { }

    ngOnInit(): void {


        this._contactsService.getContactById(this.data.key).subscribe((contact: UsuarioDTO) => {
            this.contact = contact;
            this.isSameUser = (this.jwtAuth.getUser().llaveTabla === contact.llaveTabla);
        });
    }


    trackByFn(index: number, item: any): any {
        return item.identificacion || index;
    }

    cerrar() {
        this.dialogRef.close();
    }

    abrirRol(tag: RolAccesoFilterDTO) {
        const componente = new PedidoVentaDTO;
        componente.llaveTabla = tag.codigo;
        componente.plantilla = tag.plantilla;
        componente.server = undefined;
        this.utilService.modalWithParams(componente);
    }

    buscartags() {
        this._contactsService.searchTagsById(this.data.key).subscribe({
            next: (_value: RolAccesoFilterDTO[]) => {
                this.tags = _value;
                //this.isLoading = false;

            },
            error: () => {
                // this.isLoading = false;
            }
        }

        );

    }

    buscarPermisos() {
        this._contactsService.searchPermisosById(this.data.key).subscribe({
            next: (_value: PermisosDTO[]) => {
                this.permisos = _value;
                this.filtroActivo = null; // limpia el filtro al cargar nuevos permisos
            },
            error: () => {
                // Manejo de errores si es necesario
            },
        });
    }

    permisoColors: { [key: string]: string } = {
        'P': 'bg-blue-500 text-white',     // Proceso
        'A': 'bg-green-500 text-white',    // Estado
        'T': 'bg-yellow-500 text-black',   // Transición
        'L': 'bg-purple-500 text-white',   // Plantilla
        'C': 'bg-pink-500 text-white',     // Campo
        'E': 'bg-orange-500 text-white',   // Reporte
        'R': 'bg-teal-500 text-white',     // Rol
        'O': 'bg-red-500 text-white',      // Organización
        'W': 'bg-gray-700 text-white',     // API Service
        'S': 'bg-gray-500 text-white',     // Servidor
        'G': 'bg-indigo-500 text-white',   // Catalog
        'K': 'bg-lime-500 text-black'      // Account
    };

    permisoNames: { [key: string]: string } = {
        'P': 'Proceso',
        'A': 'Estado',
        'T': 'Transición',
        'L': 'Plantilla',
        'C': 'Campo',
        'E': 'Reporte',
        'R': 'Rol',
        'O': 'Organización',
        'W': 'API Service',
        'S': 'Servidor',
        'G': 'Catálogo',
        'K': 'Account'
    };
    // Filtro activo para mostrar solo ciertos permisos
    filtroActivo: string | null = null;

    // Devuelve los tipos de permisos únicos
    get tiposFiltrados(): string[] {
        return [...new Set((this.permisos || []).map((p) => p.tipo))];
    }

    // Devuelve los permisos según el filtro activo
    get permisosFiltrados(): PermisosDTO[] {
        if (!this.filtroActivo) return this.permisos || [];
        return this.permisos.filter((p) => p.tipo === this.filtroActivo);
    }

    // Cambia el filtro al hacer click en una etiqueta
    toggleFiltro(tipo: string): void {
        this.filtroActivo = this.filtroActivo === tipo ? null : tipo;
    }

    // Devuelve cuántos permisos hay por tipo
    contarPermisosPorTipo(tipo: string): number {
        return this.permisos.filter((p) => p.tipo === tipo).length;
    }


}


