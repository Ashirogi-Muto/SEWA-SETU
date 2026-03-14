#!/bin/bash
# Usage: some_command 2>&1 | ./scripts/rotatelogs.sh logs/frontend/admin.log
# Mirrors backend's RotatingFileHandler: 5MB max, 3 backups
LOGFILE="$1"
MAX_SIZE=$((5 * 1024 * 1024))  # 5MB
MAX_BACKUPS=3

mkdir -p "$(dirname "$LOGFILE")"

while IFS= read -r line; do
    echo "$line"  # Still print to tmux window
    echo "$line" >> "$LOGFILE"
    # Rotate when file exceeds MAX_SIZE
    if [ -f "$LOGFILE" ] && [ "$(stat -c%s "$LOGFILE" 2>/dev/null || echo 0)" -ge "$MAX_SIZE" ]; then
        for i in $(seq $((MAX_BACKUPS - 1)) -1 1); do
            [ -f "${LOGFILE}.$i" ] && mv "${LOGFILE}.$i" "${LOGFILE}.$((i + 1))"
        done
        mv "$LOGFILE" "${LOGFILE}.1"
        : > "$LOGFILE"
    fi
done
