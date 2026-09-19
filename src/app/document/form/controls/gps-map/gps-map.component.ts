import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseComponent } from '../base/base.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FullMapComponent } from './full-map/full-map.component';
import { ApiService } from '../../../document.api';
import { DocumentoPlantillaCaracteristicaDTO, PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO, PedidoVentaDTO } from '../../../document.types';
import { NotificationCenterService } from 'app/notification/business/notification-center.service';

@Component({
    selector: 'app-gps-map',
    templateUrl: './gps-map.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GpsMapComponent extends BaseComponent implements OnInit {
  dialog = inject(MatDialog);
  private api = inject(ApiService);
  private notificationCenter = inject(NotificationCenterService);


  lat;
  lon;

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
      this.notificationCenter.fire("Change Browser", "Geolocation is not supported by this browser.", 'warning');
    }
  }

  error(err) {
    this.notificationCenter.fire(`ERROR(${err.code})`, err.message, "error");
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

    this.isLoading.set(true) ;
    this.api.consultarDatosBase(filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (_value: PedidoVentaCaracteristicaFilterDTO) => {
        this.isLoading.set(false);

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
        this.isLoading.set(false);
      },
    });
  }
}
