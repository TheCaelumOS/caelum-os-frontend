#!/usr/bin/env bash
echo "================================================================"
echo "Starting CaelumOS Local Infrastructure Connector..."
echo "Connecting local Docker and Kubernetes to CaelumOS"
echo "================================================================"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"
node src/index.js
