
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
}