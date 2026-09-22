import { MassiveParseLineDTO } from './MassiveParseLineDTO';

export interface MassiveParseResponse {
  lines: MassiveParseLineDTO[];
  camposSinValidar: string[];
}
