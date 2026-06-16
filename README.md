# OpenShift Clowder Plugin

A dynamic plugin for the OpenShift Console that provides Clowder-related UI components. Built with
the OpenShift Console Dynamic Plugin SDK and PatternFly.

## Prerequisites

- Node.js and Yarn
- OpenShift Console (for integration testing)
- Docker or Podman (for container builds)

## Development Setup

### Local Development

```sh
# Build the plugin (output to dist/)
yarn build

# Start a local HTTP server for the built plugin
yarn http-server
```

The server runs on port 9001 with caching disabled and CORS enabled. Pass additional
[server options][http-server-options] to the script:

```sh
yarn http-server -a 127.0.0.1
```

### Testing with OpenShift Console

1. Clone [OpenShift Console][openshift-console]
2. Build the console
3. Run with the plugin enabled:

```sh
./bin/bridge -plugins clowder-plugin=http://127.0.0.1:9001/
```

## Deployment

### On Cluster

Apply the OpenShift manifest:

```sh
oc process --local -f oc-manifest.yaml | oc apply -f -
```

The `Service` is annotated for a signed service serving certificate, enabling HTTP/TLS with a
trusted CA certificate.

### Enabling the Plugin

Edit the Console operator config to add the plugin:

```sh
oc edit console.operator.openshift.io cluster
```

```yaml
spec:
  plugins:
    - clowder-plugin
```

### Container Image

```sh
# Build
docker build -f Dockerfile -t quay.io/$USER/clowder-plugin .

# Run locally
docker run -it -p 9001:9001 quay.io/$USER/clowder-plugin

# Push
docker push quay.io/$USER/clowder-plugin
```

## CI/CD

- `platsec.yml` — platform security scanning via GitHub Actions

## License

No license file is included in this repository.

[http-server-options]: https://github.com/http-party/http-server#available-options
[openshift-console]: https://github.com/openshift/console
