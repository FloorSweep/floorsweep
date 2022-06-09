#!/bin/bash
#
# up-docker.sh
#
# Description:
# Script for starting all docker containers FOR LOCAL CONSUMPTION.
# Use it with locally run server, that is ./run-dev-remote-locally.sh
#
set -eux
source utils.sh

mongo_name=mongo
# these should/can be changed according to your needs
docker container stop server_postgres_1 || true
docker container rm server_postgres_1 || true
docker volume rm server_zzpg server_zzpg2 || true
docker-compose -f docker-compose.yml down --remove-orphans -v --rmi=local
docker-compose -f docker-compose.yml stop $mongo_name || true
docker-compose -f docker-compose.yml rm -fv $mongo_name || true
docker volume rm zzmongo || true
docker-compose -f docker-compose.yml up redis $mongo_name postgres adminer
