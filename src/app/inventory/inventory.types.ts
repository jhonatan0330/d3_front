
import { DetallePedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicDTO, BasicParamDTO } from "app/shared/shared.domain";

export class ProductoInventarioDTO extends BasicDTO {
  producto: string;
  nombre: string;
  codigo: string;
  bodega: string;
  nombreBodega: string;
  cantidadActual: number;
  cantidadMinima: number;
  cantidadMaxima: number;
  cantidadModificar: number;
  fechaInicial: Date;
}

export class UsuarioRolProductoDTO extends BasicDTO {
  documento: string;
  documentoNombre: string;
  producto: string;
  productoNombre: string;
  nombre: string;
  modificador: string;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
}
export class ProductoDTO extends BasicParamDTO {
  nombre: string;
  codigo: string;
  filtros: string;
  imagen: string;
  descripcion: string;
  categoria: string;
  categoriaNombre: string;
  categoriaPlantilla: string;
  usuarioRol: string;
  valorMinimoPromocion: number;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
  detallePlantilla: DetallePedidoVentaDTO;
  documento: string;
  productoBase: string;
  baseNombre: string;
  templateFields: string;
}


export interface InventoryPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}