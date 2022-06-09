#!/bin/bash
#
# utils.sh
#
# Description:
# Common tools for devops scripts
#

__UTILS_SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
__UTILS_SCRIPTPATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd "$__UTILS_SCRIPTPATH"
  # load .env enviroments into current env
  if [ -f .env ]
  then
    echo "Loading envs from .env..."
    export $(cat .env | xargs)
  fi
popd

function killServer(){
  pkill -f packages/server || true
}
