FROM node:10

ENV BUILD_PATH /opt/cloudone/wconsole-client
ENV ROOT_PATH /var/www
ARG FONT_AWESOME_API_KEY

RUN apt-get update && apt-get install -y nginx
RUN rm /etc/nginx/sites-enabled/default 
RUN mkdir -p ${BUILD_PATH}

COPY package.json ${BUILD_PATH}/package.json
WORKDIR ${BUILD_PATH}

RUN npm config set @fortawesome:registry ${FONT_AWESOME_API_KEY}
RUN npm install es6-object-assign
RUN npm install

COPY ./ ${BUILD_PATH}
WORKDIR ${BUILD_PATH}

RUN npm run build
RUN cp -ar ${BUILD_PATH}/dist/* ${ROOT_PATH}
RUN rm -rf ${BUILD_PATH}

# Define working directory.
WORKDIR ${ROOT_PATH}

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
