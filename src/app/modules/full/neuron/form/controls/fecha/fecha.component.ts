import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/helpers/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import * as moment from 'moment';
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
        this.data.valorFecha = this.dateFrom.value;
        if (this.data.valorNumero) {
          this.fControlHoras.setValue(
            Math.floor(this.data.valorNumero / 3600000)
          );
          this.fControlMinutes.setValue(
            ((this.data.valorNumero / 1000) % 3600) / 60
          );
        }
        if (this.data.valorAuxiliar && this.data.valorAuxiliar==='R') {
          this.fControlDateStart.setValue( this.data.valorFecha );
          let endDate = moment(this.fControlDateStart.value);
          endDate = endDate.add(Math.floor(this.data.valorNumero / 3600000), 'hours');
          endDate = endDate.add(((this.data.valorNumero / 1000) % 3600) / 60, 'minutes');
          this.fControlDateEnd.setValue( endDate.toDate() );
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
          this.data.valorFecha = initialDate;
        }
      }
    }
    if (this.required) {
      this.dateFrom.setValidators(Validators.required);
      this.dateFrom.updateValueAndValidity();
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
      // this.dateFrom.enable();
      this.fControlDateStart.enable();
      this.fControlDateEnd.enable();
      this.fControlHoras.enable();
      this.fControlMinutes.enable();
    } else {
      // this.dateFrom.disable();
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
	if (this.timerBackCount) {
		this.clock = this.source.subscribe((t) => {
			this.showTimer();
		  });
	}
  }

  actualizar() {
    // Se supone que nunca llega por aqui
    const fecha: Date = this.dateFrom.value;
    if (!fecha) {
      if (this.data.valorFecha) {
        this.data.valorFecha = null;
        this.avisarModificacion();
      }
    } else {
      if (!this.data.valorFecha) {
        this.data.valorFecha = fecha;
        this.avisarModificacion();
      } else {
        if (fecha !== this.data.valorFecha) {
          this.data.valorFecha = fecha;
          this.avisarModificacion();
        }
      }
    }
  }

  datesUpdated() {
    if (this.fControlDateStart.value && this.fControlDateEnd.value) {
      const startDate = moment(new Date(this.fControlDateStart.value));
      let endDate = moment(new Date(this.fControlDateEnd.value));
      endDate.hour(0).minute(0).second(0).millisecond(0);
      endDate = endDate.add(1, 'days');

      this.data.valorFecha = startDate.toDate();
      this.data.valorNumero =
        endDate.toDate().getTime() - startDate.toDate().getTime();
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
