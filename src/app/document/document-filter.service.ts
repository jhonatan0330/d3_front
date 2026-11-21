import { Injectable } from '@angular/core';
import { PedidoVentaCaracteristicaFilterDTO, PedidoVentaFilterDTO } from 'app/document/document.types';
import { StatesEnum } from 'app/document/form/form.enum';

export interface DocumentFilterState {
  plantillaId: string | null;
  processId: string | null;
  boardFieldId: string | null;
  exactCode: boolean;
  searchText: string | null;
  documentDateStart: Date | null;
  documentDateEnd: Date | null;
  documentTimeStart: string | null;
  documentTimeEnd: string | null;
  registrationDateStart: Date | null;
  registrationDateEnd: Date | null;
  registrationTimeStart: string | null;
  registrationTimeEnd: string | null;
  requestDocumentDates: boolean;
  statesEnabled: boolean;
  selectedStates: string[];
  orderField: string | null;
  ascending: boolean;
  dynamicFields: PedidoVentaCaracteristicaFilterDTO[];
  initialFilter: PedidoVentaFilterDTO | null;
}

export interface DocumentFilterBuildResult {
  filter: PedidoVentaFilterDTO | null;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class DocumentFilterService {
  build(state: DocumentFilterState): DocumentFilterBuildResult {
    const initialFilter = state.initialFilter;
    const filter = new PedidoVentaFilterDTO();

    if (initialFilter?.plantilla || state.plantillaId) {
      filter.plantilla = initialFilter?.plantilla ?? state.plantillaId!;
    }
    if (state.boardFieldId) {
      filter.campoPropiedad = state.boardFieldId;
    }
    filter.proceso = state.processId!;

    if (state.exactCode) {
      if (!state.searchText?.trim()) {
        return {
          filter: null,
          error: 'Seleccionaste la opción código exacto. Coloca el código del documento.',
        };
      }
      filter.nombre = state.searchText!;
      filter.filtroParametro = null!;
    } else {
      filter.nombre = null!;
      filter.filtroParametro = state.searchText ?? null!;

      if (state.requestDocumentDates && (!state.documentDateStart || !state.documentDateEnd)) {
        return {
          filter: null,
          error: 'Por favor coloca una fecha de inicio y una fecha de fin.',
        };
      }

      if (state.documentDateStart) {
        filter.fechaMin = this.combineDateAndTime(state.documentDateStart, state.documentTimeStart, true);
      }
      if (state.documentDateEnd) {
        filter.fechaMax = this.combineDateAndTime(state.documentDateEnd, state.documentTimeEnd, false);
      }
      if (!this.isDateRangeValid(filter.fechaMin, filter.fechaMax)) {
        return {
          filter: null,
          error: 'La fecha máxima no puede ser menor que la fecha mínima.',
        };
      }

      if (state.registrationDateStart) {
        filter.fechaRegistroMin = this.combineDateAndTime(
          state.registrationDateStart,
          state.registrationTimeStart,
          true,
        );
      }
      if (state.registrationDateEnd) {
        filter.fechaRegistroMax = this.combineDateAndTime(
          state.registrationDateEnd,
          state.registrationTimeEnd,
          false,
        );
      }
      if (!this.isDateRangeValid(filter.fechaRegistroMin, filter.fechaRegistroMax)) {
        return {
          filter: null,
          error: 'La fecha máxima de registro no puede ser menor que la fecha mínima.',
        };
      }
    }

    const hasInitialState = !!(
      initialFilter?.estado ||
      initialFilter?.estadoExpediente
    );

    if (!state.exactCode && state.statesEnabled && !hasInitialState) {
      filter.estadoExpediente = '';
      state.selectedStates.forEach(stateId => {
        if (stateId) {
          filter.estadoExpediente += `;${stateId}`;
        }
      });

      if (!filter.estadoExpediente) {
        return {
          filter: null,
          error: 'Selecciona mínimo un estado del filtro o consulta por el nombre exacto.',
        };
      }

      if (filter.estadoExpediente === ';A') {
        filter.estado = StatesEnum.ACTIVE;
        filter.estadoExpediente = null!;
      } else if (filter.estadoExpediente === ';I') {
        filter.estado = StatesEnum.INACTIVE;
        filter.estadoExpediente = null!;
      } else if (filter.estadoExpediente === ';A;I') {
        filter.estado = null!;
        filter.estadoExpediente = null!;
      } else {
        filter.estado = null!;
      }
    }

    if (initialFilter?.estado) {
      filter.estado = initialFilter.estado;
    }
    if (initialFilter?.estadoExpediente) {
      filter.estadoExpediente = initialFilter.estadoExpediente;
    }

    filter.ordenNombre = state.orderField || null!;
    filter.ascendente = state.ascending ? 'A' : null!;
    filter.filtersByFields = this.mergeDynamicFields(
      initialFilter?.filtersByFields ?? [],
      state.dynamicFields,
    );

    return { filter, error: null };
  }

  private mergeDynamicFields(
    initialFields: PedidoVentaCaracteristicaFilterDTO[],
    dynamicFields: PedidoVentaCaracteristicaFilterDTO[],
  ): PedidoVentaCaracteristicaFilterDTO[] {
    const merged = new Map<string, PedidoVentaCaracteristicaFilterDTO>();

    for (const field of [...initialFields, ...dynamicFields]) {
      if (!field?.campo || !this.hasFieldValue(field)) {
        continue;
      }
      if (!merged.has(field.campo)) {
        merged.set(field.campo, field);
      }
    }

    return [...merged.values()];
  }

  private hasFieldValue(field: PedidoVentaCaracteristicaFilterDTO): boolean {
    return !!(
      field.valorOpcion ||
      field.valorAuxiliar ||
      field.valorText ||
      field.valorFechaMin ||
      field.valorFechaMax ||
      field.valorNumeroMin ||
      field.valorNumeroMax
    );
  }

  private combineDateAndTime(date: Date, time: string | null, start: boolean): Date {
    const value = new Date(date);
    if (time) {
      value.setHours(Number(time.substring(0, 2)), Number(time.substring(3, 5)), 0, 0);
    } else {
      value.setHours(start ? 0 : 23, start ? 0 : 59, 0, 0);
    }
    return value;
  }

  private isDateRangeValid(dateMin: Date, dateMax: Date): boolean {
    return !dateMin || !dateMax || dateMax.getTime() - dateMin.getTime() > 0;
  }
}
