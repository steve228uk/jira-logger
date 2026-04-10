import inquirer from "inquirer";
import { getConfig, saveConfig, configExists, getConfigPath } from "../lib/config.ts";
import type { Config } from "../types.ts";
import { logHeader, logSuccess, logError, logInfo } from "../lib/ui.ts";

export async function setupCommand() {
	try {
		if (configExists()) {
			const config = getConfig();
			logInfo("Configuration already exists:");
			console.log(`  Host: ${config?.host}`);
			console.log(`  Email: ${config?.email}`);
			console.log(`  API Token: ${config?.apiToken ? "***" : "not set"}`);
			console.log(`  Default Project: ${config?.defaultProject || "not set"}`);
			console.log(`  Config file: ${getConfigPath()}`);

			const { overwrite } = await inquirer.prompt([
				{
					type: "confirm",
					name: "overwrite",
					message: "Overwrite existing configuration?",
					default: false,
				},
			]);

			if (!overwrite) {
				console.log("\nSetup cancelled.");
				return;
			}
		}

		logHeader("Jira Time Logger Setup");

		console.log(
			"This wizard will help you configure your Jira credentials.\n",
		);
		logInfo("You can also set these via environment variables:");
		console.log(
			"  JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT\n",
		);

		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "host",
				message: "Jira host (e.g., your-domain.atlassian.net):",
				validate: (input) =>
					input.trim().length > 0 || "Host is required",
			},
			{
				type: "input",
				name: "email",
				message: "Jira email:",
				validate: (input) =>
					input.trim().length > 0 || "Email is required",
			},
			{
				type: "password",
				name: "apiToken",
				message: "API Token:",
				mask: "*",
				validate: (input) =>
					input.trim().length > 0 || "API Token is required",
			},
			{
				type: "input",
				name: "defaultProject",
				message: "Default project prefix (optional, e.g., PROJ):",
			},
		]);

		const config: Config = {
			host: answers.host.trim(),
			email: answers.email.trim(),
			apiToken: answers.apiToken.trim(),
		};

		if (answers.defaultProject) {
			config.defaultProject = answers.defaultProject.trim().toUpperCase();
		}

		saveConfig(config);

		logSuccess("Configuration saved!");
		console.log(`  Config file: ${getConfigPath()}\n`);

		console.log("Verifying credentials...");
		const { createJiraClient, verifyConnection } = await import(
			"../lib/jira.ts"
		);
		const client = createJiraClient(config);
		const connected = await verifyConnection(client);

		if (connected) {
			logSuccess("Credentials verified successfully!");
		} else {
			logError("Failed to verify credentials. Please check your settings.");
			console.log(
				"  You can edit the config file manually or run setup again.",
			);
		}
	} catch (e: any) {
		if (e?.name === "ExitPromptError" || e?.message?.includes("SIGINT")) {
			console.log("\n\nCancelled.");
			process.exit(0);
		}
		throw e;
	}
}
