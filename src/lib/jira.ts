import { Version3Client } from "jira.js";
import type { Config, LogTimeOptions } from "../types.ts";
import { formatTimeForJira, getISODate } from "./time.ts";

export interface WorklogResult {
	id: string;
	timeSpent: string;
	started: string;
	comment?: string;
	ticket: string;
	ticketUrl: string;
}

export function createJiraClient(config: Config): Version3Client {
	return new Version3Client({
		host: `https://${config.host}`,
		authentication: {
			basic: {
				email: config.email,
				apiToken: config.apiToken,
			},
		},
	});
}

export async function logTime(
	client: Version3Client,
	config: Config,
	options: LogTimeOptions,
): Promise<WorklogResult> {
	const { ticket, timeSpent, comment, started } = options;

	const parsedTime = parseTimeString(timeSpent);

	const result = await client.issueWorklogs.addWorklog({
		issueIdOrKey: ticket,
		timeSpent: formatTimeForJira(parsedTime),
		started: started || getISODate(),
		...(comment && { comment }),
	});

	const ticketUrl = `https://${config.host}/browse/${ticket}`;

	return {
		id: result.id,
		timeSpent: result.timeSpent,
		started: result.started,
		comment,
		ticket,
		ticketUrl,
	};
}

function parseTimeString(timeSpent: string): number {
	timeSpent = timeSpent.trim().toLowerCase();

	const hMatch = timeSpent.match(/(\d+)h/);
	const mMatch = timeSpent.match(/(\d+)m/);

	let hours = 0;
	let minutes = 0;

	if (hMatch) hours = parseInt(hMatch[1], 10);
	if (mMatch) minutes = parseInt(mMatch[1], 10);

	if (!hMatch && !mMatch) {
		const val = parseInt(timeSpent, 10);
		if (!isNaN(val)) {
			if (val < 60) {
				minutes = val;
			} else {
				hours = Math.floor(val / 60);
				minutes = val % 60;
			}
		}
	}

	return (hours * 60 + minutes) * 60;
}

export async function verifyConnection(client: Version3Client): Promise<boolean> {
	try {
		const myself = await client.myself.getCurrentUser();
		return !!myself;
	} catch {
		return false;
	}
}
