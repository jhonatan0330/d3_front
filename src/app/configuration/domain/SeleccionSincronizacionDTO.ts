export class SeleccionSincronizacionDTO {
    static readonly CREAR = 'CREAR';
    static readonly ACTUALIZAR = 'ACTUALIZAR';
    static readonly OMITIR = 'OMITIR';
    camino: string;
    accion: string;
    incluirHijos: boolean;
}