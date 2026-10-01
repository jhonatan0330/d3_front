export class TenantDTO {
    key: string;
    name: string;
    codigo: string;
    datasourceUrl: string;
    datasourceUsername: string;
    datasourcePassword: string;
    imagen?: string;
    state: string;
    fechaValidez?: string;
}

export class TenantUsuarioDTO {
    key: string;
    usuario: string;
    tenant: string;
    state: string;
}

export class SaldoConsumoDTO {
    llaveTabla: string;
    saldo: number;
    fechaActualizacion: string;
    estado: string;
}

export class MovimientoConsumoDTO {
    llaveTabla: string;
    tipo: string;
    fechaRegistro: string;
    fechaEvento: string;
    cantidad: number;
    saldoInicial: number;
    saldoFinal: number;
    anterior?: string;
    siguiente?: string;
    referencia?: string;
    estado: string;
}

export class MovimientoConsumoFilterDTO {
    tipo?: string;
    referencia?: string;
    estado?: string;
}

export class TransferenciaConsumoDTO {
    tenantDestino: string;
    cantidad: number;
    unidad: string;
    referencia?: string;
}
