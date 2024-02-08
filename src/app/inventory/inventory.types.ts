
import { DetallePedidoVentaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { BasicDTO, BasicParamDTO } from "app/shared/shared.domain";

export class CategoriaProductoDTO extends BasicParamDTO {
  nombre: string;
  imagen: string;
  cantidadMaxima: number;
  nodoSuperior: string;
  hijos: CategoriaProductoDTO[];
  inventarios: boolean;
  camposAdicionales: boolean;
  composicion: boolean;
  promocionBase: number;
}
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
export class ProductoCaracteristicaDTO extends BasicDTO {
  objetivo: string;
  base: string;
  baseNombre: string;
  formato: string;
  nombre: string;
  codigo: string;
  orden: number;
  imagen: string;
  //caracteristicas: PedidoVentaDTO[];
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
  usuarioRol: string;
  valorMinimoPromocion: number;
  cantidadPromocion: number;
  cantidadPromocionBase: number;
  detallePlantilla: DetallePedidoVentaDTO;
  documento: string;
  productoBase: string;
  baseNombre: string;
  campos: ProductoCaracteristicaDTO[];
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