#!/bin/bash
# AI/ML Quest — Start Claude Code with Telegram channel in tmux
# Usage: ./start-telegram-session.sh
# Prerequisites: Telegram plugin configured via /telegram:configure

set -euo pipefail

SESSION_NAME="claude-quest"

# Check if session already exists
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "Session '$SESSION_NAME' already running. Attach with: tmux attach -t $SESSION_NAME"
  exit 0
fi

# Start Claude Code with Telegram channel in a detached tmux session
tmux new-session -d -s "$SESSION_NAME" \
  "claude --channels plugin:telegram@claude-plugins-official -p /home/crawler/ai-ml-quest"

echo "Started Claude Code with Telegram channel in tmux session '$SESSION_NAME'"
echo "Attach with: tmux attach -t $SESSION_NAME"
echo "Detach with: Ctrl+B, D"
