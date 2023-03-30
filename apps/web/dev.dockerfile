FROM node:16-alpine
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
COPY . .

RUN npm install

ENV NODE_ENV development

EXPOSE 8080

ENTRYPOINT ["npm", "run", "dev", "--workspace=web"]