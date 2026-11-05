export interface SaldoConsumoDTO {
    llaveTabla: string;
    saldo: number;
    fechaActualizacion: Date;
    estado: string;
}

export interface MovimientoConsumoDTO {
    llaveTabla: string;
    tipo: string;
    fechaRegistro: Date;
    fechaEvento: Date;
    cantidad: number;
    saldoInicial: number;
    saldoFinal: number;
    anterior?: string;
    siguiente?: string;
    referencia?: string;
    estado: string;
}

export interface MovimientoConsumoFilterDTO {
    tipo?: string;
    fechaEventoMin?: Date;
    fechaEventoMax?: Date;
    referencia?: string;
    estado?: string;
    paginacionRegistroInicial?: number;
    paginacionRegistroFinal?: number;
}
