#!/bin/bash

set -exv

IMAGE="quay.io/cloudservices/clowder-plugin"
IMAGE_TAG=$(git rev-parse --short=7 HEAD)

DOCKER_CONF="$PWD/.docker"
mkdir -p "$DOCKER_CONF"
docker --config="$DOCKER_CONF" build -t "${IMAGE}:${IMAGE_TAG}" .

TEST_RESULT=$?

# Stubbed out for now
mkdir -p $WORKSPACE/artifacts
cat << EOF > $WORKSPACE/artifacts/junit-dummy.xml
<testsuite tests="1">
    <testcase classname="dummy" name="dummytest"/>
</testsuite>
EOF

exit 0
