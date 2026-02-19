#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Windmill Training Setup ===${NC}"

# Configuration
WORKSPACE_NAME="training_demo"
SUPERADMIN_SECRET="${SUPERADMIN_SECRET:-training_secret_changeme}"
ADMIN_EMAIL="admin@windmill.dev"
ADMIN_PASSWORD="changeme"
WINDMILL_URL="http://localhost:8000"

# Check requirements
echo -e "${YELLOW}Checking requirements...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo -e "${RED}curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${RED}jq is required but not installed.${NC}" >&2; exit 1; }
command -v wmill >/dev/null 2>&1 || { echo -e "${RED}wmill CLI is required but not installed. Install with: npm install -g windmill-cli${NC}" >&2; exit 1; }
echo -e "${GREEN}All requirements met.${NC}"

# Step 1: Pull latest images and start Docker containers
echo -e "${YELLOW}Pulling latest Docker images...${NC}"
cd docker
docker compose pull
echo -e "${YELLOW}Starting Docker containers...${NC}"
SUPERADMIN_SECRET="$SUPERADMIN_SECRET" docker compose up -d
cd ..

# Step 2: Build demo-product image
echo -e "${YELLOW}Building demo-product Docker image...${NC}"
cd demo-product
docker build -t demo-workspace .
cd ..

# Step 3: Wait for Windmill to be ready
echo -e "${YELLOW}Waiting for Windmill to be ready...${NC}"
MAX_ATTEMPTS=60
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s "$WINDMILL_URL/api/version" >/dev/null 2>&1; then
        echo -e "${GREEN}Windmill is ready!${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Waiting for Windmill... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}Windmill failed to start within the timeout period.${NC}"
    exit 1
fi

# Step 4: Create workspace using superadmin secret
echo -e "${YELLOW}Creating workspace '${WORKSPACE_NAME}'...${NC}"
WORKSPACE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $SUPERADMIN_SECRET" \
    "$WINDMILL_URL/api/w/$WORKSPACE_NAME/workspaces/exists")

if [ "$WORKSPACE_EXISTS" = "200" ]; then
    EXISTS_RESULT=$(curl -s -H "Authorization: Bearer $SUPERADMIN_SECRET" \
        "$WINDMILL_URL/api/w/$WORKSPACE_NAME/workspaces/exists")
    if [ "$EXISTS_RESULT" = "true" ]; then
        echo -e "${YELLOW}Workspace already exists, skipping creation.${NC}"
    else
        curl -s -X POST "$WINDMILL_URL/api/workspaces/create" \
            -H "Authorization: Bearer $SUPERADMIN_SECRET" \
            -H "Content-Type: application/json" \
            -d "{\"id\": \"$WORKSPACE_NAME\", \"name\": \"Training Demo\"}"
        echo -e "${GREEN}Workspace created.${NC}"
    fi
else
    curl -s -X POST "$WINDMILL_URL/api/workspaces/create" \
        -H "Authorization: Bearer $SUPERADMIN_SECRET" \
        -H "Content-Type: application/json" \
        -d "{\"id\": \"$WORKSPACE_NAME\", \"name\": \"Training Demo\"}"
    echo -e "${GREEN}Workspace created.${NC}"
fi

# Step 5: Add admin user to workspace
echo -e "${YELLOW}Setting up admin user...${NC}"
# First create the user if they don't exist
USER_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $SUPERADMIN_SECRET" \
    "$WINDMILL_URL/api/users/email/$ADMIN_EMAIL")

if [ "$USER_EXISTS" != "200" ]; then
    curl -s -X POST "$WINDMILL_URL/api/users/create" \
        -H "Authorization: Bearer $SUPERADMIN_SECRET" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\", \"super_admin\": true, \"name\": \"Admin\"}"
    echo -e "${GREEN}Admin user created.${NC}"
else
    echo -e "${YELLOW}Admin user already exists.${NC}"
fi

# Add user to workspace
curl -s -X POST "$WINDMILL_URL/api/w/$WORKSPACE_NAME/users/add" \
    -H "Authorization: Bearer $SUPERADMIN_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"is_admin\": true}" 2>/dev/null || true

# Set base_url to skip first-time setup wizard
echo -e "${YELLOW}Configuring instance settings...${NC}"
curl -s -X POST "$WINDMILL_URL/api/settings/global/base_url" \
    -H "Authorization: Bearer $SUPERADMIN_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"value\": \"$WINDMILL_URL\"}" 2>/dev/null || true

# Step 6: Login as admin user to get API token
echo -e "${YELLOW}Logging in as admin user...${NC}"
sleep 2  # Wait for user creation to propagate
API_TOKEN=$(curl -s -X POST "$WINDMILL_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}" | tr -d '"')

if [ -z "$API_TOKEN" ] || [ "$API_TOKEN" = "null" ]; then
    echo -e "${RED}Failed to login as admin user.${NC}"
    exit 1
fi
echo -e "${GREEN}Logged in successfully.${NC}"

# Step 7: Configure wmill CLI and sync
echo -e "${YELLOW}Configuring wmill CLI...${NC}"
cd windmill-workspace

# Remove existing workspace config if present
wmill workspace remove -s "$WORKSPACE_NAME" 2>/dev/null || true

# Add workspace
wmill workspace add "$WORKSPACE_NAME" "$WINDMILL_URL" --token "$API_TOKEN"

# Push the workspace configuration
echo -e "${YELLOW}Pushing workspace configuration...${NC}"
wmill sync push --yes

cd ..

# Step 8: Create API token variable for demo containers
echo -e "${YELLOW}Creating API token variable for demo containers...${NC}"
# Generate a new token specifically for the demo provisioner
DEMO_TOKEN_RESPONSE=$(curl -s -X POST "$WINDMILL_URL/api/users/tokens/create" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"label\": \"demo-provisioner\", \"expiration\": null, \"scopes\": null}")
DEMO_TOKEN=$(echo "$DEMO_TOKEN_RESPONSE" | jq -r '.' 2>/dev/null || echo "$DEMO_TOKEN_RESPONSE")

# Update the api_token variable
curl -s -X POST "$WINDMILL_URL/api/w/$WORKSPACE_NAME/variables/update/f/demo_provisioner/api_token" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"value\": \"$DEMO_TOKEN\"}" 2>/dev/null || \
curl -s -X POST "$WINDMILL_URL/api/w/$WORKSPACE_NAME/variables/create" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"path\": \"f/demo_provisioner/api_token\", \"value\": \"$DEMO_TOKEN\", \"is_secret\": true, \"description\": \"API token for demo containers to call back to Windmill\"}"

echo -e "${GREEN}API token variable created.${NC}"

# Done!
echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Windmill is running at: $WINDMILL_URL"
echo ""
echo "Login credentials:"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo ""
echo "To access the demo provisioner app:"
echo "  1. Go to $WINDMILL_URL"
echo "  2. Log in with the credentials above"
echo "  3. Navigate to Apps > demo_provisioner"
echo ""

# Try to open browser
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$WINDMILL_URL" 2>/dev/null &
elif command -v open >/dev/null 2>&1; then
    open "$WINDMILL_URL" 2>/dev/null &
fi
