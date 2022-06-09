#!/bin/bash
#
# builds ./build
#

set -eux

source utils.sh
killServer

export SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
export WORKDIR="$SCRIPTPATH"
export NODE_ENV="production"


# clean old build
rm -rf build
yarn run barrels
# transpile to js
yarn run prisma:generate_classes
yarn run tsc --project tsconfig.compile.json
# copy prisma generated runtimes ignored by tsconfig.json
npx copyfiles prisma/generated/prisma/*.* prisma/generated/prisma/**/*.* build/
