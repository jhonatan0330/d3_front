import { AccountDTO } from './AccountDTO';

export class CatalogDTO {
	key: string;
	state: string;
	name: string;
	code: string;
	initialDate: Date;
	finalDate: Date;
	accounts: AccountDTO[];
	template: string;
}