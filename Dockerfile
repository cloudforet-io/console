FROM pyengine/build:console

COPY src ${BUILD_PATH}/src


RUN npm run build && cp -ar ${BUILD_PATH}/dist/* ${ROOT_PATH}/ && rm -rf ${BUILD_PATH}

EXPOSE ${PORT}


ENTRYPOINT ["nginx", "-g", "daemon off;"]