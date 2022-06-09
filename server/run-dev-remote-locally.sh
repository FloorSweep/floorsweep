#!/bin/bash
#
# run-dev-remote-locally.sh
#
# Description:
# Run zz api on local machine. Locally api is run natively in host environment, without docker or pm2
#
set -eux
source utils.sh
killServer
#yarn start
yarn run barrels
# make sure we have up to date database url
#npx prisma migrate resolve --rolled-back
#yarn run prisma:reset
yarn run prisma:generate_migration
yarn run joi:generate
npx tsnd --exit-child --inspect --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts
