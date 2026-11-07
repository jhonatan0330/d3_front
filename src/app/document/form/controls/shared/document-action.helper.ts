import { TemplateService } from 'app/document/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { PropiedadDTO } from 'app/shared/shared.domain';

export class DocumentActionHelper {
  static resolveActions(
    acciones: PropiedadDTO[] | null | undefined,
    templateService: TemplateService
  ): PropiedadDTO[] | null {
    if (!acciones || acciones.length === 0) {
      return null;
    }

    const filtered = acciones.filter((item) => {
      const plantilla = templateService.getTemplate(item.valor);
      return !!plantilla && !!PlantillaHelper.buscarPropiedad(
        plantilla.propiedades,
        PlantillaHelper.PERMISO_PLANTILLA_CREAR
      );
    });

    return filtered.length > 0 ? filtered : null;
  }
}
