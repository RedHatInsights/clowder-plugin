# OpenShift Clowder Plugin

## Project Overview

A dynamic plugin for the OpenShift Console that adds Clowder-specific UI components. Built with the
OpenShift Console Dynamic Plugin SDK and PatternFly. Deployed as static assets served
via an HTTP server and loaded dynamically by the console at runtime.

## Dependencies

- **Runtime:** React, PatternFly, OpenShift Console Dynamic Plugin SDK
- **Build:** Webpack, TypeScript
- **Dev:** http-server (local development), Node.js 20, Yarn
- **CI:** GitHub Actions (platsec.yml)

## Development Commands

```sh
# Build the plugin (production)
yarn build

# Build the plugin (development)
yarn build-dev

# Start local HTTP server on port 9001
yarn http-server

# Extract i18n strings
yarn i18n
```

See [Development Setup][readme-dev] in the README for integration testing with OpenShift Console.

## Architecture

Single-plugin repository with React/TypeScript source in `src/`, console extension points in
`console-extensions.json`, and webpack bundling. See [ARCHITECTURE.md][architecture] for build
pipeline and deployment model details.

## Code Style

- TypeScript with strict mode (configured via `tsconfig.json`)
- React functional components with PatternFly
- Webpack with ESM configuration (`webpack.config.mjs`)
- No linter configured in the repository

## Common Mistakes

1. **Using the wrong React version.** The plugin's React version must match what the OpenShift
   Console host expects. Changing it without verifying console compatibility will cause runtime
   errors.

2. **Forgetting to update `console-extensions.json`.** New UI extension points must be registered
   in this file. The console will not discover unregistered components regardless of their export.

3. **Testing without the console host.** The plugin's HTTP server serves raw assets. To verify
   actual behavior, the plugin must be loaded by a running OpenShift Console instance via the
   `bridge -plugins` flag or cluster deployment.

[readme-dev]: ./README.md#development-setup
[architecture]: ./ARCHITECTURE.md
