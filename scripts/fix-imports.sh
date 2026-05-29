#!/bin/bash
# Script to update all @getpaseo imports to Synapse equivalents

# Replace @getpaseo/server with @synapse/unified-daemon/server
find packages/cli/src -name "*.ts" -type f -exec sed -i 's|@getpaseo/server|@synapse/unified-daemon/server|g' {} \;

# Replace @getpaseo/protocol/xxx with @synapse/protocol/xxx
find packages/cli/src -name "*.ts" -type f -exec sed -i 's|@getpaseo/protocol/|@synapse/protocol/|g' {} \;

# Replace @getpaseo/client with @synapse/client
find packages/cli/src -name "*.ts" -type f -exec sed -i 's|@getpaseo/client|@synapse/client|g' {} \;

echo "Updated all @getpaseo imports to Synapse equivalents"
