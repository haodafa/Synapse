#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$SCRIPT_DIR/../node_modules/.bin:$PATH"

source "$SCRIPT_DIR/dev-home.sh"
configure_dev_synapse_home

if [ -z "${SYNAPSE_LOCAL_MODELS_DIR}" ]; then
  export SYNAPSE_LOCAL_MODELS_DIR="$HOME/.synapse/models/local-speech"
  mkdir -p "$SYNAPSE_LOCAL_MODELS_DIR"
fi

echo "══════════════════════════════════════════════════════"
echo "  Synapse Dev Daemon"
echo "══════════════════════════════════════════════════════"
echo "  Home:    ${SYNAPSE_HOME}"
echo "  Models:  ${SYNAPSE_LOCAL_MODELS_DIR}"
echo "══════════════════════════════════════════════════════"

export SYNAPSE_CORS_ORIGINS="${SYNAPSE_CORS_ORIGINS:-*}"
export SYNAPSE_NODE_INSPECT="${SYNAPSE_NODE_INSPECT:---inspect=0}"

exec npm run dev:server
