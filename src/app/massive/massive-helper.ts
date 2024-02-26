import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import {
  DocumentoPlantillaCaracteristicaDTO,
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaDTO,
  PedidoVentaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';

import { formatDate } from '@angular/common';

import Swal from 'sweetalert2';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

export function getFieldFromTemplate(template: DocumentoPlantillaDTO, fieldId: String): DocumentoPlantillaCaracteristicaDTO {
  if (!template || !template.caracteristicas) return null;
  for (let index = 0; index < template.caracteristicas.length; index++) {
    const element = template.caracteristicas[index];
    if (element.llaveTabla === fieldId) return element;
  }
  return null;
}

export function getXMLBase(
  pCampo: DocumentoPlantillaCaracteristicaDTO
): string {
  const result = 'No implementado';
  switch (pCampo.formato) {
    case DocumentoPlantillaCaracteristicaEnum.BINARIO:
      return '0-1';
    case DocumentoPlantillaCaracteristicaEnum.FECHA:
      return formatDate(new Date(), 'dd/MM/YYYY', 'en');
    case DocumentoPlantillaCaracteristicaEnum.NUMERO:
      return '0';
    case DocumentoPlantillaCaracteristicaEnum.PROCESO:
      return 'CODIGO';
    case DocumentoPlantillaCaracteristicaEnum.TEXTO:
      return 'TEXTO ';
    case DocumentoPlantillaCaracteristicaEnum.CONFIGURACION:
      return 'TEXTO EXACTO DE LA OPCION';
  }
  return result;
}

export function procesarXMLBase(
  pCampo: PedidoVentaCaracteristicaDTO
): PedidoVentaCaracteristicaDTO {
  const result: PedidoVentaCaracteristicaDTO = pCampo;
  switch (pCampo.campoDTO.formato) {
    case DocumentoPlantillaCaracteristicaEnum.FECHA:
      if (pCampo.valorText) {
        const fechaHora = PlantillaHelper.buscarPropiedad(
          pCampo.campoDTO.propiedades,
          PlantillaHelper.FECHA_CON_HORA
        );
        let formatoDate = '';
        if (Number(pCampo.valorText)) {
          // Este valor lo saque a prueba y error
          pCampo.valorFecha = new Date((Number(pCampo.valorText) - 25568.791) * 86400 * 1000);
          pCampo.valorFecha.setHours(pCampo.valorFecha.getHours() + 5)
          pCampo.valorFecha.setSeconds(0);
          if (!fechaHora) {
            pCampo.valorFecha.setMinutes(0);
            pCampo.valorFecha.setHours(0);
          }
          pCampo.valorText = pCampo.valorFecha.toLocaleString('en-ZA');
        } else {
          if (fechaHora) {
            formatoDate = '\\d{4}(\\-|\\/)(((0)[0-9])|((1)[0-2]))(\\-|\\/)([0-2][0-9]|(3)[0-1])\\s([0-1][0-9]|(2)[0-3])(:)([0-5][0-9])';
          } else {
            formatoDate = "\\d{4}(\\-|\\/)(((0)[0-9])|((1)[0-2]))(\\-|\\/)([0-2][0-9]|(3)[0-1])";
          }
          if (!pCampo.valorText.match(formatoDate)) {
            if (fechaHora) {
              pCampo.valorText = pCampo.valorText.substring(0, pCampo.valorText.length - 6).split("/").reverse().join("-") + pCampo.valorText.substring(pCampo.valorText.length - 6);
            } else { 
              pCampo.valorText = pCampo.valorText.split("/").reverse().join("-");
            }
            //Cambio el orden de la fecha
            if (!pCampo.valorText.match(formatoDate)) {
              if (fechaHora) {
                Swal.fire('Formato incorrecto',
                'El valor fecha no esta con el formato correcto utiliza el formato año/Mes/dia hora:minuto como el siguiente ejemplo 2023/04/26 23:59.      La fecha actualmente tiene este formato ' + pCampo.valorText,
                'error'
              );
              } else { 
                Swal.fire('Formato incorrecto',
                'El valor fecha no esta con el formato correcto utiliza el formato año/Mes/dia como el siguiente ejemplo 2023/04/26.      La fecha actualmente tiene este formato ' + pCampo.valorText,
                'error'
              );
              }
              
              return null;
            }
          }

          pCampo.valorText = pCampo.valorText.replaceAll("/", "-");
          pCampo.valorFecha = new Date(pCampo.valorText);
          // Esto es por el formato de la ubicacion en colombia
          pCampo.valorFecha.setHours(pCampo.valorFecha.getHours() + 5);
        }
      }
      break;
    case DocumentoPlantillaCaracteristicaEnum.NUMERO:
      pCampo.valorNumero = Number(pCampo.valorText);
      break;
    case DocumentoPlantillaCaracteristicaEnum.CONFIGURACION:
      pCampo.valorOpcion = pCampo.valorText;
      break;
    case DocumentoPlantillaCaracteristicaEnum.ARCHIVO:
      pCampo.valorOpcion = pCampo.valorText;
      pCampo.valorText = 'SIN CARGAR';
      break;
    case DocumentoPlantillaCaracteristicaEnum.PROCESO:
      const herencia = PlantillaHelper.buscarPropiedad(
        pCampo.campoDTO.propiedades,
        PlantillaHelper.CAMPO_HEREDADO
      );
      const multiple = PlantillaHelper.buscarPropiedad(
        pCampo.campoDTO.propiedades,
        PlantillaHelper.MULTIPLE
      );
      if (herencia != null) {
        //Cambie de null a devolver el campo
        return pCampo;
      } else {
        if(multiple) {
          pCampo.expedientes = [];
          const multiple = new PedidoVentaDTO();
          //multiple.llaveTabla = iPedidoVenta.llaveTabla;
          multiple.nombre = pCampo.valorText;
          pCampo.expedientes.push(multiple);
          return pCampo;
        } else {
          /*const autoload = PlantillaHelper.buscarPropiedad(
            pCampo.campoDTO.propiedades,
            PlantillaHelper.AUTOLOAD
          );
          if (autoload) {
            const disponibles = pCampo.campoDTO.documentos;
            if (disponibles) {
              for (let index = 0; index < disponibles.length; index++) {
                const opcion = disponibles[index];
                if (opcion.nombre === pCampo.valorText || opcion.nombre === pCampo.valorText) {
                  pCampo.valorOpcion = opcion.llaveTabla;
                  return pCampo;
                }
              }
              Swal.fire('Info',
                'El codigo del documento no se encuentra en los que tiene cargados el campo : ' +
                pCampo.valorText, 'error'
              );
              return null;
            } else {
              Swal.fire('Info', 'El campo es autoload pero no tiene cargado items', 'error');
              return null;
            }
          } else {*/
            const plantilla = PlantillaHelper.buscarValorMultiple(
              pCampo.campoDTO.propiedades,
              PlantillaHelper.PLANTILLA_AUXILIAR
            );
            if (!plantilla) {
              Swal.fire('Falta configurar campo',
                'El campo '  + pCampo.campoDTO.nombre +' no tiene una fuente de datos en donde pueda buscar el numero del documento.',
                'info'
              );
              return null;
            } else {
              return pCampo;
            }
          //}
        }
        
      }

  }
  return result;
}
