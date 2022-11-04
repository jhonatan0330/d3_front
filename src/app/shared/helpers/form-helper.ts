import { ArchivoComponent } from '../../views/form/controls/archivo/archivo.component';
import { BinarioComponent } from '../../views/form/controls/binario/binario.component';
import { CroquisComponent } from '../../views/form/controls/croquis/croquis.component';
import { FechaComponent } from '../../views/form/controls/fecha/fecha.component';
import { NumeroComponent } from '../../views/form/controls/numero/numero.component';
import { DetalleComponent } from '../../views/form/controls/detalle/detalle.component';
import { ProcesoComponent } from '../../views/form/controls/proceso/proceso.component';
import { SeccionComponent } from '../../views/form/controls/seccion/seccion.component';
import { TextoComponent } from '../../views/form/controls/texto/texto.component';
import { ConfiguracionComponent } from '../../views/form/controls/configuracion/configuracion.component';
import { DisponibilidadComponent } from '../../views/form/controls/disponibilidad/disponibilidad.component';
import { DocumentoPlantillaCaracteristicaEnum } from '../../model/sw42.enum';
import {
  DocumentoPlantillaCaracteristicaDTO,
  DocumentoPlantillaDTO,
  PedidoVentaCaracteristicaDTO,
} from '../../model/sw42.domain';
import { Type } from '@angular/core';

import { formatDate } from '@angular/common';
import { PlantillaHelper } from './plantilla-helper';
import * as moment from 'moment';
import { ProductoListaComponent } from 'app/views/form/controls/producto-lista/producto-lista.component';
import { GpsComponent } from 'app/views/form/controls/gps/gps.component';
import Swal from 'sweetalert2';


export function getFieldFromTemplate(template:DocumentoPlantillaDTO, fieldId:String): DocumentoPlantillaCaracteristicaDTO{
  if(!template || !template.caracteristicas) return null;
  for (let index = 0; index < template.caracteristicas.length; index++) {
    const element = template.caracteristicas[index];
    if(element.llaveTabla=== fieldId) return element;
  }
  return null;
}


export function getComponent(
  pCampo: DocumentoPlantillaCaracteristicaDTO
): Type<any> {
  let componentDynamic: Type<any>;
  switch (pCampo.formato) {
    case DocumentoPlantillaCaracteristicaEnum.ARCHIVO:
      componentDynamic = ArchivoComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.BINARIO:
      componentDynamic = BinarioComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.CONFIGURACION:
      componentDynamic = ConfiguracionComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.CROQUIS:
      componentDynamic = CroquisComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.PRODUCTO:
      componentDynamic = DetalleComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.DISPONIBILIDAD:
      componentDynamic = DisponibilidadComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.FECHA:
      componentDynamic = FechaComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.GPS:
      componentDynamic = GpsComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.NUMERO:
      componentDynamic = NumeroComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.PROCESO:
      componentDynamic = ProcesoComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.TEXTO:
      componentDynamic = TextoComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.SECCION:
      componentDynamic = SeccionComponent;
      break;
    case DocumentoPlantillaCaracteristicaEnum.PRODUCTO_LISTA:
      componentDynamic = ProductoListaComponent;
      break;
    default:
      componentDynamic = TextoComponent;
      break;
  }
  return componentDynamic;
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
      if(pCampo.valorText){
        const fechaHora = PlantillaHelper.buscarPropiedad(
          pCampo.campoDTO.propiedades,
          PlantillaHelper.FECHA_CON_HORA
        );
        let formatoDate = '';
        if (Number(pCampo.valorText)){
          pCampo.valorFecha = new Date((Number(pCampo.valorText) - 25568.791)*86400*1000); // Este valor lo saque a prueba y error
        } else {
          if (fechaHora){
            formatoDate = 'DD/MM/YYYY HH:mm';        
          } else {
            formatoDate = 'DD/MM/YYYY';
          }
          if (moment(pCampo.valorText, formatoDate, true).isValid()) {
            pCampo.valorFecha = moment(pCampo.valorText, formatoDate).toDate();
          }else {
            pCampo.valorFecha = null
          }
        }
        
        if (!pCampo.valorFecha) {
          Swal.fire('Formato incorrecto',
            'El valor fecha no esta con el formato correcto. ' + formatoDate + '\nLa fecha actualmente tiene este formato ' + pCampo.valorText,
            'error'
          );
          return null;
        }
      }
      break;
    case DocumentoPlantillaCaracteristicaEnum.NUMERO:
      pCampo.valorNumero = Number(pCampo.valorText);
      break;
    case DocumentoPlantillaCaracteristicaEnum.CONFIGURACION:
        pCampo.valorOpcion = pCampo.valorText;
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
      if (multiple || herencia != null) {
        return null;
      } else {
        const autoload = PlantillaHelper.buscarPropiedad(
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
                pCampo.valorText, 'info'
            );
            return null;
          } else {
            Swal.fire('Info','El campo es autoload pero no tiene cargado items');
            return null;
          }
        } else {
          const plantilla = PlantillaHelper.buscarValorMultiple(
            pCampo.campoDTO.propiedades,
            PlantillaHelper.PLANTILLA_AUXILIAR
          );
          if (!plantilla) {
            Swal.fire('Formato incorrecto',
              'Por el momento no se a desarrollado items sin plantilla auxiliar',
              'info'
            );
            return null;
          } else {
            return pCampo;
          }
        }
      }
      
  }
  return result;
}
