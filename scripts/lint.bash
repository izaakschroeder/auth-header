#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")" && source "./common.bash"

info "Starting lint"
eslint . "$@"
info "Lint complete"
