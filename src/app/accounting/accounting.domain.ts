
export class CatalogDTO {
	key: string;
	state: string;
	name: string;
	code: string;
	initialDate: Date;
	finalDate: Date;
	accounts: AccountDTO[];
}

export class AccountDTO {
	key: string;
	state: string;
	catalog: string;
	code: string;
	name: string;
	parent: string;
	template: string;
	field: string;
	type: string;
	operation: string;
	status: string;
	wbs: string;
}

export class ResultMapDTO {
	key: string;
	state: string;
	catalog: string;
	account: string;
	accountName: string;
	accountCode: string;
	level: number;
	startDate: Date;
	endDate: Date;
	period: string;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	quantity: number;
	average: number;
	lastBalance: number;
	nextBalance: number;
	positive: number;
	negative: number;
	value: number;
	type: string;;
}



export class ManualDTO {
	key: string;
	state: string;
	catalog: string;
	code: string;
	concept: string;
	factDate: Date;
	registerUser: Date;
	registerDate: Date;
	value: number;
}

export class ManualAccountDTO {
	key: string;
	state: string;
	account: string;
	accountName: string;
	accountDTO: AccountDTO;
	positive: number;
	negative: number;
	note: string;
	third: string;
	thirdName: string;
}

export class Voucher{
	manual: ManualDTO;
	records: ManualAccountDTO[];
}