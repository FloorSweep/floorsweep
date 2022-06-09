###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \___ \|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for TsED Application                         ##
## author          : TsED team                                               ##
## date            : 2022-03-05                                              ##
## version         : 2.0                                                     ##
##                                                                           ##
###############################################################################
###############################################################################
ARG NODE_VERSION=16.13.1

FROM node:${NODE_VERSION} as build
WORKDIR /zzapi/packages/server

RUN apt-get update && \
    apt-get install python3 build-essential -y

COPY package.json yarn.lock tsconfig.json tsconfig.compile.json .barrelsby.json ./

# production=false to also install devDependencies
RUN yarn install --pure-lockfile --production=false
#RUN yarn install
COPY ./src ./src
COPY ./prisma ./prisma
COPY ./utils.sh ./
COPY ./docker-api-compile.sh ./
RUN ls /zzapi/packages/server/src

# run build & tests against production build
RUN ./docker-api-compile.sh
# RUN ./run-build-tests.sh

FROM node:${NODE_VERSION} as runtime
ENV WORKDIR /zzapi/packages/server
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR $WORKDIR

RUN apt-get update && \
    apt-get install -y postgresql-client && \
    npm install -g pm2

COPY --from=build /zzapi/packages/server/node_modules /zzapi/packages/server/node_modules
COPY --from=build /zzapi/packages/server/build /zzapi/packages/server/build
# agenda:worker still need the prisma generated files. it is not run from ./build folder, but from ./src. YES. it is typescript...
COPY --from=build /zzapi/packages/server/prisma /zzapi/packages/server/prisma
COPY ./ ./

COPY pm2.config.js .

EXPOSE 8081

ARG BUILD_ID="n/a"
ENV BUILD_ID="$BUILD_ID"
# add build hash during image build for CI testing
RUN echo "$BUILD_ID" > /ci-build-id-debug.txt

WORKDIR /zzapi/packages/server
ENTRYPOINT ./docker-api-entrance.sh
