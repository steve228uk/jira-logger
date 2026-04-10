import type { ParsedTime } from "../types.ts";

export function parseTime(input: string): ParsedTime {
	input = input.trim().toLowerCase();

	const patterns = [
		/^(\d+)h\s*(\d+)?m?$/,
		/^(\d+)m$/,
		/^(\d+)h$/,
		/^(\d+)$/,
	];

	let hours = 0;
	let minutes = 0;

	if (input.includes("h") || input.includes("m")) {
		const hMatch = input.match(/(\d+)h/);
		const mMatch = input.match(/(\d+)m/);

		if (hMatch) hours = parseInt(hMatch[1], 10);
		if (mMatch) minutes = parseInt(mMatch[1], 10);

		if (!hMatch && !mMatch) {
			const numOnly = input.match(/^(\d+)$/);
			if (numOnly) {
				const val = parseInt(numOnly[1], 10);
				if (val < 60) {
					minutes = val;
				} else {
					hours = Math.floor(val / 60);
					minutes = val % 60;
				}
			}
		}
	} else {
		const val = parseInt(input, 10);
		if (isNaN(val)) {
			throw new Error(`Invalid time format: ${input}`);
		}
		if (val < 60) {
			minutes = val;
		} else {
			hours = Math.floor(val / 60);
			minutes = val % 60;
		}
	}

	const totalSeconds = (hours * 60 + minutes) * 60;

	let formatted = "";
	if (hours > 0) formatted += `${hours}h`;
	if (minutes > 0) formatted += `${minutes}m`;

	return {
		hours,
		minutes,
		totalSeconds,
		formatted: formatted || "0m",
	};
}

export function formatTimeForJira(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0 && minutes > 0) {
		return `${hours}h ${minutes}m`;
	} else if (hours > 0) {
		return `${hours}h`;
	} else {
		return `${minutes}m`;
	}
}

export function getISODate(date?: Date): string {
	const d = date ?? new Date();
	const pad = (n: number) => n.toString().padStart(3, "0");
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	const hours = d.getHours().toString().padStart(2, "0");
	const mins = d.getMinutes().toString().padStart(2, "0");
	const secs = d.getSeconds().toString().padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${mins}:${secs}.${pad(d.getMilliseconds())}+0000`;
}
