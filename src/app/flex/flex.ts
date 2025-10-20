import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    DocumentoPlantillaDTO,
    PedidoVentaDTO,
    PedidoVentaFilterDTO,
    RelacionInternaFilterDTO
} from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import Swal from 'sweetalert2';

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

    isDarkMode = false;
    plantilla: DocumentoPlantillaDTO;
    pedido: PedidoVentaDTO;
    pedidoBase: PedidoVentaDTO;
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
        private api: ApiService,
        private templateService: TemplateService,
    ) { }

    ngOnInit(): void {
        // 🌙 Recuperar modo oscuro
        const saved = localStorage.getItem('isDarkMode');
        this.isDarkMode = saved === '1';
        if (this.isDarkMode) document.documentElement.classList.add('dark');

        // Cargar plantilla inicial
        this.cargarPlantilla(this.data.template, this.data.server);
    }

    toggleDarkMode(): void {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark', this.isDarkMode);
        localStorage.setItem('isDarkMode', this.isDarkMode ? '1' : '0');
    }

    cargarPlantilla(plantillaId: string, urlServer: string): void {
        const dp: DocumentoPlantillaDTO = this.templateService.getTemplate(plantillaId, urlServer);
        console.log(dp);
        if (!dp) {
            Swal.fire('Autorización', 'No tienes permisos para ver este documento.', 'info');
            return;
        }

        if (!this.pedidoBase?.llaveTabla && PlantillaHelper.isEmpty(dp.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) {
            Swal.fire('Autorización', 'No tienes permisos para crear registros de este tipo de documento: ' + dp.nombre, 'info');
            return;
        }

        if (!dp.caracteristicas) {
            this.isLoading = true;
            this.api.obtenerCampos(plantillaId, dp.server).subscribe({
                next: (plantilla: DocumentoPlantillaDTO) => {
                    plantilla.server = dp.server;
                    this.isLoading = false;
                    this.plantilla = plantilla;

                    this.mapearCampos();

                    // Consultar documento si aplica
                    this.consultarDocumento(this.data.document);

                    // Propiedades de plantilla
                    this.listarConsultaPropiedadPlantilla();
                },
                error: () => this.isLoading = false
            });
        } else {
            this.plantilla = dp;

            this.mapearCampos();

            this.consultarDocumento(this.data.document);

            // Propiedades de plantilla
            this.listarConsultaPropiedadPlantilla();
        }
    }

    // 🔹 Mapear campos desde las caracteristicas de la plantilla
    private mapearCampos(): void {
        this.campos = this.plantilla.caracteristicas.map(c => ({
            code: c.codigo,
            title: c.nombre,
            subtitle: c.objetivo,
            llaveTabla: c.llaveTabla?.toString()
        }));
    }

    consultarDocumento(id: string): void {
        if (!id) return;
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.llaveTabla = id;
        this.api.consultarDocumento(entity, this.plantilla.server).subscribe({
            next: (pedido: PedidoVentaDTO) => {
                this.pedido = pedido;
                if (this.pedidoBase) this.pedido.messages = this.pedidoBase.messages;

                // Actualizar campos con valores reales del documento
                if (this.pedido.caracteristicas) {
                    this.campos = this.pedido.caracteristicas.map(c => ({
                        code: c.campoDTO?.codigo,
                        title: c.campoDTO?.nombre,
                        subtitle: c.campoDTO?.objetivo,
                        llaveTabla: c.llaveTabla?.toString()
                    }));
                }
            },
            error: () => Swal.fire('Error', 'No se pudo consultar el documento.', 'error')
        });
    }

    // 🔹 Consultar propiedades de plantilla al iniciar
    listarConsultaPropiedadPlantilla(): void {
        if (!this.plantilla) return;
        this.api.listarConsultaPropiedad(this.plantilla.llaveTabla, this.data.server)
            .subscribe(props => {
                this.propiedadesPlantilla = props.map(p => ({
                    code: p.propiedadValor,
                    title: p.nombre,
                    subtitle: p.texto,
                    llaveTabla: p.llaveTabla
                }));
            });
    }

    // 🔹 Click en un campo: extraemos propiedades de las caracteristicas
    onClickCampo(campoId: string) {
        const campo = this.plantilla.caracteristicas.find(c => c.llaveTabla === campoId);
        if (!campo) return;

        this.propiedadesCampo = (campo.propiedades || []).map(p => ({
            code: p.propiedadValor,
            title: p.nombre,
            subtitle: p.motivo || p.texto || '',
            llaveTabla: p.llaveTabla?.toString()
        }));

        // Limpiar selección de propiedad de plantilla y relaciones
        this.propiedadPlantillaSeleccionada = null;
        this.relaciones = [];
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

        this.api.relacionesPropiedad(filtro, this.plantilla.server).subscribe({
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
