FROM node:16

ENV PORT 80
ENV BUILD_PATH /tmp/cloudforet/build
ENV ROOT_PATH /var/www
ENV LOG_PATH /var/log/cloudforet
ENV NGINX_CONF_PATH /etc/nginx/conf.d

EXPOSE ${PORT}

WORKDIR ${BUILD_PATH}

RUN mkdir -p ${BUILD_PATH} \
    && apt-get update && apt-get install -y nginx \
    && rm -f /etc/nginx/sites-enabled/default \
    && mkdir -p ${BUILD_PATH} && mkdir -p ${LOG_PATH}/nginx

COPY pkg/nginx.conf ${NGINX_CONF_PATH}/cloudforet_console.conf
COPY public ${BUILD_PATH}/public
COPY public/config ${BUILD_PATH}/config
COPY index.html ${BUILD_PATH}/
COPY package.json package-lock.json *.js *.cjs ${BUILD_PATH}/
COPY packages ${BUILD_PATH}/packages

RUN npm install

COPY tsconfig.base.json tsconfig.json ${BUILD_PATH}/
COPY vite.config.js ${BUILD_PATH}/
ENV NODE_ENV production

COPY src ${BUILD_PATH}/src

RUN npm run build --workspaces \
    && cp -ar ${BUILD_PATH}/dist/* ${ROOT_PATH}/ \
    && rm -rf ${BUILD_PATH}

ENTRYPOINT ["nginx", "-g", "daemon off;"]
