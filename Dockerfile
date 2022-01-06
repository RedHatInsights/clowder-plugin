FROM registry.access.redhat.com/ubi8/ubi as builder

RUN yum -y module enable nodejs:14
RUN dnf install npm -y
RUN npm install yarn -g

RUN mkdir /build
WORKDIR /build

COPY src/ src/
COPY locales/ locales/
COPY tsconfig.json webpack.config.ts console-extensions.json package.json ./

RUN yarn install

RUN ls -la
RUN yarn build

FROM registry.access.redhat.com/ubi8/nginx-118

ADD ./nginx.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder ./dist /opt/clowder-plugin 

# Run script uses standard ways to run the application
CMD nginx -g "daemon off;"