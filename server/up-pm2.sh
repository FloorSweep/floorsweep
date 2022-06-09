#!/bin/bash
#
# up-pm2.sh
#
# Description:
# Used by dockerfile to start pm2 with zz api
#
export SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
export WORKDIR="$SCRIPTPATH"
export NODE_ENV="production"
pm2-runtime start pm2.config.js
