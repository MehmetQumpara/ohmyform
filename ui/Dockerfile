FROM node:16.20.2-alpine AS builder
LABEL maintainer="OhMyForm <admin@ohmyform.com>"


WORKDIR /usr/src/app

# Build-time public env for Next.js (used in client bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN apk --update --no-cache add curl bash g++ make libpng-dev

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

COPY . ./

RUN npm ci
RUN npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
# there is some problem running node prune that then prevents the frontend to load (just start with /form/1 and it will crash)
#RUN /usr/local/bin/node-prune

FROM node:16.20.2-alpine
LABEL maintainer="OhMyForm <admin@ohmyform.com>"


# Create a group and a user with name "ohmyform".
RUN addgroup --gid 9999 ohmyform && adduser -D --uid 9999 -G ohmyform ohmyform

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app /usr/src/app

ENV PORT=4100 \
    NODE_ENV=production

# Change to non-root privilege
# ensure ownership of app files for Next.js runtime writes (prerender updates)
RUN chown -R ohmyform:ohmyform /usr/src/app
USER ohmyform

CMD [ "npm", "run", "start" ]
