import { DocumentoPlantillaDTO } from 'app/document/document.types';
import { BasicParamDTO } from 'app/shared/shared.domain';

export class OrganizacionDTO extends BasicParamDTO {
  nombre: string;
  principal: string;
  servidor: string;
  usuarioSystem: string;
  imagen: string;
  slogan: string;
  mensajeIngreso: string;
  codigo: string;
  plantillas: DocumentoPlantillaDTO[];
  menuPlantillas: DocumentoPlantillaDTO[];
  reportePlantillas: DocumentoPlantillaDTO[];
  token: string;
  templates: DocumentoPlantillaDTO[];
  publicToken: string;
}
