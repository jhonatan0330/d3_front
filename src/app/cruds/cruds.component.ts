import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { DocumentoPlantillaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { StatesEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.filter';

@Component({
    selector     : 'cruds',
    templateUrl  : './cruds.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CrudsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public plantilla: DocumentoPlantillaDTO;

    private tableroId: string;
    private procesoId: string;

    private solicitarFechas = true;
    private hasCreatePermission = false;

    pagina = 1; // Indica que pagina estamos buscando
    cantidadPagina = 30; // Indica cuantos registros estamos buscando por pagina
    isLoading = false;
    isEnd = false;

    /**
     * Constructor
     */
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private api: ApiService,
        private templateService: TemplateService,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if ( matchingAliases.includes('md') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });
        this.startTemplateData();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    startTemplateData(){
        /*
        this.route.params.subscribe((params: Params) => {
            const propType = params.type;
            if (!propType) {
                this.router.navigate(['/main']);
                return;
            }
            const serverUrl = this.templateService.getUrl4Id(params.server_id);
            if (propType === 'list') {
                this.plantilla = this.templateService.getTemplate(params.id, serverUrl);
                if (!this.plantilla) {
                    this.router.navigate(['/main']);
                    return;
                }
            } else if (propType === 'process_crud') {
                this.procesoId = params.id;
                if (this.procesoId) {
                    this.plantilla = this.templateService.getProceso(this.procesoId);
                } else {
                    this.router.navigate(['/main']);
                    return;
                }
            } else if (propType === 'tablet') {
                this.tableroId = params.id;
                if (this.tableroId) {
                    const propTablero = this.templateService.getTablero(this.tableroId);
                    if (propTablero) {
                        this.plantilla = new DocumentoPlantillaDTO();
                        this.plantilla.nombre = propTablero.texto;
                        this.plantilla.imagen = propTablero.motivo;
                    } else {
                        this.router.navigate(['/main']);
                        return;
                    }
                }
            } else {
                this.router.navigate(['/main']);
                return;
            }
            // Obtener Variables
            this.solicitarFechas = !PlantillaHelper.isEmpty(
                this.plantilla.propiedades,
                PlantillaHelper.FORM_SOLICITAR_FECHAS
            );
            if (this.solicitarFechas) {
                this.fControlDateStart.setValue(new Date());
                this.fControlDateEnd.setValue(new Date());
            }
            this.hasCreatePermission = !PlantillaHelper.isEmpty(
                this.plantilla.propiedades,
                PlantillaHelper.PERMISO_PLANTILLA_CREAR
            );
            if (this.plantilla.estados) {
                const _controlEstado = [];
                for (let i = 0; i < this.plantilla.estados.length; i++) {
                    const element = this.plantilla.estados[i];
                    if (!element.llaveTabla) {
                        element.llaveTabla = element.estadoDocumento;
                    }
                    _controlEstado[element.llaveTabla] = new FormControl(
                        element.estadoDocumento === StatesEnum.ACTIVE
                    );
                }
                this.form = this.formBuilder.group(_controlEstado);
            }
        });*/
    }

    listar(_pagina: number) {
        /*
        if (this.isLoading) {
            return;
        }
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        if (this.plantilla) {
            entity.plantilla = this.plantilla.llaveTabla;
        }
        if (this.tableroId) {
            entity.campoPropiedad = this.tableroId;
        }
        if (this.fControlCheck.value) {
            if (!this.fControlSearch.value) {
                alert('Coloca el codigo del documento');
                return;
            }
            entity.nombre = this.fControlSearch.value;
            entity.filtroParametro = null;
        } else {
            entity.nombre = null;
            entity.filtroParametro = this.fControlSearch.value;
            if (this.fControlDateStart.value) {
                const startDate = moment(new Date(this.fControlDateStart.value));
                startDate.hour(0);
                startDate.minute(0);
                startDate.second(0);
                startDate.millisecond(0);
                let endDate = moment(new Date(this.fControlDateStart.value)).add(1, 'days');
                if (this.fControlDateEnd.value) {
                    endDate = moment(new Date(this.fControlDateEnd.value));
                    endDate.hour(0);
                    endDate.minute(0);
                    endDate.second(0);
                    endDate.millisecond(0);
                }
                endDate = endDate.add(1, 'days');
                entity.fechaMin = startDate.toDate();
                entity.fechaMax = endDate.toDate();
            } else {
                if (this.solicitarFechas) {
                    alert('Selecciona fechas');
                    return;
                }
            }
        }

        if (this.plantilla.estados) {
            entity.estadoExpediente = '';

            for (let i = 0; i < Object.keys(this.form.controls).length; i++) {
                const element = Object.keys(this.form.controls)[i];
                if (this.form.controls[element].value) {
                    entity.estadoExpediente = entity.estadoExpediente + ';' + element;
                }
            }
            if (!entity.estadoExpediente) {
                alert('Seleccione un filtro.');
                return;
            } else {
                if (entity.estadoExpediente === ';A') {
                    entity.estado = StatesEnum.ACTIVE;
                    entity.estadoExpediente = null;
                } else {
                    if (entity.estadoExpediente === ';I') {
                        entity.estado = StatesEnum.INACTIVE;
                        entity.estadoExpediente = null;
                    } else {
                        if (entity.estadoExpediente === ';A;I') {
                            entity.estado = null;
                            entity.estadoExpediente = null;
                        } else {
                            entity.estado = null;
                        }
                    }
                }
            }
        }

        this.isLoading = true;
        if (_pagina === 1) {
            this.dataProvider = [];
            this.isEnd = false;
            this.selection.clear();
        }
        entity.paginacionRegistroInicial = this.cantidadPagina * (_pagina - 1);
        entity.paginacionRegistroFinal = this.cantidadPagina;

        this.api.listarDocumentos(entity, this.plantilla.server).subscribe({
            next: (dataResult: PedidoVentaDTO[]) => {
                if (!dataResult) {
                    dataResult = [];
                }
                if (this.pagina === 1) {
                    this.dataProvider = dataResult;
                } else {
                    this.dataProvider = this.dataProvider.concat(dataResult);
                }
                if (dataResult.length === this.cantidadPagina) {
                    this.pagina++;
                } else {
                    this.isEnd = true;
                    this.pagina = 1;
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });*/
    }
}
