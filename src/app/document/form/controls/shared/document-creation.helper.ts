import { Observable } from 'rxjs';
import { PedidoVentaCaracteristicaDTO, PedidoVentaDTO, RelacionInternaDTO } from 'app/document/document.types';
import { TemplateService } from 'app/document/service/template.service';
import { UtilsService } from 'app/document/service/utils.service';
import { PropiedadDTO } from 'app/shared/shared.domain';

export interface DocumentCreationContext {
  templateService: TemplateService;
  utilsService: UtilsService;
  data?: PedidoVentaCaracteristicaDTO;
  parent?: PedidoVentaDTO;
  herencia?: PropiedadDTO;
  relatedFields?: PropiedadDTO[];
  createFilter?: any;
}

export class DocumentCreationHelper {
  static createDocument(
    context: DocumentCreationContext,
    plantilla: string,
    property: string
  ): Observable<PedidoVentaDTO | null> {
    return new Observable((observer) => {
      const run = (targetPlantilla: string, targetProperty: string, doc: PedidoVentaDTO = new PedidoVentaDTO()) => {
        if (context.herencia) {
          if (!context.parent) {
            observer.next(null);
            observer.complete();
            return;
          }

          const relations = context.templateService.getPropertyRelation(context.herencia.llaveTabla);
          if (!relations || relations.length === 0) {
            context.templateService.getOrFetchRelations(context.herencia.llaveTabla).subscribe({
              next: (value: RelacionInternaDTO[]) => {
                const currentRelations = value ?? [];
                const nextDoc = new PedidoVentaDTO();
                const found = currentRelations.find((relation) => relation.plantilla === targetPlantilla);
                if (found) {
                  nextDoc.caracteristicas = [];
                  const campoHer: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                  campoHer.valorOpcion = context.data?.documento ?? '';
                  campoHer.valorText = context.parent?.descripcion ?? '';
                  campoHer.campo = found.campo;
                  nextDoc.caracteristicas.push(campoHer);
                  run(targetPlantilla, targetProperty, nextDoc);
                  return;
                }
                observer.next(null);
                observer.complete();
              },
              error: () => observer.next(null),
            });
            return;
          }

          const foundRelation = relations.find((relation) => relation.plantilla === targetPlantilla);
          if (foundRelation) {
            doc.caracteristicas = [];
            const campoHer: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
            campoHer.valorOpcion = context.data?.documento ?? '';
            campoHer.valorText = context.parent?.descripcion ?? '';
            campoHer.campo = foundRelation.campo;
            doc.caracteristicas.push(campoHer);
          }
        } else {
          if (context.relatedFields && context.relatedFields.length > 0) {
            for (const dependentIterator of context.relatedFields) {
              const relations = context.templateService.getPropertyRelation(dependentIterator.llaveTabla);
              if (!relations || relations.length === 0) {
                context.templateService.getOrFetchRelations(dependentIterator.llaveTabla).subscribe({
                  next: () => run(targetPlantilla, targetProperty, doc),
                  error: () => observer.next(null),
                });
                return;
              }
            }

            for (const dependentIterator of context.relatedFields) {
              const relations = context.templateService.getPropertyRelation(dependentIterator.llaveTabla)!;
              for (const relation of relations) {
                if (relation.plantilla === targetPlantilla) {
                  for (const valueDependent of context.data?.dependientes ?? []) {
                    if (valueDependent.campo === dependentIterator.valor) {
                      if (!doc.caracteristicas) { doc.caracteristicas = []; }
                      const fieldNewToCreateDependent: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                      fieldNewToCreateDependent.valorOpcion = valueDependent.valorOpcion;
                      fieldNewToCreateDependent.campo = relation.campo;
                      doc.caracteristicas.push(fieldNewToCreateDependent);
                      break;
                    }
                  }
                }
              }
            }
          }

          const relationProperty = context.templateService.getPropertyRelation(targetProperty);
          if (!relationProperty || relationProperty.length === 0) {
            context.templateService.getOrFetchRelations(targetProperty).subscribe({
              next: (value: RelacionInternaDTO[]) => {
                const safeValue = value && value.length > 0 ? value : [{
                  propiedad: targetProperty,
                  campo: 'FALSE',
                  plantilla: 'FALSE',
                  auxiliar: 'FALSE',
                } as RelacionInternaDTO];
                const nextDoc = new PedidoVentaDTO();
                const found = safeValue.find((relation) => relation.plantilla === targetPlantilla);
                if (found) {
                  nextDoc.caracteristicas = doc.caracteristicas ?? [];
                  const fieldNewToCreateDependent: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
                  fieldNewToCreateDependent.valorOpcion = context.data?.documento ?? '';
                  fieldNewToCreateDependent.campo = found.campo;
                  nextDoc.caracteristicas.push(fieldNewToCreateDependent);
                  run(targetPlantilla, targetProperty, nextDoc);
                  return;
                }

                // Si no hay relaciones, permitimos abrir la creación de la plantilla igual que en proceso.
                run(targetPlantilla, targetProperty, doc);
              },
              error: () => {
                // En caso de error también se intenta abrir la creación para no bloquear al usuario.
                run(targetPlantilla, targetProperty, doc);
              },
            });
            return;
          }

          const foundPropertyRelation = relationProperty.find((relation) => relation.plantilla === targetPlantilla);
          if (foundPropertyRelation) {
            if (!doc.caracteristicas) { doc.caracteristicas = []; }
            const fieldNewToCreateDependent: PedidoVentaCaracteristicaDTO = new PedidoVentaCaracteristicaDTO();
            fieldNewToCreateDependent.valorOpcion = context.data?.documento ?? '';
            fieldNewToCreateDependent.campo = foundPropertyRelation.campo;
            doc.caracteristicas.push(fieldNewToCreateDependent);
          }
        }

        doc.plantilla = targetPlantilla;
        context.utilsService
          .modalWithParams(doc, true, context.createFilter as any)
          .subscribe({
            next: (res) => {
              observer.next(res?.data ?? null);
              observer.complete();
            },
            error: (error) => observer.error(error),
          });
      };

      run(plantilla, property);
    });
  }
}
