import { execSync } from "node:child_process";
import type { Config } from "../types.ts";

export function getCurrentBranch(): string | null {
	try {
		const branch = execSync("git branch --show-current", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		return branch || null;
	} catch {
		return null;
	}
}

export function extractTicketFromBranch(branch: string, defaultProject?: string): string | null {
	if (!branch) return null;

	const patterns = [
		/(PROJ-\d+)/i,
		/(?:feature|bugfix|hotfix|release)\/(PROJ-\d+)/i,
	];

	for (const pattern of patterns) {
		const match = branch.match(pattern);
		if (match) {
			return match[1].toUpperCase();
		}
	}

	if (defaultProject) {
		const shortPattern = new RegExp(`^(${defaultProject}-\\d+)`, "i");
		const shortMatch = branch.match(shortPattern);
		if (shortMatch) {
			return shortMatch[1].toUpperCase();
		}
	}

	return null;
}

export function getTicketFromGit(defaultProject?: string): string | null {
	const branch = getCurrentBranch();
	if (!branch) return null;
	return extractTicketFromBranch(branch, defaultProject);
}
