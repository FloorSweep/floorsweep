#!/bin/bash
# This runs a signed Docker container which embeds the Datadog Agent to monitor your host. The Docker integration is enabled by default, as well as Autodiscovery in auto config mode.
set -eux
source "utils.sh"
if [ "$APP_ENV" != "prod" ];
  echo "Should be run only on prod"
  exit 1
fi
if [ "$DD_API_KEY" == "" ];
  echo "Should be run only on prod"
  exit 1
fi
CONTAINER_NAME="dd-agent"
docker run -d --name "$CONTAINER_NAME" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /proc/:/host/proc/:ro \
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
  -e DD_API_KEY="$DD_API_KEY" \
  -e DD_SITE="datadoghq.com" \
  gcr.io/datadoghq/agent:7
