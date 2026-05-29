#!/bin/bash
# Script to update all @getpaseo imports to Synapse equivalents

# Replace @synapse/server with @synapse/unified-daemon/server
find packages/cli/src -name "*.ts" -type f -exec sed -i 's|@synapse/server|@synapse/unified-daemon/server|g' {} \;

# Replace @synapse/protocol/xxx with @synapse/protocol/xxx
find packages/cli/src -name "*.ts" -type f -exec sed -i 's|@synapse/protocol/|@synapse/protocol/|g' {} \;

# Replace @synapse/client with @synapse/client
find packages/cli/src -name "*.ts" -type f -exec sed -i 's|@synapse/client|@synapse/client|g' {} \;

echo "Updated all @getpaseo imports to Synapse equivalents"
