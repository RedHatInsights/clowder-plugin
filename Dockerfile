FROM registry.access.redhat.com/ubi8/ubi as builder

RUN yum -y module enable nodejs:14
RUN dnf install npm patch -y
RUN npm install yarn -g

RUN mkdir /build
WORKDIR /build

COPY src/ src/
COPY locales/ locales/
COPY tsconfig.json webpack.config.ts console-extensions.json package.json sdk.patch ./

RUN yarn install

RUN patch node_modules/\@openshift-console/dynamic-plugin-sdk/lib/webpack/ConsoleAssetPlugin.js sdk.patch

RUN yarn build

FROM registry.access.redhat.com/ubi8/nginx-118

ADD ./nginx.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /build/dist /opt/clowder-plugin 

# Run script uses standard ways to run the application
CMD nginx -g "daemon off;"