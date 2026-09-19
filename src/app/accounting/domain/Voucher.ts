import { ManualDTO } from './ManualDTO';
import { VoucherLine } from './VoucherLine';

export class Voucher {
	header: ManualDTO;
	records: VoucherLine[];
}