#!/usr/bin/env -S bash --posix

SCRIPT_DIR="$(dirname -- "${BASH_SOURCE[0]}")"
SCRIPT_DIR="${SCRIPT_DIR%/}/"

deno run -A ${SCRIPT_DIR}src/driver.ts $@
