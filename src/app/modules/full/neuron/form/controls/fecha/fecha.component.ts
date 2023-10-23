import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import { timer } from 'rxjs';

@Component({
  selector: 'app-fecha',
  templateUrl: './fecha.component.html',
  styleUrls: ['./fecha.component.scss'],
})
export class FechaComponent extends BaseComponent implements OnInit {
  conHora = false; // Define si se pide las fechas con hora
  sinCalendar = false; // Define si solo pide el time
  dateFrom: FormControl = new FormControl(); // Controlador de fecha de inicio
  timeFrom: FormControl = new FormControl('00:00'); // Controlador del texto de la hora
  timerBackCount = false; // Define si solo pide el time

  isRango = false; // Define si se espera unas fechas con rango
  fControlDateStart: FormControl = new FormControl();
  fControlDateEnd: FormControl = new FormControl(); // Controlador de fecha de Fin en Rango

  fControlHoras: FormControl = new FormControl(0); // Controla las horas
  fControlMinutes: FormControl = new FormControl(0); // Controla los minutos

  // Variables del contador regresivo
  day = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  source = timer(0, 1000);
  clock: any;

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    const opcionesRango = this.obtenerValor(PlantillaHelper.FECHA_RANGO);
    // Aqui debo colocar las opciones en el componente
    this.isRango = !this.isEmpty(opcionesRango);
    this.conHora = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.FECHA_CON_HORA)
    );
    this.sinCalendar = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.FECHA_SIN_CALENDAR)
    );
    this.timerBackCount = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.FECHA_TIMER_BACK)
    );

    if (this.data) {
      if (this.data.valorFecha) {
        this.dateFrom.setValue(new Date(this.data.valorFecha));
        this.timeFrom.setValue(('0' + this.data.valorFecha.getHours()).slice(-2) + ":" + ('0' + this.data.valorFecha.getMinutes()).slice(-2));
        this.data.valorFecha = this.dateFrom.value;
        if (this.data.valorNumero) {
          this.fControlHoras.setValue(
            Math.floor(this.data.valorNumero / 3600000)
          );
          this.fControlMinutes.setValue(
            ((this.data.valorNumero / 1000) % 3600) / 60
          );
        }
        if (this.data.valorAuxiliar && this.data.valorAuxiliar === 'R') {
          this.fControlDateStart.setValue(this.data.valorFecha);
          let endDate: Date = new Date(this.fControlDateStart.value);
          endDate.setHours(endDate.getHours() + Math.floor(this.data.valorNumero / 3600000));
          endDate.setMinutes(endDate.getMinutes() + ((this.data.valorNumero / 1000) % 3600) / 60);
          this.fControlDateEnd.setValue(endDate);
        }
      } else {
        if (this.required) {
          const initialDate: Date = new Date();
          if (!this.conHora) {
            initialDate.setHours(0);
            initialDate.setMinutes(0);
            initialDate.setSeconds(0);
            initialDate.setMilliseconds(0);
          }
          this.dateFrom.setValue(initialDate);
          this.timeFrom.setValue(('0' + initialDate.getHours()).slice(-2) + ":" + ('0' + initialDate.getMinutes()).slice(-2));
          this.data.valorFecha = initialDate;
        }
      }
    }
    if (this.required) {
      this.dateFrom.setValidators(Validators.required);
      this.dateFrom.updateValueAndValidity();
      this.timeFrom.updateValueAndValidity();
      if (this.sinCalendar) {
        this.fControlHoras.setValidators(Validators.required);
        this.fControlHoras.updateValueAndValidity();
        this.fControlMinutes.setValidators(Validators.required);
        this.fControlMinutes.updateValueAndValidity();
      }
    }
    if (this.sinCalendar) {
      this.fControlHoras.valueChanges.subscribe(() => {
        this.updateTimer();
      });
      this.fControlMinutes.valueChanges.subscribe(() => {
        this.updateTimer();
      });
    }
    if (this.isEnabled) {
      this.fControlDateStart.enable();
      this.fControlDateEnd.enable();
      this.fControlHoras.enable();
      this.fControlMinutes.enable();
    } else {
      this.fControlDateStart.disable();
      this.fControlDateEnd.disable();
      this.fControlHoras.disable();
      this.fControlMinutes.disable();
    }
    this.dateFrom.valueChanges.subscribe({
      next: () => {
        this.actualizar();
      },
    });
    this.timeFrom.valueChanges.subscribe({
      next: () => {
        this.actualizar();
      },
    });
    if (this.timerBackCount) {
      this.clock = this.source.subscribe((t) => {
        this.showTimer();
      });
    }
  }

  actualizar() {
    // Se supone que nunca llega por aqui

    let fecha: Date;
    if (this.dateFrom.value && this.dateFrom.value.length != 0) { fecha = new Date(this.dateFrom.value); }
    else { fecha = null; }
    let hour = 0;
    let minute = 0;
    if (this.timeFrom && this.timeFrom.value) {
      hour = this.timeFrom.value.substring(0, 2);
      minute = this.timeFrom.value.substring(3, 5);
    }
    if (!fecha) {
      if (this.data.valorFecha) {
        this.data.valorFecha = null;
        this.data.valorText = null;
        this.avisarModificacion();
      }
    } else {
      fecha.setHours(hour, minute, 0, 0);
      if (!this.data.valorFecha) {
        this.data.valorFecha = fecha;
        this.data.valorText = fecha.toLocaleString('en-ZA');
        this.avisarModificacion();
      } else {
        if (fecha !== this.data.valorFecha) {
          this.data.valorFecha = fecha;
          this.data.valorText = fecha.toLocaleString('en-ZA');
          this.avisarModificacion();
        }
      }
    }
  }

  datesUpdated() {
    if (this.fControlDateStart.value && this.fControlDateEnd.value) {
      const startDate = new Date(this.fControlDateStart.value);
      let endDate = new Date(this.fControlDateEnd.value);
      endDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 1);
      this.data.valorFecha = startDate;
      this.data.valorNumero =
        endDate.getTime() - startDate.getTime();
      if (this.data.valorNumero === 0) {
        this.data.valorNumero = 86399999;
      }
      if (this.data.valorNumero === 86399999) {
        this.data.valorAuxiliar = 'D';
      } else {
        this.data.valorAuxiliar = 'R';
      }
    } else {
      this.data.valorFecha = undefined;
      this.data.valorNumero = undefined;
      this.data.valorAuxiliar = undefined;
    }
  }

  getXMLBase(): string {
    return new Date().toString();
  }

  updateTimer() {
    let horas = 0;
    if (this.fControlHoras.value) {
      horas = this.fControlHoras.value;
    }
    let minutos = 0;
    if (this.fControlMinutes.value) {
      minutos = this.fControlMinutes.value;
    }
    this.data.valorNumero = horas * 3600 + minutos * 60;
    this.data.valorNumero = this.data.valorNumero * 1000; // Para milisegundos
    if (!this.data.valorFecha) {
      this.data.valorFecha = new Date();
    }
  }

  showTimer() {
    if (this.data.valorFecha) {
      let distance = this.data.valorFecha.getTime() - new Date().getTime();
      this.day = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }
  }
}
