import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationCenterService } from 'app/notification/notification-center.service';
import { BaseComponent } from '../base/base.component';
import { OlMapComponent } from './ol-map/ol-map.component';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-gps',
    templateUrl: './gps.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatIconButton, MatPrefix, MatIcon, MatInput, FormsModule, ReactiveFormsModule, MatSuffix, TitleCasePipe]
})
export class GpsComponent extends BaseComponent implements OnInit {

  fControl = new FormControl('');

  constructor(public dialog: MatDialog, private notificationCenter: NotificationCenterService) {
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
        this.notificationCenter.warn("Change Browser", "Geolocation is not supported by this browser.");
    }
  }

  error(err) {
     this.notificationCenter.error(`ERROR(${err.code})`, err.message);
  }

  showMap() {
    if (!this.data || !this.data.valorText) {
      this.notificationCenter.warn("Sin coordenadas", "No se reconocen las coordenadas.");
    }
    const coma = this.data.valorText.indexOf(",");
    if (coma <= 0) {
      this.notificationCenter.warn("Sin coordenadas", "No reconocemos el separador de las coordenadas.");
    }
    const dialogRef: MatDialogRef<any> = this.dialog.open(OlMapComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw',
      disableClose: true,
      data: { latitude: this.data.valorText.substring(0, coma), longitud: this.data.valorText.substring(coma + 1, this.data.valorText.length) , nombre: this.structure.nombre}
    });
    return dialogRef.afterClosed().subscribe((res) => {
      this.fControl.setValue(res.lat + "," + res.lon);
    });
  }

  

}
