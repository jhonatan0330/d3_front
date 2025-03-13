
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
    level:number;
}


export class TimeFrame {
	key: string;
	state: string;
	level: number;
	code: string;
	startDate: Date;
	endDate: Date;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
}

export class ResultMapDTO {
	key: string;
	state: string;
	catalog: string;
	account: string;
	accountName: string;
	accountCode: string;
	timeFrame: string;
	timeFrameName: string;
	quantity: number;
	average: number;
	lastBalance: number;
	nextBalance: number;
	positive: number;
	negative: number;
	value: number;
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
    accountCode: string;
	accountDTO: AccountDTO;
	positive: number;
	negative: number;
	note: string;
	third: string;
	thirdName: string;
}

export class Voucher{
	header: ManualDTO;
	records: ManualAccountDTO[];
}

export class VoucherPrepareRequest{
	serviceId: string;
	documentId: string;
}