import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DocumentoPlantillaCaracteristicaDTO,
    DocumentoPlantillaDTO,
    RelacionInternaFilterDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import Swal from 'sweetalert2';
import { FlexService } from '../flex.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

interface Item {
    code: string;
    title: string;
    subtitle: string;
    llaveTabla: string;
}

@Component({
    selector: 'FlexComponent',
    standalone: true,
    templateUrl: 'flex.html',
    imports: [CommonModule]
})
export class FlexComponent implements OnInit {

    plantilla: DocumentoPlantillaDTO;
    fields: DocumentoPlantillaCaracteristicaDTO[];
    isLoading: boolean = false;

    campos: Item[] = [];
    propiedadesCampo: Item[] = [];
    propiedadesPlantilla: Item[] = [];
    reportes: Item[] = [];
    transiciones: Item[] = [];
    relaciones: Item[] = [];
    propiedadPlantillaSeleccionada: Item;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private flexService: FlexService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.flexService.getTemplate(this.data.template, null).subscribe((_returnedTemplate) => {
            this.plantilla = _returnedTemplate;
            this.isLoading = false;
            this.getFields();
        });
    }


    getFields() {
        this.isLoading = true;
        this.flexService.getFields(this.plantilla.llaveTabla).subscribe((_returnedFields) => {
            this.fields = _returnedFields;
            this.campos = this.fields.map(f => ({
                code: f.codigo,
                title: f.nombre,
                subtitle: f.objetivo,
                llaveTabla: f.llaveTabla
            }));
            this.isLoading = false;
        });
    }



    listarConsultaPropiedadPlantilla(): void {
        if (!this.plantilla) return;
        this.flexService.listarConsultaPropiedad(this.plantilla.llaveTabla, null)
            .subscribe(props => {
                this.propiedadesPlantilla = props.map(p => ({
                    code: p.propiedadValor,
                    title: p.nombre,
                    subtitle: p.motivo,
                    llaveTabla: p.llaveTabla
                }));
            });
    }

    onClickCampo(campoId: string) {
        this.utilsService.fieldModalFlex(campoId);
    }

    onPropiedadPlantillaClick(prop: Item) {
        this.propiedadPlantillaSeleccionada = prop;

        if (!this.plantilla) return;

        const filtro = new RelacionInternaFilterDTO();
        filtro.propiedad = prop.code;
        filtro.propiedadNombre = prop.title;
        filtro.plantilla = this.plantilla.llaveTabla;
        filtro.plantillaNombre = this.plantilla.nombre;
        filtro.campo = ''; // No aplica para propiedades de plantilla
        filtro.campoNombre = '';
        filtro.auxiliar = '';

        this.flexService.relacionesPropiedad(filtro, this.plantilla.server).subscribe({
            next: (rels) => {
                this.relaciones = rels.map(r => ({
                    code: r.llaveTabla,
                    title: r.propiedadNombre || '',
                    subtitle: r.auxiliar || '',
                    llaveTabla: r.llaveTabla
                }));
            },
            error: () => {
                this.relaciones = [];
                Swal.fire('Error', 'No se pudieron cargar las relaciones de la propiedad de plantilla.', 'error');
            }
        });
    }
}
