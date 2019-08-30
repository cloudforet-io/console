FROM node:10 

ENV BUILD_PATH /opt/cloudone/wconsole-client
ENV ROOT_PATH /var/www

RUN apt-get update && apt-get install -y nginx
RUN mkdir -p ${BUILD_PATH}
WORKDIR ${BUILD_PATH}

COPY package.json ${BUILD_PATH}/package.json
RUN npm config set @fortawesome:registry https://npm.fontawesome.com/41279D14-4A9B-414D-8BD0-970A9A6F1981
RUN npm install


COPY src ${BUILD_PATH}/src
RUN npm run build && copy -ar ${BUILD_PATH}/dist ${ROOT_PATH} && rm -rf ${BUILD_PATH}

# Define working directory.
WORKDIR ${ROOT_PATH}

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
