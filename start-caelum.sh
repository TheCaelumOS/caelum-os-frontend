#!/usr/bin/env bash
# ================================================================
# ⚡ Launch CaelumOS Native Desktop & Infrastructure Runtime (Linux/macOS)
# ================================================================

set -e

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is required to run CaelumOS Runtime."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================================"
echo "⚡ Launching CaelumOS Native Desktop & Infrastructure Runtime"
echo "================================================================"

# Start daemon in background
echo "[1/2] Starting CaelumOS Infrastructure Daemon on 127.0.0.1:48721..."
node "${SCRIPT_DIR}/desktop-agent/src/index.js" &
DAEMON_PID=$!

trap "kill $DAEMON_PID 2>/dev/null || true" EXIT

sleep 1

echo "[2/2] Launching CaelumOS Desktop Environment..."
echo "✓ Docker, Kubernetes, Git, Terraform, AWS auto-discovery active."
echo "Starting frontend on http://localhost:3000/os ..."

cd "${SCRIPT_DIR}/frontend"
npm run dev
