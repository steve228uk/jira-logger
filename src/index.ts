#!/usr/bin/env bun

import { parseArgs } from "node:util";
import { getConfig } from "./lib/config.ts";
import { logTimeCommand } from "./commands/log.ts";
import { setupCommand } from "./commands/setup.ts";
import { installSkillCommand } from "./commands/install-skill.ts";

process.on("SIGINT", () => {
	console.log("\n\nCancelled.");
	process.exit(0);
});

class ExitPromptError extends Error {}

const args = parseArgs({
	options: {
		ticket: { type: "string", short: "t" },
		time: { type: "string", short: "T" },
		comment: { type: "string", short: "c" },
		version: { type: "boolean", short: "v" },
		help: { type: "boolean", short: "h" },
	},
	allowPositionals: true,
});

const config = getConfig();

if (args.values.help) {
	console.log(`
jira-logger - CLI tool for logging time against Jira tickets

USAGE:
  jira-logger [options] [command]

COMMANDS:
  log              Log time against a Jira ticket (default)
  setup            Initial configuration wizard
  install-skill    Install skill for AI tools

OPTIONS:
  -t, --ticket <ticket>    Jira ticket (e.g., PROJ-123)
  -T, --time <time>        Time spent (e.g., 1h30m, 2h, 90m)
  -c, --comment <comment>  Worklog comment
  -h, --help               Show this help message
  -v, --version            Show version

EXAMPLES:
  jira-logger                              # Interactive mode
  jira-logger log -t PROJ-123 -T 1h30m     # Log 1h30m to PROJ-123
  jira-logger setup                        # Configure credentials
  jira-logger install-skill                # Install AI tool skill
`);
	process.exit(0);
}

if (args.values.version) {
	console.log("jira-logger v1.0.0");
	process.exit(0);
}

const command = args.positionals[0] || "log";

async function run() {
	try {
		switch (command) {
			case "log": {
				const ticket = args.values.ticket as string | undefined;
				const time = args.values.time as string | undefined;
				const comment = args.values.comment as string | undefined;

				if (ticket && time) {
					const { logTimeNonInteractive } = await import("./commands/log.ts");
					await logTimeNonInteractive({ ticket, time, comment });
				} else if (ticket || time) {
					console.error(
						"Error: Both --ticket and --time are required for non-interactive mode",
					);
					console.error("Use --help for usage information");
					process.exit(1);
				} else {
					await logTimeCommand(config);
				}
				break;
			}
			case "setup": {
				await setupCommand();
				break;
			}
			case "install-skill": {
				await installSkillCommand();
				break;
			}
			default:
				console.error(`Unknown command: ${command}`);
				console.error("Use --help for usage information");
				process.exit(1);
		}
	} catch (e: any) {
		if (e instanceof ExitPromptError || e?.message?.includes("ExitPromptError")) {
			console.log("\n\nCancelled.");
			process.exit(0);
		}
		throw e;
	}
}

run();
