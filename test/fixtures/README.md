# Global Search Fixtures

These files are copied from:

```text
starcat-app/starcat-cli/contracts/global-search
```

They are test resources only. The plugin runtime calls the installed
`starcat search` command and never reads another source checkout.

When the CLI contract changes, update the source fixtures first, copy the
versioned files here, and run `npm run verify`.
