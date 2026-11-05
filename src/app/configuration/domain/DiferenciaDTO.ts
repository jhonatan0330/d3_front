import { DetalleCampoDTO } from './DetalleCampoDTO';
import { NodoArbolDTO } from './NodoArbolDTO';

export class DiferenciaDTO {
    static readonly CREAR = 'CREAR';
    static readonly ACTUALIZAR = 'ACTUALIZAR';
    static readonly SIN_DIFERENCIA = 'SIN_DIFERENCIA';
    static readonly LOCAL_SIN_REMOTO = 'LOCAL_SIN_REMOTO';
    tipoDiferencia: string;
    nodo: NodoArbolDTO;
    camino: string;
    camposDiferentes: string[];
    detalles: DetalleCampoDTO[];
    codigoLocal: string;
    codigoRemoto: string;
    llaveLocal: string;
    llaveRemota: string;
    hijos: DiferenciaDTO[];
}