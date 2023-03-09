import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { BaseComponent } from '../base/base.component';
import { OlMapComponent } from './ol-map/ol-map.component';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html'
})
export class GpsComponent extends BaseComponent implements OnInit {

  fControl = new FormControl('');

  constructor(public dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.fControl.valueChanges.subscribe(() => {
      this.actualizar();
    });
    if (!this.data || !this.data.llaveTabla) {
      if (this.required) { this.getLocation(); }
    } else {
      if (this.data.valorText) {
        this.fControl.setValue(this.data.valorText);
      }
    }
  }

  actualizar(): void {
    const nuevoValor = this.fControl.value;
    if (this.data.valorText !== nuevoValor) {
      this.data.valorText = nuevoValor;
      this.avisarModificacion();
      if (this.data.valorText) { this.showMap(); }
    }
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        if (!pos) { return; }
        const crd = pos.coords;
        if (!crd) { return; }
        this.fControl.setValue(crd.latitude + "," + crd.longitude);
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
    if (!this.data || !this.data.valorText) {
      Swal.fire("Sin coordenadas", "No se reconocen las coordenadas.", 'warning');
    }
    const coma = this.data.valorText.indexOf(",");
    if (coma <= 0) {
      Swal.fire("Sin coordenadas", "No reconocemos el separador de las coordenadas.", 'warning');
    }
    const dialogRef: MatDialogRef<any> = this.dialog.open(OlMapComponent, {
      maxWidth: '90vh',
      maxHeight: '90vh',
      disableClose: false,
      data: { latitude: this.data.valorText.substring(0, coma), longitud: this.data.valorText.substring(coma + 1, this.data.valorText.length) }
    });
    return dialogRef.afterClosed();
  }

}
