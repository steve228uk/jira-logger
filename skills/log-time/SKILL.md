---
name: log-time
description: Log time against a Jira ticket. Use when developer mentions logging time, tracking hours, recording work done, estimating time spent, or wants to add a worklog to a Jira issue. Triggers on phrases like "log time", "track time", "add worklog", "record time", "I worked on PROJ-123", "estimate my time", or "how long have I worked on this". Always confirm the ticket and time before running the CLI.
---

# Log Time Skill

This skill helps developers log time against Jira tickets using the `jira-time-logger` CLI tool.

## How to Use

When the user wants to log time against a Jira ticket, run:

```bash
jira-time-logger
```

Or for non-interactive mode with all details provided:

```bash
jira-time-logger log -t TICKET -T TIME -c "comment"
```

## Time Estimation

If the user wants to **estimate** time spent (or asks "how long have I worked on this?"), use git to analyze their work:

### Step 1: Detect the Ticket

Check the current branch for a ticket number:

```bash
git branch --show-current
```

Look for patterns like `PROJ-123`, `feature/PROJ-123`, `bugfix/PROJ-123`, etc.

### Step 2: Estimate Time from Git History

Run these commands to estimate time spent:

```bash
# Get the first commit on this branch (when work started)
git log --oneline --reverse --format="%h %ad %s" --date=short | head -1

# Count commits on this branch
git log --oneline main..HEAD 2>/dev/null || git log --oneline origin/main..HEAD 2>/dev/null || echo "Unable to determine commit count"

# Show recent activity
git log --oneline -10
```

### Step 3: Calculate Estimate

Use this heuristic:
- **Per commit estimate**: ~15-30 minutes per meaningful commit
- **First commit date**: Use as work start time
- **Ask user**: "Based on [X] commits, I estimate ~[Y] hours. Does that sound right?"

### Step 4: Confirm with User

Always confirm the estimate with the user before logging:

```
"I see you've made [X] commits on this branch since [date]. Based on that, I'd estimate about [Y] hours. Want me to log [Z]h [M]m?"
```

### Time Estimation Examples

If the user says "estimate my time" or "how long have I worked on this?":

1. Extract ticket from branch
2. Run git analysis commands
3. Calculate estimate based on commit count
4. Confirm with user
5. Run the CLI with confirmed values

## Arguments

- `-t, --ticket <ticket>`: Jira ticket (e.g., PROJ-123)
- `-T, --time <time>`: Time spent (e.g., 1h30m, 2h, 90m)
- `-c, --comment <comment>`: Optional worklog comment

## Examples

- Interactive mode: `jira-time-logger`
- Log time: `jira-time-logger log -t PROJ-123 -T 1h30m`
- With comment: `jira-time-logger log -t PROJ-123 -T 2h -c "Completed feature implementation"`
- Estimate time: Analyze git history and suggest estimate to user

## First Time Setup

If credentials aren't configured, run:

```bash
jira-time-logger setup
```

This will prompt for:
- Jira host (e.g., your-domain.atlassian.net)
- Email address
- API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens)
- Optional default project prefix
