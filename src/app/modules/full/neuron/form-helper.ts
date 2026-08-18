import { Type } from '@angular/core';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { DocumentoPlantillaCaracteristicaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { ArchivoComponent } from 'app/modules/full/neuron/form/controls/archivo/archivo.component';
import { BinarioComponent } from 'app/modules/full/neuron/form/controls/binario/binario.component';
import { ConfiguracionComponent } from 'app/modules/full/neuron/form/controls/configuracion/configuracion.component';
import { CroquisComponent } from 'app/modules/full/neuron/form/controls/croquis/croquis.component';
import { DetalleComponent } from 'app/modules/full/neuron/form/controls/detalle/detalle.component';
import { DisponibilidadComponent } from 'app/modules/full/neuron/form/controls/disponibilidad/disponibilidad.component';
import { FechaComponent } from 'app/modules/full/neuron/form/controls/fecha/fecha.component';
import { GpsComponent } from 'app/modules/full/neuron/form/controls/gps/gps.component';
import { GpsMapComponent } from 'app/modules/full/neuron/form/controls/gps-map/gps-map.component';
import { InformativeComponent } from 'app/modules/full/neuron/form/controls/informative/informative.component';
import { NumeroComponent } from 'app/modules/full/neuron/form/controls/numero/numero.component';
import { ProcesoComponent } from 'app/modules/full/neuron/form/controls/proceso/proceso.component';
import { ProductoListaComponent } from 'app/modules/full/neuron/form/controls/producto-lista/producto-lista.component';
import { SeccionComponent } from 'app/modules/full/neuron/form/controls/seccion/seccion.component';
import { TextoComponent } from 'app/modules/full/neuron/form/controls/texto/texto.component';
import { VinculoComponent } from 'app/modules/full/neuron/form/controls/vinculo/vinculo.component';

const COMPONENT_MAP: Record<DocumentoPlantillaCaracteristicaEnum, Type<any>> = {
  [DocumentoPlantillaCaracteristicaEnum.ARCHIVO]:       ArchivoComponent,
  [DocumentoPlantillaCaracteristicaEnum.BINARIO]:       BinarioComponent,
  [DocumentoPlantillaCaracteristicaEnum.CONFIGURACION]: ConfiguracionComponent,
  [DocumentoPlantillaCaracteristicaEnum.CROQUIS]:       CroquisComponent,
  [DocumentoPlantillaCaracteristicaEnum.PRODUCTO]:      DetalleComponent,
  [DocumentoPlantillaCaracteristicaEnum.DISPONIBILIDAD]: DisponibilidadComponent,
  [DocumentoPlantillaCaracteristicaEnum.FECHA]:         FechaComponent,
  [DocumentoPlantillaCaracteristicaEnum.GPS]:           GpsComponent,
  [DocumentoPlantillaCaracteristicaEnum.GPS_MAP]:       GpsMapComponent,
  [DocumentoPlantillaCaracteristicaEnum.NUMERO]:        NumeroComponent,
  [DocumentoPlantillaCaracteristicaEnum.PROCESO]:       ProcesoComponent,
  [DocumentoPlantillaCaracteristicaEnum.TEXTO]:         TextoComponent,
  [DocumentoPlantillaCaracteristicaEnum.SECCION]:       SeccionComponent,
  [DocumentoPlantillaCaracteristicaEnum.PRODUCTO_LISTA]: ProductoListaComponent,
  [DocumentoPlantillaCaracteristicaEnum.INFORMATIVE]:   InformativeComponent,
  [DocumentoPlantillaCaracteristicaEnum.VINCULO]:       VinculoComponent,
};

export function getComponent(
  pCampo: DocumentoPlantillaCaracteristicaDTO
): Type<any> {
  return COMPONENT_MAP[pCampo.formato] ?? TextoComponent;
}
