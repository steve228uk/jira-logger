export interface Config {
	host: string;
	email: string;
	apiToken: string;
	defaultProject?: string;
}

export interface LogTimeOptions {
	ticket: string;
	timeSpent: string;
	comment?: string;
	started?: string;
}

export interface ParsedTime {
	hours: number;
	minutes: number;
	totalSeconds: number;
	formatted: string;
}
