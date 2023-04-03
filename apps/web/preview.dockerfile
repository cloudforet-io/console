FROM node:16-alpine
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
COPY . .

RUN npm install -D turbo

ENV NODE_ENV production

# Uncomment and use build args to enable remote caching
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN npx turbo build --filter=web...

EXPOSE 80

ENTRYPOINT ["npm", "run", "preview", "--workspace=web", "--", "--port=80"]