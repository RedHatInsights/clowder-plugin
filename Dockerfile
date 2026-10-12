FROM registry.access.redhat.com/hi/nodejs:24.21.0-builder-1791559214 AS builder

USER root
RUN npm install -g corepack

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn .yarn
RUN yarn install --immutable

COPY . .

RUN yarn build

USER ${DEFAULT_CONTAINER_USER}

FROM registry.access.redhat.com/hi/nginx:1.30.5-1791427742

ADD ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/locales/ /usr/share/nginx/html/locales/

EXPOSE 9001
