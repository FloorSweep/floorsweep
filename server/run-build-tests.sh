#!/bin/bash
#
# run tests on ./build
#

set -eux

#also test BUILD_ID
#cat /ci-build-id-debug.txt == "$BUILD_ID"
if [ "$BUILD_ID" == "" ]; then
  echo "BUILD_ID must be present in env for build checks"
  exit 255
fi
export SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
source utils.sh
# todo: kill only previous process of the server
killServer

export WORKDIR="$SCRIPTPATH"
export NODE_ENV="production"
export ZZ_TESTS_ENV="__BUILD__"
# run tests against production build
export NODE_ENV=test
yarn run prisma:generate_classes
psql postgresql://root:root@postgres:5432/zznft
#npx copyfiles prisma/generated/prisma/*.* prisma/generated/prisma/**/*.* build/
npx prisma migrate reset --force
#psql postgresql://root:root@postgres:5432/zznft
#npx prisma migrate dev --name init

# test if we have connection to the db
#apt-get update
#apt-get install -y postgresql-client
#psql postgresql://root:root@postgres:5432/zznft
rm "$SCRIPTPATH/src/__tests__/initTests.ts"
npx jest --rootDir="$SCRIPTPATH/build/src" --testPathPattern="$SCRIPTPATH/build" #--testNamePattern="AccountController"

# must make sure all apps are killed so docker will quit after this script
pkill node || true
# >MAYBE< remove files needed for running tests:
# --> rm package.json
# --> rm spec.js files
# --> rm spec.d.ts files
# --> rm d.ts files

# running tests creates dev.db
rm -f "$SCRIPTPATH/build/dev.db" || true

echo "Done."
