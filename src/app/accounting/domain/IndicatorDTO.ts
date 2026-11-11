import { NodoArbolDTO } from 'app/configuration/domain/NodoArbolDTO';
import { IndicatorTargetDTO } from './IndicatorTargetDTO';
import type { TimeFrame } from './TimeFrame';
import type { ResultMapDTO } from './ResultMapDTO';

export class IndicatorDTO extends NodoArbolDTO {
  targets?: IndicatorTargetDTO[];
  periodo?: TimeFrame;
  datos?: ResultMapDTO[];
}
