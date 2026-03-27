#!/bin/bash
# AI/ML Quest — Send proposals to Telegram via Bot API
# Usage: ./notify-telegram.sh "message text"
# Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from environment

set -euo pipefail

MESSAGE="${1:?Usage: notify-telegram.sh \"message text\"}"
TOKEN="${TELEGRAM_BOT_TOKEN:?TELEGRAM_BOT_TOKEN not set}"
CHAT_ID="${TELEGRAM_CHAT_ID:-1328924783}"

# Telegram Bot API — sendMessage with MarkdownV2 parse mode
curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg chat_id "$CHAT_ID" --arg text "$MESSAGE" '{
    chat_id: $chat_id,
    text: $text,
    parse_mode: "Markdown"
  }')" > /dev/null

echo "Sent to Telegram chat $CHAT_ID"
