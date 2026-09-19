import { ManualAccountAuxiliarDTO } from './ManualAccountAuxiliarDTO';
import { ManualAccountDTO } from './ManualAccountDTO';

export class VoucherLine {
	line: ManualAccountDTO;
	references: ManualAccountAuxiliarDTO[];
}