#!/bin/bash

set -exv

IMAGE="quay.io/cloudservices/clowder-plugin"
IMAGE_TAG=$(git rev-parse --short=7 HEAD)
SECURITY_COMPLIANCE_TAG="sc-$(date +%Y%m%d)-$(git rev-parse --short=7 HEAD)"

if [[ -z "$QUAY_USER" || -z "$QUAY_TOKEN" ]]; then
    echo "QUAY_USER and QUAY_TOKEN must be set"
    exit 1
fi

if [[ -z "$RH_REGISTRY_USER" || -z "$RH_REGISTRY_TOKEN" ]]; then
    echo "RH_REGISTRY_USER and RH_REGISTRY_TOKEN  must be set"
    exit 1
fi

# If the "security-compliance" branch is used for the build, it will tag the image as such.
if [[ "$GIT_BRANCH" == "origin/security-compliance" ]]; then
    IMAGE_TAG="$SECURITY_COMPLIANCE_TAG"
fi

DOCKER_CONF="$PWD/.docker"
mkdir -p "$DOCKER_CONF"
# Disable xtrace and pass passwords via stdin so registry tokens are never
# expanded into the CI log stream or process argv (CWE-532 / CWE-214).
set +x
docker --config="$DOCKER_CONF" login -u="$QUAY_USER" --password-stdin quay.io <<<"$QUAY_TOKEN"
docker --config="$DOCKER_CONF" login -u="$RH_REGISTRY_USER" --password-stdin registry.redhat.io <<<"$RH_REGISTRY_TOKEN"
set -x
docker --config="$DOCKER_CONF" build -t "${IMAGE}:${IMAGE_TAG}" .
docker --config="$DOCKER_CONF" push "${IMAGE}:${IMAGE_TAG}"