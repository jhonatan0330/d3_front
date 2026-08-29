import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { BaseComponent } from '../base/base.component';
import { timer } from 'rxjs';
import { PedidoVentaCaracteristicaDTO, PedidoVentaCaracteristicaFilterDTO } from '../../../model/sw42.domain';
import { DocumentoPlantillaCaracteristicaEnum } from '../../../model/sw42.enum';
import { ApiService } from '../../../service/api.service';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatDateRangeInput, MatStartDate, MatEndDate, MatDateRangePicker } from '@angular/material/datepicker';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-fecha',
    templateUrl: './fecha.component.html',
    styleUrls: ['./fecha.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, FormsModule, ReactiveFormsModule, MatDatepickerToggle, MatSuffix, MatDatepicker, MatDateRangeInput, MatStartDate, MatEndDate, MatDateRangePicker, TitleCasePipe]
})
export class FechaComponent extends BaseComponent implements OnInit {
  private api = inject(ApiService);

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
  ftimeFromMinutesAndHours: FormControl = new FormControl(0); // Controla los minutos

  // Variables del contador regresivo
  day = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  source = timer(0, 1000);
  clock: any;

  funcion: string;

  ngOnInit() {
    super.ngOnInit();
    const opcionesRango = this.obtenerValor(PlantillaHelper.FECHA_RANGO);
    // Aqui debo colocar las opciones en el componente
    this.isRango = !this.isEmpty(opcionesRango);
    this.conHora = !this.isEmpty(
      this.obtenerValor(PlantillaHelper.FECHA_CON_HORA)
    );
    this.funcion = this.obtenerValor(PlantillaHelper.FECHA_FUNCION);
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
          this.ftimeFromMinutesAndHours.setValue(
            ('0' + Math.floor(this.data.valorNumero / 3600000)).slice(-2) + ":" + ('0' + (((this.data.valorNumero / 1000) % 3600) / 60)).slice(-2)
          );
        }
        if (this.data.valorAuxiliar && this.data.valorAuxiliar === 'R') {
          this.fControlDateStart.setValue(this.data.valorFecha);
          const endDate: Date = new Date(this.fControlDateStart.value);
          endDate.setHours(endDate.getHours() + Math.floor(this.data.valorNumero / 3600000));
          endDate.setMinutes(endDate.getMinutes() + ((this.data.valorNumero / 1000) % 3600) / 60);
          this.fControlDateEnd.setValue(endDate);
        }
      } else {

        if (this.required) {
          if (!this.data.documento && !this.isEmpty(this.funcion)) {
            this.procesarCampo(this.transformPVCtoFilter(this.data));
          } else {
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
        this.ftimeFromMinutesAndHours.setValidators(Validators.required);
        this.ftimeFromMinutesAndHours.updateValueAndValidity();
      }
    }
    if (this.sinCalendar) {
      this.fControlHoras.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.updateTimer();
      });
      this.fControlMinutes.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.updateTimer();
      });
      this.ftimeFromMinutesAndHours.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.updateTimer();
      });
    }
    if (this.isEnabled) {
      this.fControlDateStart.enable();
      this.fControlDateEnd.enable();
      this.fControlHoras.enable();
      this.fControlMinutes.enable();
      this.ftimeFromMinutesAndHours.enable();
    } else {
      this.fControlDateStart.disable();
      this.fControlDateEnd.disable();
      this.fControlHoras.disable();
      this.fControlMinutes.disable();
      this.ftimeFromMinutesAndHours.disable();
    }
    this.dateFrom.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.actualizar();
      },
    });
    this.timeFrom.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.actualizar();
      },
    });
    if (this.timerBackCount) {
      this.clock = this.source
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((t) => {
        this.showTimer();
      });
    }
  }

  actualizar() {
    // Se supone que nunca llega por aqui

    let fecha: Date;
    if (this.dateFrom.value && this.dateFrom.value.length != 0) { fecha = new Date(this.dateFrom.value); }
    else { fecha = null as any; }
    let hour = 0;
    let minute = 0;
    if (this.timeFrom && this.timeFrom.value) {
      hour = this.timeFrom.value.substring(0, 2);
      minute = this.timeFrom.value.substring(3, 5);
    }
    if (!fecha) {
      if (this.data.valorFecha) {
        this.data.valorFecha = null as any;
        this.data.valorText = null as any;
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
      const endDate = new Date(this.fControlDateEnd.value);
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
      this.data.valorFecha = undefined as any;
      this.data.valorNumero = undefined as any;
      this.data.valorAuxiliar = undefined as any;
    }
  }


  updateTimer() {
    
    let horas = 0;
    let minutos = 0;

    
    if (this.fControlHoras.value) {
      horas = this.fControlHoras.value;
    }
    if (this.fControlMinutes.value) {
      minutos = this.fControlMinutes.value;
    }
    if (this.ftimeFromMinutesAndHours.value){
      horas = this.ftimeFromMinutesAndHours.value.substring(0, 2);
      minutos = this.ftimeFromMinutesAndHours.value.substring(3, 5);
      this.fControlHoras.setValue(horas, { emitEvent: false });
      this.fControlMinutes.setValue(minutos, { emitEvent: false });
    }
    this.data.valorNumero = horas * 3600 + minutos * 60;
    this.data.valorNumero = this.data.valorNumero * 1000; // Para milisegundos
    if (!this.data.valorFecha) {
      this.data.valorFecha = new Date();
    }
  }

  showTimer() {
    if (this.data.valorFecha) {
      const distance = this.data.valorFecha.getTime() - new Date().getTime();
      this.day = Math.floor(distance / (1000 * 60 * 60 * 24));
      if (this.day < 0) { this.day = this.day + 1; }
      this.hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }
  }

  procesarCampo(campoFiltro: PedidoVentaCaracteristicaFilterDTO) {
    if (!this.isEmpty(this.obtenerValor(PlantillaHelper.FECHA_FUNCION))) {
      if (campoFiltro) {
        const filtro: PedidoVentaCaracteristicaFilterDTO =
          new PedidoVentaCaracteristicaFilterDTO();
        if (this.relatedFields) {
          if (
            !this.data.dependientes ||
            this.data.dependientes.length !== this.relatedFields.length
          ) {
            return;
          }
          for (let index = 0; index < this.data.dependientes.length; index++) {
            const pvc: PedidoVentaCaracteristicaDTO =
              this.data.dependientes[index];
            if (!pvc.valorOpcion) {
              if (
                !pvc.campoDTO ||
                pvc.campoDTO.formato ===
                DocumentoPlantillaCaracteristicaEnum.PROCESO
              ) {
                return;
              }
            }
          }
          filtro.dependientes = this.data.dependientes;
        } else {
          // Si no tiene dependencia debe tener id de documento como minimo
          if (!this.data.documento) {
            return;
          }
        }
        // Por dependientes siempre coloco el base ahora toca ver en donde me falla
        filtro.campoDTO = this.structure;
        filtro.campo = this.structure.llaveTabla;
        filtro.documento = campoFiltro.documento;

        this.api
          .consultarDatosBase(filtro, this.urlServer)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((_value: PedidoVentaCaracteristicaFilterDTO) => {
            if (_value && _value.valorFechaMax) {
              this.dateFrom.setValue(_value.valorFechaMax);
              this.timeFrom.setValue(('0' + _value.valorFechaMax.getHours()).slice(-2) + ":" + ('0' + _value.valorFechaMax.getMinutes()).slice(-2));
            }

          });
      }
    }
  }

  send2Server(): boolean {

    this.errorMessage = null as any;
    if (this.data.modificado && this.data?.valorFecha) {

      const fechaActual = new Date();
      if (!this.conHora) {
        fechaActual.setHours(0);
        fechaActual.setMinutes(0);
        fechaActual.setSeconds(0);
        fechaActual.setMilliseconds(0);
      }

      const maxTime = this.obtenerValor(PlantillaHelper.FECHA_MAXIMA);
      if (!this.isEmpty(maxTime)) {
        const fechaMaxima = new Date(fechaActual.getTime() + Number(maxTime));
        if (this.data.valorFecha > fechaMaxima) {
          this.errorMessage =
            `La fecha no puede ser mayor a ${fechaMaxima.toLocaleString('en-ZA')}`;
        }
      }
      const minTime = this.obtenerValor(PlantillaHelper.FECHA_MINIMA);
      if (!this.isEmpty(minTime)) {
        const fechaMinima = new Date(fechaActual.getTime() - Number(minTime));
        if (this.data.valorFecha < fechaMinima) {
          this.errorMessage =
            `La fecha no puede ser menor a ${fechaMinima.toLocaleString('en-ZA')}`;
        }

      }
    }


    if (!this.errorMessage && this.required && !this.isInvisible && !this.data.valorFecha) {
      this.errorMessage =
        `En la plantilla ${this._structure.plantillaNombre} es obligatorio registrar el campo ${this._structure.nombre})`;
    }

    if (this.errorMessage) {
      const input = document.getElementById(this.idField!) as HTMLInputElement;
      if (input) { input.focus(); }
      return false;
    }
    return true;
  }

}
