FROM registry.access.redhat.com/ubi9:9.7-1770238273 AS builder

RUN yum -y module enable nodejs:20
RUN dnf install npm patch -y
RUN npm install yarn -g

RUN mkdir /build
WORKDIR /build

COPY locales/ locales/
COPY tsconfig.json webpack.config.mjs console-extensions.json package.json sdk.patch ./

RUN yarn install

#RUN patch node_modules/\@openshift-console/dynamic-plugin-sdk/lib/webpack/ConsoleAssetPlugin.js sdk.patch

COPY src/ src/

RUN yarn build

FROM registry.access.redhat.com/ubi9-minimal:9.7-1770267347

ENV NGINX_CONFIGURATION_PATH=/etc/nginx/nginx.conf

RUN microdnf update -y && microdnf module enable nginx:1.22 -y && microdnf install nginx -y

ADD ./nginx.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /build/dist /opt/clowder-plugin 
COPY --from=builder /build/locales/ /opt/clowder-plugin/locales/

RUN mkdir -p /var/log/nginx && \
    chmod -R 777 /var/log/nginx

# Run script uses standard ways to run the application
CMD nginx -g "daemon off;"
