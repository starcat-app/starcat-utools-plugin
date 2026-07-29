# Releasing

## Version policy

- Repository development starts at `0.1.0`.
- The first public uTools Marketplace release is `1.0.0`.
- Published versions are immutable; fixes use a new patch version.

The `package.json` version and the version entered in uTools Developer Tools are
not automatically linked. Verify both before packaging.

## Release gates

```bash
npm ci
npm run verify
bash scripts/verify-package.sh
git diff --check
```

Complete the uTools manual acceptance checklist documented in the Starcat
integration design before publishing.

## UPXS

Generate UPXS only through uTools Developer Tools. UPXS is intended for testing
or internal sharing and must not be committed to this repository.

## Marketplace

Submit the plugin through the uTools Marketplace with macOS as the only
platform. Confirm the public version, bilingual documentation, privacy text,
Starcat Pro requirement, CLI requirement, screenshots, and support URL.

Repository CI deliberately does not fabricate an installable UPXS artifact.
