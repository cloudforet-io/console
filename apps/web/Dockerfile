# CAUTION: Turbo remote caching wiros only with alpine version. Related issue: https://github.com/ducktors/turborepo-remote-cache/issues/34#issuecomment-1308479171
FROM node:16-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

COPY . .

RUN npm ci

# Build the project
ENV NODE_ENV production

# Use build args to enable remote caching
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ENV FORCE_COLOR=1

RUN npx turbo build --filter=web... --output-logs=new-only --summarize

# Enable only for turbo debugging purposes
#RUN find .turbo/runs/. -type f -exec cat {} \;

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
