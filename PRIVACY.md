# Privacy

Starcat uTools Plugin is a local launcher adapter. It does not operate an
independent backend and does not collect analytics.

## Data flow

When a user searches:

1. uTools passes the query to this plugin.
2. The plugin passes it as one argv element to the locally installed
   `starcat search` command.
3. Starcat performs local repository search and, when enabled, GitHub Search
   under Starcat's existing account and privacy settings.
4. The plugin receives the resulting JSON and renders a transient uTools list.

## Storage

The plugin does not persist:

- search queries or results;
- private repository names or descriptions;
- Starcat pairing data or local API keys;
- GitHub tokens;
- CLI stdout or stderr;
- avatar files.

uTools, Starcat, GitHub, and the operating system remain governed by their own
privacy settings and policies.

## Network access

The plugin does not call the Starcat MCP endpoint or GitHub API directly. The
only direct network resources it may ask uTools to render are public GitHub
owner or organization avatars supplied by Starcat.
