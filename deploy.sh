#!/usr/bin/env bash
# Sync this project to the deployment server and rebuild the containers.
# Mirrors the manual steps in DEPLOY.md — see that file for the first-deploy
# setup (backend/.env, first admin account, seed data), which this script
# does not redo.
#
# Usage:
#   ./deploy.sh                 # sync + build + up
#   ./deploy.sh --logs          # also tail backend+frontend logs after
#   DEPLOY_USER=root DEPLOY_HOST=1.2.3.4 DEPLOY_PATH=/biohacking ./deploy.sh
#
# Config (env vars, all have defaults matching the current live deploy):
#   DEPLOY_USER   SSH user on the server           (default: root)
#   DEPLOY_HOST   server address                   (default: 169.58.83.145)
#   DEPLOY_PATH   project directory on the server   (default: /biohacking)
#   DEPLOY_SSH_KEY  path to an SSH identity file, if not using ssh-agent/default key

set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:-169.58.83.145}"
DEPLOY_PATH="${DEPLOY_PATH:-/biohacking}"
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

SSH_OPTS=()
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
fi

TAIL_LOGS=false
if [[ "${1:-}" == "--logs" ]]; then
  TAIL_LOGS=true
fi

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "==> Checking for uncommitted local changes worth knowing about"
if command -v git >/dev/null 2>&1 && [[ -d .git ]]; then
  git status --short || true
fi

echo "==> Syncing project to ${SSH_TARGET}:${DEPLOY_PATH}"
tar --exclude='node_modules' --exclude='.next' --exclude='.venv' \
    --exclude='__pycache__' --exclude='.pytest_cache' --exclude='.ruff_cache' \
    --exclude='*.pyc' --exclude='*.db' --exclude='backend/.env' \
    --exclude='frontend/.env.local' --exclude='.git' \
    -czf - . | ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "mkdir -p '$DEPLOY_PATH' && tar -xzf - -C '$DEPLOY_PATH'"

echo "==> Building and starting containers on the server"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "cd '$DEPLOY_PATH' && docker compose build && docker compose up -d"

echo "==> Waiting for the stack to come back up"
sleep 3
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "cd '$DEPLOY_PATH' && docker compose ps"

echo "==> Smoke-checking the public site"
if command -v curl >/dev/null 2>&1; then
  PORT="${FRONTEND_PORT:-5555}"
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://${DEPLOY_HOST}:${PORT}/" || echo "000")
  if [[ "$code" == "200" ]]; then
    echo "    http://${DEPLOY_HOST}:${PORT}/ -> 200 OK"
  else
    echo "    WARNING: http://${DEPLOY_HOST}:${PORT}/ -> HTTP ${code} (check logs below)"
  fi
fi

echo "==> Done. Migrations run automatically on backend container startup."

if [[ "$TAIL_LOGS" == true ]]; then
  echo "==> Tailing logs (Ctrl+C to stop)"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "cd '$DEPLOY_PATH' && docker compose logs -f backend frontend"
fi
