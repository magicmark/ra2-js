# Anti-slop provenance

- Source: https://github.com/dmmulroy/anti-slop
- Commit: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`
- Copied from: `skills/install-anti-slop/assets/anti-slop/` using the upstream installer.
- Installed at: `tools/oxlint/anti-slop/`.
- Local source deviations: none. All generic rules and the native accumulating-spread companion are enabled. Effect rules are not enabled because this project does not depend on Effect.
- Configuration: `no-runtime-typeof` permits checks inside explicit type guards (`allowInTypeGuards: true`), as documented upstream for schema-free projects.
- The upstream root MIT license is included as `LICENSE`.
- The nested ESLint Stylistic license and provenance are preserved.
