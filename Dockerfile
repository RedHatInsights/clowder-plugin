FROM registry.access.redhat.com/ubi8/ubi:8.10-1088 as builder

RUN yum -y module enable nodejs:18
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

FROM registry.access.redhat.com/ubi8/ubi-minimal:8.10-1179

ENV NGINX_CONFIGURATION_PATH=/etc/nginx/nginx.conf

RUN microdnf update && microdnf module enable nginx:1.22 && microdnf install nginx

ADD ./nginx.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /build/dist /opt/clowder-plugin 
COPY --from=builder /build/locales/ /opt/clowder-plugin/locales/

# Run script uses standard ways to run the application
CMD nginx -g "daemon off;"
