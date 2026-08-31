# Starcat uTools Plugin

<!-- starcat-promo:start -->
<div align="center">
<a href="https://starcat.ink"><img src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/banner.webp" width="100%" alt="Starcat" /></a>

<p><strong>Official uTools plugin for searching Starcat local repositories and GitHub.</strong></p>
<p>Starcat is a native macOS app that turns GitHub Stars into a searchable, organized and AI-assisted local knowledge base, with a broader ecosystem of desktop clients, plugins, CLI tools, and self-hostable services.</p>

<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/Install%20with-Homebrew-FBBF24?style=for-the-badge&logo=homebrew&logoColor=white" width="220" alt="Install with Homebrew"/></a>
<br/>
<sub><a href="./README-ZH.md">中文说明</a></sub>
</div>

<div align="center">
<a href="https://starcat.ink"><img src="https://img.shields.io/badge/website-starcat.ink-38BDF8?style=flat&color=blue" alt="website"/></a>
<a href="https://github.com/starcat-app/starcat-pro"><img src="https://img.shields.io/badge/support-starcat--pro-lightgrey.svg?style=flat&color=blue" alt="support"/></a>
<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/install-homebrew-lightgrey.svg?style=flat&color=blue" alt="homebrew"/></a>
<a href="https://github.com/starcat-app/starcat-localization"><img src="https://img.shields.io/badge/localization-open-lightgrey.svg?style=flat&color=blue" alt="localization"/></a>
</div>

<div align="center">
<img width="900" src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/main.webp" alt="Starcat main window"/>
</div>

**Preferred install method:**

```bash
brew tap starcat-app/starcat
brew trust starcat-app/starcat
brew install --cask starcat
```

**Useful links:**

- Home and downloads: https://starcat.ink
- Mac App Store: search for Starcat for GitHub
- Public support and release notes: https://github.com/starcat-app/starcat-pro
- Starcat App Homebrew tap: https://github.com/starcat-app/homebrew-starcat
- CLI / MCP: [starcat-cli](https://github.com/starcat-app/starcat-cli) / [Homebrew tap](https://github.com/starcat-app/homebrew-starcat-cli)
- AI Agent Skill: https://github.com/starcat-app/starcat-skill
- Browser plugins: [Chrome](https://github.com/starcat-app/starcat-chrome-plugin) / [Safari](https://github.com/starcat-app/starcat-safari-plugin)
- Launcher integrations: [Alfred](https://github.com/starcat-app/starcat-alfred-workflow) / [uTools](https://github.com/starcat-app/starcat-utools-plugin) / [Raycast](https://github.com/starcat-app/starcat-raycast-extension)
- Documentation: https://github.com/starcat-app/starcat-docs
- Website source: https://github.com/starcat-app/starcat-site
- Localization: https://github.com/starcat-app/starcat-localization

**Self-hostable support APIs:**

- [starcat-sharing-api](https://github.com/starcat-app/starcat-sharing-api)
- [starcat-trending-api](https://github.com/starcat-app/starcat-trending-api)
- [starcat-weekly-api](https://github.com/starcat-app/starcat-weekly-api)
- [starcat-wiki-api](https://github.com/starcat-app/starcat-wiki-api)
- [starcat-recommend-api](https://github.com/starcat-app/starcat-recommend-api)
- [starcat-discovery-api](https://github.com/starcat-app/starcat-discovery-api)
<!-- starcat-promo:end -->

Official uTools plugin for searching Starcat local repositories and GitHub.

[中文说明](./README-ZH.md)

[![CI](https://github.com/starcat-app/starcat-utools-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/starcat-app/starcat-utools-plugin/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## What it does

Open the `Starcat` command in uTools and type a repository keyword. The result
list preserves Starcat's search ordering and shows:

- repository owner/name;
- source attribution: `Starcat Local` or `GitHub`;
- primary language, star count, and description;
- the public owner or organization avatar.

Press Return to open a local result in Starcat through its constrained deep
link. A GitHub-only result opens on `github.com`.

## Architecture

The plugin is a thin launcher adapter:

```text
uTools list
  -> starcat search
  -> starcat.global_search_repos
  -> Starcat Local FTS + GitHub Search
```

It never reads the Starcat database, Keychain, local API key, pairing profile,
or GitHub token. Search, ranking, deduplication, authentication, and Starcat Pro
entitlement checks remain in Starcat and the CLI.

## Requirements

- macOS;
- uTools with template list plugin support;
- Starcat with the MCP service enabled;
- an active Starcat Pro entitlement;
- Starcat CLI v1.1.0 or newer, paired with Starcat.

Install the CLI with Homebrew:

```bash
brew install starcat-app/starcat-cli/starcat
starcat pair
starcat doctor
```

The plugin locates `starcat` from `PATH`, `/opt/homebrew/bin`,
`/usr/local/bin`, or `~/.local/bin`. Developers can set an absolute
`STARCAT_CLI_PATH`.

## Development

The runtime uses readable CommonJS and Node built-ins only. There are no
runtime npm dependencies.

```bash
npm ci
npm run verify
```

To run in uTools:

1. Install uTools and its Developer Tools plugin.
2. Choose this repository's `plugin.json`.
3. Enter the `Starcat` command.
4. Search for a repository.

The first version always searches both local and GitHub sources. Source
selection can be added later without moving search logic into this plugin.

## Tests

Tests cover CLI path resolution, argv safety, contract decoding, stable error
codes, URL allowlists, result presentation, cancellation, timeout, debounce,
and stale-result protection.

The test fixtures are copied from the versioned source in
[`starcat-cli/contracts/global-search`](https://github.com/starcat-app/starcat-cli/tree/main/contracts/global-search).

## Packaging and release

`scripts/verify-package.sh` validates the source package but does not generate
an installable file.

UPXS packages must be generated manually through uTools Developer Tools. The
first public Marketplace release will use version `1.0.0`; repository
development starts at `0.1.0`. See [RELEASING.md](./RELEASING.md).

## Privacy, security, and support

- [Privacy](./PRIVACY.md)
- [Security](./SECURITY.md)
- [Support](./SUPPORT.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## License

MIT. See [LICENSE](./LICENSE).
