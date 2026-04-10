import { Config } from "../types.ts";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const CONFIG_DIR = join(homedir(), ".config", "jira-logger");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function getConfigFromEnv(): Config | null {
	const host = process.env.JIRA_HOST;
	const email = process.env.JIRA_EMAIL;
	const apiToken = process.env.JIRA_API_TOKEN;

	if (!host || !email || !apiToken) {
		return null;
	}

	return {
		host,
		email,
		apiToken,
		defaultProject: process.env.JIRA_PROJECT,
	};
}

export function getConfigFromFile(): Config | null {
	if (!existsSync(CONFIG_FILE)) {
		return null;
	}

	try {
		const content = readFileSync(CONFIG_FILE, "utf-8");
		return JSON.parse(content) as Config;
	} catch {
		return null;
	}
}

export function getConfig(): Config | null {
	return getConfigFromEnv() ?? getConfigFromFile();
}

export function saveConfig(config: Config): void {
	mkdirSync(CONFIG_DIR, { recursive: true });
	writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function configExists(): boolean {
	return getConfig() !== null;
}

export function getConfigPath(): string {
	return CONFIG_FILE;
}
