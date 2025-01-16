# CAUTION: Turbo remote caching wiros only with alpine version. Related issue: https://github.com/ducktors/turborepo-remote-cache/issues/34#issuecomment-1308479171
FROM node:20-alpine AS installer
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

ENV FORCE_COLOR=1

RUN npx turbo build --filter=web... --output-logs=new-only --summarize

FROM nginx:1.21.6-alpine AS runner

ENV PORT 80
ENV ROOT_PATH /var/www
ENV LOG_PATH /var/log/cloudforet
ENV NGINX_CONF_PATH /etc/nginx/conf.d

RUN mkdir -p ${LOG_PATH}/nginx /var/cache/nginx && \
    chown -R nginx:nginx ${LOG_PATH}/nginx /var/cache/nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/pkg/proxy.conf ${NGINX_CONF_PATH}/proxy.conf

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout ${LOG_PATH}/nginx/spaceone-access.log \
    && ln -sf /dev/stderr ${LOG_PATH}/nginx/spaceone-error.log

COPY --from=installer /app/apps/web/dist/. ${ROOT_PATH}/

# Enable only for turbo debugging purposes
#RUN mkdir -p ${LOG_PATH}/turbo
#COPY --from=installer /app/.turbo/runs/. ${LOG_PATH}/turbo

# Change ownership of application files and settings
RUN chown -R nginx:nginx ${ROOT_PATH} ${NGINX_CONF_PATH}

# Change to non-root user
USER nginx

EXPOSE ${PORT}

ENTRYPOINT ["nginx", "-g", "daemon off;"]
