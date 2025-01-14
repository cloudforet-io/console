# CAUTION: Turbo remote caching wiros only with alpine version. Related issue: https://github.com/ducktors/turborepo-remote-cache/issues/34#issuecomment-1308479171
# Stage 1: Build the application
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .

RUN npm ci

# Build the project
ENV NODE_ENV production
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV FORCE_COLOR=1

RUN npx turbo build --filter=web... --output-logs=new-only --summarize

# Stage 2: Prepare and run NGINX
FROM nginx:1.21.6-alpine AS runner

# Environment variables
ENV PORT 80
ENV ROOT_PATH /var/www
ENV LOG_PATH /var/log/cloudforet
ENV NGINX_CONF_PATH /etc/nginx/conf.d

# Root user for setup
USER root

# Perform all root-level operations in one RUN command
RUN mkdir -p ${LOG_PATH}/nginx && \
    rm /etc/nginx/conf.d/default.conf && \
    chown -R 1001:1001 ${LOG_PATH}

# Switch to non-root user
USER 1001

# Copy NGINX configuration and application files
COPY apps/web/pkg/proxy.conf ${NGINX_CONF_PATH}/proxy.conf
COPY --from=installer /app/apps/web/dist/. ${ROOT_PATH}/

# Set ownership of application files and configuration
RUN chown -R 1001:1001 ${ROOT_PATH} ${NGINX_CONF_PATH}

# Create symbolic links for logs
RUN ln -sf /dev/stdout ${LOG_PATH}/nginx/spaceone-access.log && \
    ln -sf /dev/stderr ${LOG_PATH}/nginx/spaceone-error.log

# Expose port and start NGINX
EXPOSE ${PORT}
ENTRYPOINT ["nginx", "-g", "daemon off;"]
