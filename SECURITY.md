# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities through
[GitHub Security Advisories](https://github.com/starcat-app/starcat-utools-plugin/security/advisories/new). Do not publish credentials,
tokens, exploit details, private repositories, customer data, or Starcat private data in a
public issue.

Include the affected version or commit, environment, reproduction steps, and expected impact.
You should receive an acknowledgement within seven days.

## Supported versions

Security fixes are provided for the latest published stable release or the current default
branch when the project has not published a stable release.

## Project-specific boundaries

The plugin launches an installed `starcat` executable through an argv array and
accepts only absolute configured paths or known executable search locations. It
never invokes a shell.

Repository links are restricted to versioned `starcat://repo/{owner}/{repo}`
deep links and canonical `https://github.com/{owner}/{repo}` URLs. Avatar
requests are restricted to public GitHub image hosts and never include Starcat
or GitHub credentials.

The plugin does not read Starcat databases, Keychain items, local API keys,
pairing profiles, or GitHub tokens. It does not persist queries, repository
results, private descriptions, or CLI stderr.
