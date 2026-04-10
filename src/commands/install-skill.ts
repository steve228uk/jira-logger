import inquirer from "inquirer";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync, cpSync } from "node:fs";
import { logHeader, logSuccess } from "../lib/ui.ts";

const CLI_SOURCE = process.cwd();

export async function installSkillCommand() {
	try {
		logHeader("Install Jira Time Logger Skill");

		const selections = await inquirer.prompt([
			{
				type: "checkbox",
				name: "tools",
				message: "Which AI tools should this skill be installed for?",
				choices: [
					{
						name: "Claude Code",
						value: "claude",
						checked: true,
					},
					{
						name: "Cursor AI",
						value: "cursor",
						checked: false,
					},
					{
						name: "Windsurf",
						value: "windsurf",
						checked: false,
					},
				],
				validate: (input) =>
					input.length > 0 || "Select at least one tool",
			},
		]);

		if (selections.tools.length === 0) {
			console.log("No tools selected. Cancelled.");
			return;
		}

		const scopeAnswer = await inquirer.prompt([
			{
				type: "list",
				name: "scope",
				message:
					"User-level (all projects) or Project-level (current directory only)?",
				choices: [
					{
						name: "User-level (~/.claude/skills/)",
						value: "user",
					},
					{
						name: "Project-level (.claude/skills/)",
						value: "project",
					},
				],
				default: "user",
			},
		]);

		const userLevel = scopeAnswer.scope === "user";
		const installPaths = getInstallPaths(
			selections.tools as string[],
			userLevel,
		);

		console.log("\n=== Installation Summary ===\n");

		for (const { tool, path } of installPaths) {
			console.log(`  ${tool}: ${path}`);
		}

		const { confirm } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: "Proceed with installation?",
				default: true,
			},
		]);

		if (!confirm) {
			console.log("Installation cancelled.");
			return;
		}

		await installSkillFiles(installPaths);
	} catch (e: any) {
		if (e?.name === "ExitPromptError" || e?.message?.includes("SIGINT")) {
			console.log("\n\nCancelled.");
			process.exit(0);
		}
		throw e;
	}
}

function getInstallPaths(
	tools: string[],
	userLevel: boolean,
): Array<{ tool: string; path: string }> {
	const base = userLevel ? homedir() : process.cwd();
	const paths: Array<{ tool: string; path: string }> = [];

	for (const tool of tools) {
		switch (tool) {
			case "claude":
				paths.push({
					tool: "Claude Code",
					path: join(base, ".claude", "skills", "log-time"),
				});
				break;
			case "cursor":
				paths.push({
					tool: "Cursor AI",
					path: join(base, ".cursor", "skills", "log-time"),
				});
				break;
			case "windsurf":
				paths.push({
					tool: "Windsurf",
					path: join(base, ".codeium", "windsurf", "skills", "log-time"),
				});
				break;
		}
	}

	return paths;
}

async function installSkillFiles(
	paths: Array<{ tool: string; path: string }>,
) {
	for (const { tool, path } of paths) {
		try {
			mkdirSync(path, { recursive: true });

			const skillSource = join(CLI_SOURCE, "skills", "log-time");
			if (existsSync(skillSource)) {
				cpSync(skillSource, path, { recursive: true });
			} else {
				createSkillFiles(path);
			}

			console.log(`✓ Installed skill for ${tool} at ${path}`);
		} catch (err) {
			console.error(`✗ Failed to install for ${tool}: ${err}`);
		}
	}

	console.log("\n✓ Installation complete!");
	console.log("\nThe skill will now trigger when you mention logging time or");
	console.log("working on a Jira ticket. Try saying:");
	console.log('  "Log 1h 30m to PROJ-123"');
	console.log('  "I worked on PROJ-456 for 2 hours"');
}

