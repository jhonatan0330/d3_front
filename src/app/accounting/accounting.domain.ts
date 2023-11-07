
export class CatalogDTO {
	key: string;
	state: string;
	name: string;
	code: string;
	initialDate: Date;
	finalDate: Date;
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
	mapDate: Date;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	quantity: number;
	percentaje: number;
	lastBalance: number;
	positive: number;
	negative: number;
	value: number;
	type: string;;
}