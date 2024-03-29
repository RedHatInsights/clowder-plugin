# OpenShift Clowder Plugin

## Local development

1. `yarn build` to build the plugin, generating output to `dist` directory
2. `yarn http-server` to start an HTTP server hosting the generated assets

```
Starting up http-server, serving ./dist
Available on:
  http://127.0.0.1:9001
  http://192.168.1.190:9001
  http://10.40.192.80:9001
Hit CTRL-C to stop the server
```

The server runs on port 9001 with caching disabled and CORS enabled. Additional
[server options](https://github.com/http-party/http-server#available-options) can be passed to
the script, for example:

```sh
yarn http-server -a 127.0.0.1
```

See the plugin development section in
[Console Dynamic Plugins README](/frontend/packages/console-dynamic-plugin-sdk/README.md) for details
on how to run Bridge using local plugins.

To check how it works on a cluster with a mocked frontend, clone an [Openshift Console](https://github.com/openshift/console). You'll probably need to edit the 
/frontend/package.json and modify the build script

```sh
"build": "yarn clean && yarn generate && NODE_ENV=production NODE_OPTIONS='--openssl-legacy-provider --max-old-space-size=4096' yarn ts-node ./node_modules/.bin/webpack --mode=production",
```

Build the console and then run it with the plugin enabled.

```sh
./bin/bridge -plugins clowder-plugin=http://127.0.0.1:9001/
```

## Deployment on cluster

Console dynamic plugins are supposed to be deployed via [OLM operators](https://github.com/operator-framework).
In case of demo plugin, we just apply a minimal OpenShift manifest which adds the necessary resources.

```sh
oc process --local -f oc-manifest.yaml | oc apply -f -
```

Note that the `Service` exposing the HTTP server is annotated to have a signed
[service serving certificate](https://docs.openshift.com/container-platform/4.6/security/certificates/service-serving-certificate.html)
generated and mounted into the image. This allows us to run the server with HTTP/TLS enabled, using
a trusted CA certificate.

## Enabling the plugin

Once deployed on the cluster, demo plugin must be enabled before it can be loaded by Console.

To enable the plugin manually, edit [Console operator](https://github.com/openshift/console-operator)
config and make sure the plugin's name is listed in the `spec.plugins` sequence (add one if missing):

```sh
oc edit console.operator.openshift.io cluster
```

```yaml
# ...
spec:
  plugins:
    - clowder-plugin
# ...
```

## Docker image

Following commands should be executed in Console repository root.

1. Build the image:
   ```sh
   docker build -f Dockerfile.nginx -t quay.io/$USER/console-demo-plugin .
   ```
2. Run the image:
   ```sh
   docker run -it -p 9001:9001 quay.io/$USER/console-demo-plugin
   ```
3. Push the image to image registry:
   ```sh
   docker push quay.io/$USER/console-demo-plugin
   ```
