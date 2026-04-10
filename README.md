# Jira Time Logger

A CLI tool for logging time against Jira tickets. Built with Bun and TypeScript.

## Features

- **Interactive mode** - Guided prompts for ticket detection, time entry, and confirmation
- **Git integration** - Automatically detects ticket from current branch name (e.g., `feature/PROJ-123-description` → `PROJ-123`)
- **Flexible time formats** - Accepts `1h30m`, `2h`, `90m`, or just `90` (minutes)
- **Non-interactive mode** - Pass flags directly for automation
- **AI tool integration** - Install as a skill for Claude Code, Cursor, Windsurf, etc.
- **Multiple AI tools** - Install the skill for one or more AI coding assistants

## Installation

### Using Bun (recommended)

```bash
bun install -g jira-logger
```

OR

```bash
bunx jira-logger
```

### Using npm

```bash
npm install -g jira-logger
```

OR

```bash
npx jira-logger
```

### From source

```bash
git clone <repo-url>
cd jira-logger
bun install
bun run build
# Then use ./dist/index.js or add to PATH
```

## Setup

Before using the CLI, configure your Jira credentials:

```bash
jira-logger setup
```

You'll be prompted for:
- **Jira host** - e.g., `your-domain.atlassian.net`
- **Email** - Your Jira account email
- **API Token** - Generate at https://id.atlassian.com/manage-profile/security/api-tokens
- **Default project** - Optional project prefix (e.g., `PROJ`)

### Environment Variables

Instead of running setup, you can set environment variables:

```bash
export JIRA_HOST="your-domain.atlassian.net"
export JIRA_EMAIL="you@company.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_PROJECT="PROJ"  # optional
```

## Usage

### Interactive Mode

```bash
jira-logger
```

The CLI will:
1. Detect the Jira ticket from your current git branch
2. Prompt for time spent
3. Optionally add a comment
4. Confirm and submit

### Non-Interactive Mode

```bash
jira-logger log -t PROJ-123 -T 1h30m -c "Implemented feature"
```

Arguments:
- `-t, --ticket` - Jira ticket (e.g., `PROJ-123`)
- `-T, --time` - Time spent (e.g., `1h30m`, `2h`, `90m`)
- `-c, --comment` - Optional worklog comment

### Time Formats

| Input | Interpretation |
|-------|----------------|
| `1h30m` or `1h 30m` | 1 hour 30 minutes |
| `2h` | 2 hours |
| `90m` | 90 minutes |
| `90` | 90 minutes |

### Git Branch Detection

The CLI parses your current branch to extract the ticket:

| Branch Pattern | Detected Ticket |
|---------------|-----------------|
| `feature/PROJ-123-description` | `PROJ-123` |
| `bugfix/PROJ-456-fix` | `PROJ-456` |
| `PROJ-789-feature` | `PROJ-789` |

## Installing the AI Skill

Enable AI assistants to use the Jira Time Logger with natural language:

```bash
jira-logger install-skill
```

You'll be prompted to select:
1. **AI tools** - Choose Claude Code, Cursor AI, Windsurf, etc.
2. **Scope** - User-level (all projects) or Project-level (current directory)

### AI Usage Examples

After installing, you can say:

- "Log 1h 30m to PROJ-123"
- "I worked on PROJ-456 for 2 hours"
- "Record 90 minutes on PROJ-789"

## Commands

| Command | Description |
|---------|-------------|
| `jira-logger` | Log time (interactive, default) |
| `jira-logger log` | Log time (same as default) |
| `jira-logger log -t TICKET -T TIME` | Log time (non-interactive) |
| `jira-logger setup` | Configure credentials |
| `jira-logger install-skill` | Install AI tool skill |
| `jira-logger --help` | Show help |

## Configuration

Credentials are stored in `~/.config/jira-logger/config.json`.

To update credentials:
```bash
jira-logger setup
```

## Troubleshooting

### "Failed to connect to Jira"

1. Verify your credentials with `jira-logger setup`
2. Check your API token is valid at https://id.atlassian.com/manage-profile/security/api-tokens
3. Ensure your email matches your Jira account

### "403 Forbidden"

Your account may not have permission to log work on this issue. Check with your Jira administrator.

## License

MIT
