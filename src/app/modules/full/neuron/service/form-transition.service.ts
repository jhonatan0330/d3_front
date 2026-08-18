import { Injectable, inject } from '@angular/core';
import { DocumentoPlantillaDTO, PedidoVentaDTO, ProcesoTransicionDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Injectable({ providedIn: 'root' })
export class FormTransitionService {
  private templateService = inject(TemplateService);

  getTransitionsOfTemplate(
    pTemplate: DocumentoPlantillaDTO,
    pState: string,
    pDocumentTransition: PedidoVentaDTO,
    pIsVinculo: boolean = false
  ): ProcesoTransicionDTO[] {
    if (!pTemplate?.estados || pTemplate.estados.length === 0) return [];

    for (const _stateElement of pTemplate.estados) {
      if (_stateElement.llaveTabla !== pState) continue;
      if (!_stateElement.transiciones || _stateElement.transiciones.length === 0) return [];

      const result: ProcesoTransicionDTO[] = [];
      for (const _transition of _stateElement.transiciones) {
        if (!_transition.plantilla) continue;
        const _templateTransition = this.templateService.getTemplate(_transition.plantilla, pTemplate.server);
        if (!_templateTransition || PlantillaHelper.isEmpty(_templateTransition.propiedades, PlantillaHelper.PERMISO_PLANTILLA_CREAR)) continue;
        if (pIsVinculo && PlantillaHelper.isEmpty(_transition.propiedades, PlantillaHelper.TRANSICION_VISIBLE_VINCULO)) continue;

        const t: ProcesoTransicionDTO = new ProcesoTransicionDTO();
        t.imagen = _templateTransition.imagen;
        t.plantilla = _templateTransition.llaveTabla;
        t.nombre = _transition.nombre;
        t.documentToTransition = pDocumentTransition;
        result.push(t);
      }
      return result;
    }
    return [];
  }
}
