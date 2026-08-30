/**
 * Tipos del dominio documents — espejo de contract.md §6
 *
 * PedidoVentaDTO: { llaveTabla, estado, plantilla, nombre, ... }
 * PedidoVentaFilterDTO: { paginacionRegistroInicial, paginacionRegistroFinal, filtroParametro, ... }
 * PedidoVentaAjusteDTO: { llaveTabla, estado, documento, estadoInicial, estadoFinal, motivo, ... }
 * PedidoVentaCaracteristicaDTO: { llaveTabla, estado, documento, campo, valorText, ... }
 * DocumentoPlantillaDTO: { llaveTabla, estado, nombre, consecutivo, caracteristicas, ... }
 *
 * Endpoints: POST /document/api/guardarDocumento, POST /document/api/consultarDocumento,
 *            POST /document/api/listarDocumentos, POST /document/api/changeState, ...
 */

export {
    PedidoVentaDTO,
    PedidoVentaFilterDTO,
    PedidoVentaAjusteDTO,
    PedidoVentaAjusteFilterDTO,
    PedidoVentaCaracteristicaDTO,
    PedidoVentaCaracteristicaFilterDTO,
    PedidoVentaDineroDTO,
    DetallePedidoVentaDTO,
    DetallePedidoVentaFilterDTO,
    DocumentoPlantillaDTO,
    DocumentoPlantillaFilterDTO,
    DocumentoPlantillaCaracteristicaDTO,
    DocumentoPlantillaCaracteristicaFilterDTO,
    ProcesoEstadoDTO,
    ProcesoEstadoFilterDTO,
    ProcesoTransicionDTO,
    ProcesoTransicionFilterDTO,
    ProductoDTO,
    ProductoFilterDTO,
    ProductoInventarioDTO,
    ReporteBaseDTO,
    ReporteBaseFilterDTO,
    WebServiceDTO,
    WebServiceFilterDTO,
    WebServiceEjecucionDTO,
    WebServiceEjecucionFilterDTO,
} from 'app/document/model/sw42.domain';
