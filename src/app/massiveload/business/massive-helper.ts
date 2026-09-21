import {
  DocumentoPlantillaCaracteristicaDTO,
  DocumentoPlantillaDTO,
} from 'app/document/document.types';

export function getFieldFromTemplate(template: DocumentoPlantillaDTO, fieldId: string): DocumentoPlantillaCaracteristicaDTO | null {
  if (!template || !template.caracteristicas) return null;
  for (let index = 0; index < template.caracteristicas.length; index++) {
    const element = template.caracteristicas[index];
    if (element.llaveTabla === fieldId) return element;
  }
  return null;
}