function createSkillFiles(destPath: string) {
	const skillContent = `---
name: log-time
description: Log time against a Jira ticket. Use when developer mentions logging time, tracking hours, recording work done, estimating time spent, or wants to add a worklog to a Jira issue. Triggers on phrases like "log time", "track time", "add worklog", "record time", "I worked on PROJ-123", "estimate my time", or "how long have I worked on this". Always confirm the ticket and time before running the CLI.
---

# Log Time Skill

This skill helps developers log time against Jira tickets using the \`jira-time-logger\` CLI tool.

## How to Use

When the user wants to log time against a Jira ticket, run:

\`\`\`bash
jira-time-logger
\`\`\`

Or for non-interactive mode with all details provided:

\`\`\`bash
jira-time-logger log -t TICKET -T TIME -c "comment"
\`\`\`

## Time Estimation

If the user wants to **estimate** time spent (or asks "how long have I worked on this?"), use git to analyze their work:

### Step 1: Detect the Ticket

Check the current branch for a ticket number:

\`\`\`bash
git branch --show-current
\`\`\`

Look for patterns like \`PROJ-123\`, \`feature/PROJ-123\`, \`bugfix/PROJ-123\`, etc.

### Step 2: Estimate Time from Git History

Run these commands to estimate time spent:

\`\`\`bash
# Get the first commit on this branch (when work started)
git log --oneline --reverse --format="%h %ad %s" --date=short | head -1

# Count commits on this branch
git log --oneline main..HEAD 2>/dev/null || git log --oneline origin/main..HEAD 2>/dev/null || echo "Unable to determine commit count"

# Show recent activity
git log --oneline -10
\`\`\`

### Step 3: Calculate Estimate

Use this heuristic:
- **Per commit estimate**: ~15-30 minutes per meaningful commit
- **First commit date**: Use as work start time
- **Ask user**: "Based on [X] commits, I estimate ~[Y] hours. Does that sound right?"

### Step 4: Confirm with User

Always confirm the estimate with the user before logging:

\`\`\`
"I see you've made [X] commits on this branch since [date]. Based on that, I'd estimate about [Y] hours. Want me to log [Z]h [M]m?"
\`\`\`

## Arguments

- \`-t, --ticket <ticket>\`: Jira ticket (e.g., PROJ-123)
- \`-T, --time <time>\`: Time spent (e.g., 1h30m, 2h, 90m)
- \`-c, --comment <comment>\`: Optional worklog comment

## Examples

- Interactive mode: \`jira-time-logger\`
- Log time: \`jira-time-logger log -t PROJ-123 -T 1h30m\`
- With comment: \`jira-time-logger log -t PROJ-123 -T 2h -c "Completed feature implementation"\`
- Estimate time: Analyze git history and suggest estimate to user

## First Time Setup

If credentials aren't configured, run:

\`\`\`bash
jira-time-logger setup
\`\`\`

This will prompt for:
- Jira host (e.g., your-domain.atlassian.net)
- Email address
- API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens)
- Optional default project prefix
`;

	const cliUsageContent = `# CLI Usage Reference

## Commands

\`\`\`bash
# Log time (interactive - default)
jira-time-logger

# Log time (non-interactive)
jira-time-logger log -t PROJ-123 -T 1h30m

# Setup wizard
jira-time-logger setup

# Install skill for AI tools
jira-time-logger install-skill
\`\`\`

## Time Formats

The CLI accepts flexible time formats:
- \`1h30m\` or \`1h 30m\` - 1 hour 30 minutes
- \`2h\` - 2 hours
- \`90m\` - 90 minutes
- \`90\` - 90 minutes (auto-detected as minutes if < 60)

## Git Integration

The CLI automatically detects the Jira ticket from your current git branch:
- \`feature/PROJ-123-description\` → PROJ-123
- \`bugfix/PROJ-456-fix\` → PROJ-456
- \`PROJ-789-feature\` → PROJ-789

## Configuration

Credentials are stored in \`~/.config/jira-time-logger/config.json\`
or via environment variables:
- \`JIRA_HOST\`
- \`JIRA_EMAIL\`
- \`JIRA_API_TOKEN\`
- \`JIRA_PROJECT\` (optional, default project prefix)
`;

	mkdirSync(join(destPath, "references"), { recursive: true });

	writeFileSync(join(destPath, "SKILL.md"), skillContent);
	writeFileSync(join(destPath, "references", "cli-usage.md"), cliUsageContent);
}
