# CLI Usage Reference

## Commands

```bash
# Log time (interactive - default)
jira-time-logger

# Log time (non-interactive)
jira-time-logger log -t PROJ-123 -T 1h30m

# Setup wizard
jira-time-logger setup

# Install skill for AI tools
jira-time-logger install-skill
```

## Time Formats

The CLI accepts flexible time formats:
- `1h30m` or `1h 30m` - 1 hour 30 minutes
- `2h` - 2 hours
- `90m` - 90 minutes
- `90` - 90 minutes (auto-detected as minutes if < 60)

## Git Integration

The CLI automatically detects the Jira ticket from your current git branch:
- `feature/PROJ-123-description` → PROJ-123
- `bugfix/PROJ-456-fix` → PROJ-456
- `PROJ-789-feature` → PROJ-789

## Configuration

Credentials are stored in `~/.config/jira-time-logger/config.json`
or via environment variables:
- `JIRA_HOST`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT` (optional, default project prefix)
