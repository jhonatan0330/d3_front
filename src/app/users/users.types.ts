/**
 * Tipos del dominio users — espejo de contract.md §12
 *
 * UsuarioDTO: { llaveTabla, estado, identificacion, nombre, imagen, rol, correo, ... }
 * UsuarioFilterDTO: { paginacionRegistroInicial, paginacionRegistroFinal, filtroParametro, ... }
 *
 * Endpoints: POST /user/getUsers, GET /user/{userId}, GET /user/document/{documentId}
 */

export { UsuarioDTO } from 'app/authentication/authentication.domain';

export interface UsuarioFilterDTO {
    paginacionRegistroInicial?: number;
    paginacionRegistroFinal?: number;
    filtroParametro?: string;
    llaveTabla?: string;
    estado?: string;
    securityToken?: string;
    identificacion?: string;
    nombre?: string;
    correo?: string;
    rol?: string;
    telefono?: string;
}
