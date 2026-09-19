import { AccountDTO } from './AccountDTO';

export class ManualAccountDTO {
	key: string;
	state: string;
	account: string;
	accountName: string;
    accountCode: string;
	accountDTO: AccountDTO;
	positive: number;
	negative: number;
	note: string;
}