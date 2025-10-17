FROM node:16.20.2-alpine AS builder
LABEL maintainer="OhMyForm <admin@ohmyform.com>"


WORKDIR /usr/src/app

RUN apk --update --no-cache add curl bash

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

# just copy everhing
COPY . .

RUN touch /usr/src/app/src/schema.gql && chown 9999:9999 /usr/src/app/src/schema.gql

RUN npm ci
RUN npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

FROM node:16.20.2-alpine
LABEL maintainer="OhMyForm <admin@ohmyform.com>"


# Create a group and a user with name "ohmyform".
RUN addgroup --gid 9999 ohmyform && adduser -D --uid 9999 -G ohmyform ohmyform

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app /usr/src/app

ENV PORT=4000 \
    SECRET_KEY=ChangeMe \
    CREATE_ADMIN=FALSE \
    ADMIN_EMAIL=admin@ohmyform.com \
    ADMIN_USERNAME=root \
    ADMIN_PASSWORD=root \
    NODE_ENV=production


EXPOSE 4000

# Change to non-root privilege
USER ohmyform

CMD [ "npm", "run", "start:prod" ]
