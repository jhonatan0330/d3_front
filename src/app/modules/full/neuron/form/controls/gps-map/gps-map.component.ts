import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FullMapComponent } from './full-map/full-map.component';
import { ApiService } from '../../../service/api.service';
import { DocumentoPlantillaCaracteristicaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO, PedidoVentaDTO } from '../../../model/sw42.domain';

@Component({
    selector: 'app-gps-map',
    templateUrl: './gps-map.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GpsMapComponent extends BaseComponent implements OnInit {

  lat;
  lon;

  constructor(public dialog: MatDialog,  private api: ApiService) {
    super();
  }

  ngOnInit(): void {
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        if (!pos) { return; }
        const crd = pos.coords;
        if (!crd) { return; }
        this.lat = crd.latitude;
        this.lon = crd.longitude;
        this.showMap();
      }, this.error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      Swal.fire("Change Browser", "Geolocation is not supported by this browser.", 'warning');
    }
  }

  error(err) {
    Swal.fire(`ERROR(${err.code})`, err.message, "error");
  }

  showMap() {
    if (!this.lat || !this.lon) {
      this.getLocation();
      return;
    }
    this.procesarCampo(this.transformPVCtoFilter(this.data));
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    const filtro: PedidoVentaCaracteristicaFilterDTO = new PedidoVentaCaracteristicaFilterDTO();
    filtro.campoDTO = this.structure;
    filtro.campo = this.structure.llaveTabla;
    filtro.documento = campoFiltro.documento;
    filtro.dependientes = this.data.dependientes;

    this.isLoading = true;
    this.api.consultarDatosBase(filtro, this.urlServer).subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading = false;

        const pv= new PedidoVentaDTO();
      pv.nombre = 'HOla';
      pv.caracteristicas = [];
      const pvc = new PedidoVentaCaracteristicaDTO();
      pvc.campoDTO = new DocumentoPlantillaCaracteristicaDTO();
      pvc.campoDTO.formato = 'P';
      pvc.valorText = '4.674282890459253,-74.0929901288652';
      pv.caracteristicas.push(pvc);
      _value = new PedidoVentaCaracteristicaFilterDTO();
      _value.expedientes = [];
      _value.expedientes.push(pv);

        this.dialog.open(FullMapComponent, {
          width: '90vw',
          height: '90vh',
          maxWidth: '90vw',
          disableClose: true,
          data: { latitude: this.lat, longitud: this.lon , nombre: this.structure.nombre, documents: _value.expedientes}
        });
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
