# Architecture

## Overview

The Clowder Plugin is an OpenShift Console dynamic plugin built with the Console Dynamic Plugin SDK.
It extends the OpenShift web console with Clowder-specific UI components.

## Module Structure

```text
src/                    # Plugin source code (TypeScript/React)
  components/           # React components
console-extensions.json # Plugin extension points registered with the console
plugin.json             # Plugin metadata and dependencies
webpack.config.mjs      # Build configuration
build_deploy.sh         # CI/CD build and deploy script
pr_check.sh             # PR validation script
http-server.sh          # Local development server script
```

## Key Design Decisions

- **Dynamic Plugin SDK.** Uses `@openshift-console/dynamic-plugin-sdk` which allows the plugin to
  be loaded dynamically by the console without rebuilding the entire console application.
- **PatternFly.** UI components use PatternFly (`@patternfly/react-core`, `react-table`,
  `react-tokens`) for consistent styling with the OpenShift console.
- **Webpack bundling.** The plugin is bundled as a standalone webpack module using the dynamic
  plugin SDK's webpack integration, producing assets served by a static HTTP server.
- **React.** Pinned to the React version expected by the OpenShift Console host application.

## Deployment Model

The built plugin is served as static assets via an HTTP server (nginx in production, http-server
in development). The OpenShift Console loads the plugin at runtime by fetching its manifest and
extension definitions from the plugin's service URL.
