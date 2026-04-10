export const COLORS = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
};

export function logHeader(title: string) {
	const line = "─".repeat(40);
	console.log(`\n${COLORS.cyan}${COLORS.bold}`);
	console.log("╭" + line + "╮");
	console.log(`│ ${title.padEnd(38)} │`);
	console.log("╰" + line + "╯");
	console.log(`${COLORS.reset}\n`);
}

export function logSuccess(message: string) {
	console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

export function logError(message: string) {
	console.error(`${COLORS.yellow}✗${COLORS.reset} ${message}`);
}

export function logInfo(message: string) {
	console.log(`${COLORS.blue}ℹ${COLORS.reset} ${message}`);
}
