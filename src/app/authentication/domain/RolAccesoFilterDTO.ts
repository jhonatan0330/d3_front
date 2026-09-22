import { BasicFilterDTO } from 'app/shared/shared.domain';

export class RolAccesoFilterDTO extends BasicFilterDTO {
  id: string;
  plantilla: string;
  nombre: string;
  codigo: string;
  imagen: string;
}
