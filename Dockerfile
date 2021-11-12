FROM node:16

ENV PORT 80
ENV BUILD_PATH /tmp/spaceone/build
ENV ROOT_PATH /var/www
ENV LOG_PATH /var/log/spaceone
ENV NGINX_CONF_PATH /etc/nginx/conf.d

EXPOSE ${PORT}

WORKDIR ${BUILD_PATH}

RUN mkdir -p ${BUILD_PATH} \
    && apt-get update && apt-get install -y nginx \
    && rm -f /etc/nginx/sites-enabled/default \
    && mkdir -p ${BUILD_PATH} && mkdir -p ${LOG_PATH}/nginx

COPY pkg/nginx.conf ${NGINX_CONF_PATH}/spaceone_console.conf
COPY public ${BUILD_PATH}/public
COPY package.json package-lock.json *.js ${BUILD_PATH}/

RUN npm install

COPY tsconfig.json ${BUILD_PATH}/
COPY vue.config.js ${BUILD_PATH}/
ENV NODE_ENV production

COPY src ${BUILD_PATH}/src

RUN npm run build \
    && cp -ar ${BUILD_PATH}/dist/* ${ROOT_PATH}/ \
    && rm -rf ${BUILD_PATH}

ENTRYPOINT ["nginx", "-g", "daemon off;"]
