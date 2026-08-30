/**
 * Tipos del dominio authorization — espejo de contract.md §13
 *
 * RolAccesoDTO: { llaveTabla, estado, id, plantilla, nombre, codigo, imagen }
 * UsuarioAutenticacionDTO: { llaveTabla, estado, usuario, sesion, clave, token, ... }
 *
 * Endpoints: GET /user/getRole, GET /user/roles/{userId},
 *            POST /user/cambiarClaveUsuarioAutenticacion, POST /user/dfa
 */

export {
    RolAccesoFilterDTO as RolAccesoDTO,
    UsuarioAutenticacionDTO,
    UsuarioAutenticacionFilterDTO,
    PermisosDTO,
} from 'app/authentication/authentication.domain';
