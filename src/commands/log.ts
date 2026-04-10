import inquirer from "inquirer";
import type { Config, LogTimeOptions } from "../types.ts";
import { getConfig } from "../lib/config.ts";
import { getTicketFromGit } from "../lib/git.ts";
import { parseTime } from "../lib/time.ts";
import { logTime, verifyConnection, createJiraClient } from "../lib/jira.ts";
import { logHeader, logSuccess, logError } from "../lib/ui.ts";

class ExitPromptError extends Error {
	name = "ExitPromptError";
}

export async function logTimeCommand(config: Config | null) {
	if (!config) {
		console.log("No configuration found. Running setup...");
		const { setupCommand } = await import("./setup.ts");
		await setupCommand();
		return;
	}

	const detectedTicket = getTicketFromGit(config.defaultProject);

	logHeader("Jira Time Logger");

	let ticket: string;

	try {
		if (detectedTicket) {
			console.log(`Detected ticket from branch: ${detectedTicket}`);
			const { useDetected } = await inquirer.prompt([
				{
					type: "confirm",
					name: "useDetected",
					message: "Use this ticket?",
					default: true,
				},
			]);

			if (useDetected) {
				ticket = detectedTicket;
			} else {
				const answer = await inquirer.prompt([
					{
						type: "input",
						name: "ticket",
						message: "Enter ticket (e.g., PROJ-123):",
						validate: (input) =>
							input.trim().length > 0 || "Ticket is required",
					},
				]);
				ticket = answer.ticket;
			}
		} else {
			const answer = await inquirer.prompt([
				{
					type: "input",
					name: "ticket",
					message: "Enter ticket (e.g., PROJ-123):",
					validate: (input) =>
						input.trim().length > 0 || "Ticket is required",
				},
			]);
			ticket = answer.ticket;
		}

		const timeAnswer = await inquirer.prompt([
			{
				type: "input",
				name: "time",
				message: "Time spent (e.g., 1h30m, 2h, 90m):",
				validate: (input) => {
					try {
						parseTime(input);
						return true;
					} catch {
						return "Invalid time format";
					}
				},
			},
		]);

		const commentAnswer = await inquirer.prompt([
			{
				type: "input",
				name: "comment",
				message: "Comment (optional):",
			},
		]);

		const parsed = parseTime(timeAnswer.time);
		console.log(`  Time: ${parsed.formatted} (${parsed.totalSeconds} seconds)\n`);

		const { confirm } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: "Submit worklog?",
				default: true,
			},
		]);

		if (!confirm) {
			console.log("Cancelled.");
			return;
		}

		await submitWorklog(config, {
			ticket: ticket.trim(),
			timeSpent: timeAnswer.time.trim(),
			comment: commentAnswer.comment?.trim() || undefined,
		});
	} catch (e: any) {
		if (e?.name === "ExitPromptError" || e?.message?.includes("SIGINT")) {
			console.log("\n\nCancelled.");
			process.exit(0);
		}
		throw e;
	}
}

export async function logTimeNonInteractive(options: {
	ticket: string;
	time: string;
	comment?: string;
}) {
	const config = getConfig();
	if (!config) {
		logError("No configuration found. Run 'jira-logger setup' first.");
		process.exit(1);
	}

	await submitWorklog(config, {
		ticket: options.ticket,
		timeSpent: options.time,
		comment: options.comment,
	});
}

async function submitWorklog(config: Config, options: LogTimeOptions) {
	const client = createJiraClient(config);

	console.log("Verifying connection...");
	const connected = await verifyConnection(client);
	if (!connected) {
		logError("Failed to connect to Jira. Check your credentials.");
		process.exit(1);
	}
	console.log("");

	console.log(`Logging time to ${options.ticket}...`);
	console.log(`  Time: ${options.timeSpent}`);
	if (options.comment) {
		console.log(`  Comment: ${options.comment}`);
	}
	console.log("");

	const result = await logTime(client, config, options);

	logSuccess("Worklog added successfully!");
	console.log(`  Ticket: ${result.ticket}`);
	console.log(`  Time: ${result.timeSpent}`);
	console.log(`  Started: ${result.started}`);
	console.log(`  Link: ${result.ticketUrl}`);
}
