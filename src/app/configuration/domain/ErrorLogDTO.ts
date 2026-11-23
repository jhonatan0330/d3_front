import { BasicDTO, BasicFilterDTO } from 'app/shared/shared.domain';

export class UsuarioSesionErrorDTO extends BasicDTO {
    sesion: string;
    clave: string;
    ip: string;
    fecha: Date;
    error: string;
}

export interface UsuarioSesionErrorFilterDTO extends Partial<BasicFilterDTO> {
    sesion?: string;
    clave?: string;
    ip?: string;
    fechaMin?: Date;
    fechaMax?: Date;
}

export class ReporteEjecucionDTO extends BasicDTO {
    reporte: string;
    documento: string;
    fechaInicio: Date;
    fechaFin: Date;
    error: string;
    usuario: string;
    url: string;
}

export interface ReporteEjecucionFilterDTO extends Partial<BasicFilterDTO> {
    reporte?: string;
    documento?: string;
    fechaInicioMin?: Date;
    fechaInicioMax?: Date;
    fechaFinMin?: Date;
    fechaFinMax?: Date;
    usuario?: string;
    url?: string;
}

export class TransaccionErrorDTO extends BasicDTO {
    fechaInicio: Date;
    fechaFin: Date;
    error: string;
    usuario: string;
    entrada: string;
}

export interface TransaccionErrorFilterDTO extends Partial<BasicFilterDTO> {
    fechaInicioMin?: Date;
    fechaInicioMax?: Date;
    fechaFinMin?: Date;
    fechaFinMax?: Date;
    usuario?: string;
}
