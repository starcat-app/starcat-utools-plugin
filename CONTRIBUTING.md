# Contributing

Thank you for contributing to Starcat uTools Plugin.

## Before opening a pull request

- Discuss large behavior or architecture changes in an issue first.
- Keep each pull request focused.
- Add or update tests for behavior changes.
- Run `npm run verify`.
- Update both `README.md` and `README-ZH.md` when public behavior changes.
- Do not commit credentials, `.env` files, private data, generated binaries, or local databases.
- Keep search, ranking, deduplication, authentication, and entitlement logic in Starcat.
- Keep `preload.js` and required CommonJS modules readable; do not minify, obfuscate, or bundle them.
- Do not commit UPXS packages or claim a GUI-only uTools check passed without evidence.

## Pull requests

Complete the repository pull request template, explain the user-visible effect, and include the
commands and results used for verification.

Security vulnerabilities must be reported privately according to [SECURITY.md](./SECURITY.md),
not through a public issue or pull request.
