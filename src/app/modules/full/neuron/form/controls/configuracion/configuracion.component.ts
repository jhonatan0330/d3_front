import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaFilterDTO,
  PedidoVentaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent extends BaseComponent implements OnInit {
  fControl: FormControl = new FormControl();
  disponibles: PedidoVentaDTO[] = []; // Contiene los documetnos que resultaron de consultar el servidor
  filteredOptions: Observable<PedidoVentaDTO[]>;

  constructor(
    private templateService: TemplateService,
    private api: ApiService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.filteredOptions = this.fControl.valueChanges.pipe(
      startWith(''),
      map((name) => (name ? this._filter(name) : this.disponibles.slice()))
    );

    if (this.structure.documentos) {
      this.disponibles = this.structure.documentos;
      this.asignarValorInicial();
    } else {
      this.procesarCampo(null);
    }
    if (this.required) {
      this.fControl.setValidators(Validators.required);
      this.fControl.updateValueAndValidity();
    }
    // PAra que no se envia a actualizar con los cambios de inicio
    this.fControl.valueChanges.subscribe((value) => {
      this.actualizar();
    });
  }

  asignarValorInicial() {
    if (this.data) {
      if (this.data.valorOpcion) {
        const l: PedidoVentaDTO[] = this.disponibles.filter(
          (option) => option.llaveTabla === this.data.valorOpcion
        );
        if (l && l.length !== 0) {
          this.fControl.setValue(l[0]);
        }
      } else {
        if (this.disponibles.length === 1 && this.required) {
          this.fControl.setValue(this.disponibles[0]);
          this.actualizar();
        }
      }

    }
  }

  actualizar() {
    if (this.fControl.value && this.fControl.value.llaveTabla) {
      if (
        !this.data.valorOpcion ||
        this.data.valorOpcion !== this.fControl.value.llaveTabla
      ) {
        this.data.valorOpcion = this.fControl.value.llaveTabla;
        this.data.valorText = this.fControl.value.nombre;
        this.avisarModificacion();
      }
    } else {
      if (this.data.valorOpcion) {
        this.data.valorOpcion = null;
        this.data.principal = null;
        this.avisarModificacion();
      }
    }
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    const nFilter: PedidoVentaCaracteristicaFilterDTO =
      this.transformPVCtoFilter(this.data);
    nFilter.valorOpcion = null;
    this.isLoading = true;
    this.api.consultarDatosBase(nFilter, this.urlServer).subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading = false;
        this.consultaExitosaDatosBase(_value);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  consultaExitosaDatosBase(pCampo: PedidoVentaCaracteristicaFilterDTO) {
    this.disponibles = pCampo.campoDTO.documentos;
    this.asignarValorInicial(); // Se hace antes del validar porque no aparecian la primera ve<
    this.fControl.updateValueAndValidity();
    // Consulto la plantilla para actualizarla y no tener que volver a consultarla
    const plantillaBase: DocumentoPlantillaDTO =
      this.templateService.getTemplate(this.structure.plantilla, this.urlServer);

    for (let i = 0; i < plantillaBase.caracteristicas.length; i++) {
      const iCampo = plantillaBase.caracteristicas[i];
      if (iCampo.llaveTabla === this.structure.llaveTabla) {
        iCampo.documentos = pCampo.campoDTO.documentos;
        return;
      }
    }
  }

  displayFn(pDocument: any): string {
    if (!pDocument) {
      return '';
    }
    if (pDocument.nombre) {
      let displayStr = pDocument.nombre;
      if (pDocument.descripcion) {
        displayStr = displayStr + ' - ' + pDocument.descripcion;
      }
      return displayStr;
    } else {
      return pDocument;
    }
  }

  private _filter(name: any): PedidoVentaDTO[] {
    let filterValue = '';
    if (name) {
      if (name.nombre) {
        filterValue = name.nombre.toLowerCase();
      } else {
        filterValue = name.toLowerCase();
      }
    }
    return this.disponibles.filter(
      (option) =>
        option.nombre.toLowerCase().indexOf(filterValue) !== -1 ||
        (option.descripcion &&
          option.descripcion.toLowerCase().indexOf(filterValue) !== -1)
    );
  }
}
