#!/bin/bash
#
# Usage:
# ./run-unit=test=locally.sh
# ./run-unit=test=locally.sh NftController.integration
# ./run-unit=test=locally.sh Nft
set -eux
export SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
source "utils.sh"
killServer
export APP_ENV=test
export NODE_ENV=test

echo "migrating fresh db"
yarn prisma:reset --force

SRC_DIR="$SCRIPTPATH/src"
if [ $# -eq 0 ]; then
  TEST_PATH=$SRC_DIR
elif [ $# -eq 1 ]; then
  TEST_PATH="$1"
else
  echo "Only a single parameter is allowed"
fi

echo "running $TEST_PATH"
npx jest --detectOpenHandles --rootDir="$SCRIPTPATH/src" --testPathPattern=$TEST_PATH
