export interface UsuarioFilterDTO {
  paginacionRegistroInicial?: number;
  paginacionRegistroFinal?: number;
  filtroParametro?: string;
  llaveTabla?: string;
  estado?: string;
  identificacion?: string;
  nombre?: string;
  correo?: string;
  rol?: string;
  telefono?: string;
}
