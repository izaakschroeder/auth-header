#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")" && source "./common.bash"

export NODE_ENV=test

info "Starting tests"

case "${1-""}" in
	':unit')
		shift
		mocha "$@"
		;;
	':coverage'|':unit:coverage')
		shift
		nyc mocha "$@"
		;;
	''|':all')
		shift
		nyc mocha "$@"
		;;
	*) fatal "Invalid test target $1" "$EXIT_CODE_INVALID_STATE"
esac
info "Tests complete"
