FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
# CAUTION: Turbo remote caching wiros only with alpine version. Related issue: https://github.com/ducktors/turborepo-remote-cache/issues/34#issuecomment-1308479171
FROM node:16-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY .git/ .git/
ENV NODE_ENV production

# Use build args to enable remote caching
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ENV FORCE_COLOR=1

RUN npx turbo build --filter=web...
RUN rm -rf .git

FROM nginx AS runner

ENV PORT 80
ENV ROOT_PATH /var/www
ENV LOG_PATH /var/log/cloudforet
ENV NGINX_CONF_PATH /etc/nginx/conf.d

RUN mkdir -p ${LOG_PATH}/nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/pkg/proxy.conf ${NGINX_CONF_PATH}/proxy.conf

COPY --from=installer /app/apps/web/dist/. ${ROOT_PATH}/

EXPOSE ${PORT}

ENTRYPOINT ["nginx", "-g", "daemon off;"]
