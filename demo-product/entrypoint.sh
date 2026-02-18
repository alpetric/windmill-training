#!/bin/sh

# Write Windmill connection config - app fetches the rest from DB
cat > /usr/share/nginx/html/config.js << EOF
window.WINDMILL = {
  recordId: ${RECORD_ID:-null},
  url: "${WINDMILL_URL:-}",
  workspace: "${WORKSPACE:-}",
  token: "${WINDMILL_TOKEN:-}"
};
EOF

exec nginx -g 'daemon off;'
