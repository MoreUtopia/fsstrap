#!/usr/bin/env -S bash --posix

SCRIPT_DIR="$(dirname -- "${BASH_SOURCE[0]}")"
SCRIPT_DIR="${SCRIPT_DIR%/}/"

git -C ${SCRIPT_DIR} submodule update --init --recursive

deno run -A ${SCRIPT_DIR}src/driver.ts $@
