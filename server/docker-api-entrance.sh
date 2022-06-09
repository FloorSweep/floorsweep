#!/bin/bash
#
# entrance for docker image running api
#
set -eux
source utils.sh
killServer
npx prisma migrate deploy

node /zzapi/packages/server/build/src/index.js
