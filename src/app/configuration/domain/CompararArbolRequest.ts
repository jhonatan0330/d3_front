import { ArbolConfiguracionFilterDTO } from './ArbolConfiguracionFilterDTO';
import { TreeNodeDTO } from './TreeNodeDTO';

export class CompararArbolRequest {
    arbol: TreeNodeDTO;
    filter: ArbolConfiguracionFilterDTO;
}