import { BinarioComponent } from 'app/modules/full/neuron/form/controls/binario/binario.component';
import { CroquisComponent } from 'app/modules/full/neuron/form/controls/croquis/croquis.component';
import { FechaComponent } from 'app/modules/full/neuron/form/controls/fecha/fecha.component';
import { NumeroComponent } from 'app/modules/full/neuron/form/controls/numero/numero.component';
import { DetalleComponent } from 'app/modules/full/neuron/form//controls/detalle/detalle.component';
import { ProcesoComponent } from 'app/modules/full/neuron/form//controls/proceso/proceso.component';
import { SeccionComponent } from 'app/modules/full/neuron/form/controls/seccion/seccion.component';
import { TextoComponent } from 'app/modules/full/neuron/form/controls/texto/texto.component';
import { ConfiguracionComponent } from 'app/modules/full/neuron/form/controls/configuracion/configuracion.component';
import { DisponibilidadComponent } from 'app/modules/full/neuron/form/controls/disponibilidad/disponibilidad.component';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import {
  DocumentoPlantillaCaracteristicaDTO,
} from 'app/modules/full/neuron/model/sw42.domain';
import { Type } from '@angular/core';

import { ProductoListaComponent } from 'app/modules/full/neuron/form/controls/producto-lista/producto-lista.component';
import { GpsComponent } from 'app/modules/full/neuron/form/controls/gps/gps.component';
import { ArchivoComponent } from 'app/modules/full/neuron/form/controls/archivo/archivo.component';
import { InformativeComponent } from './form/controls/informative/informative.component';

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
    case DocumentoPlantillaCaracteristicaEnum.INFORMATIVE:
      componentDynamic = InformativeComponent;
      break;
    default:
      componentDynamic = TextoComponent;
      break;
  }
  return componentDynamic;
}

