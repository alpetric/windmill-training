# Windmill Training Demo

A self-contained demo environment for Windmill training sessions. This repository provides a complete setup for demonstrating Windmill's workflow automation capabilities through a "Demo Environment Provisioner" scenario.

## Overview

- **Duration:** 1 hour
- **Audience:** Sysadmins, tech sales, sales engineers
- **Goal:** Remove uncertainty and friction in getting started with Windmill
- **Scenario:** Self-service portal to spin up demo environments with approval workflow

## Requirements

- Docker and Docker Compose
- [wmill CLI](https://www.windmill.dev/docs/advanced/cli) (`npm install -g windmill-cli`)
- curl
- jq

## Quick start

```bash
./setup.sh
```

This script will:
1. Start all Docker containers (Windmill, PostgreSQL, Caddy)
2. Build the demo-product Docker image
3. Wait for Windmill to be ready
4. Create the workspace and admin user
5. Push the workspace configuration
6. Generate API tokens for demo containers

## Default login

- **URL:** http://localhost:8000
- **Email:** `admin@windmill.dev`
- **Password:** `changeme`

## Configuration

### Public hostname

If running on a remote server (not localhost), update the `public_host` variable:

1. Log in to Windmill
2. Go to Variables
3. Edit `f/demo_provisioner/public_host`
4. Change from `localhost` to your server's hostname

Or edit `windmill-workspace/f/demo_provisioner/public_host.variable.yaml` before running setup.

### Superadmin secret

The default superadmin secret is `training_secret_changeme`. To change it:

```bash
SUPERADMIN_SECRET=your_secret_here ./setup.sh
```

## Testing the demo

### Step 1: Open the app

1. Go to http://localhost:8000
2. Log in with `admin@windmill.dev` / `changeme`
3. Navigate to **Apps** > **demo_provisioner**
4. Click **Open app**

### Step 2: Submit a demo request

1. Fill in the form:
   - Customer name: `Acme Corp`
   - App name: `Team Workspace`
   - Users: `8`
   - Rooms: `3`
   - Duration: `30`
2. Click **Request Demo Environment**
3. You'll see a toast: "Demo request submitted for approval!"

### Step 3: Approve the request

1. Go to **Runs** in the sidebar
2. Find the suspended flow (yellow icon)
3. Click on it to view details
4. Click **Resume**
5. Check "approved" = true
6. Click **Resume**

### Step 4: Verify the result

1. Go back to the app
2. The table should now show:
   - Status: `active`
   - URL: `http://localhost:XXXX`
3. Click the URL to open the demo product

## Folder structure

```
windmill-training/
├── README.md                    # This file
├── setup.sh                     # Automated setup script
├── docker/
│   ├── docker-compose.yaml      # All containers
│   ├── Caddyfile                # Reverse proxy config
│   └── init.sql                 # Database schema
├── demo-product/
│   ├── app.py                   # Flask backend
│   ├── index.html               # Demo app UI
│   ├── Dockerfile               # Container build
│   └── README.md
└── windmill-workspace/
    ├── wmill.yaml               # Workspace config
    ├── settings.yaml            # Workspace settings
    └── f/demo_provisioner/
        ├── demo_db.resource.yaml         # PostgreSQL connection
        ├── api_token.variable.yaml       # Token for demo containers
        ├── public_host.variable.yaml     # Public hostname config
        ├── provision_environment.py      # Spin up Docker container
        ├── provision_demo.flow/          # Main flow with approval
        ├── cleanup_expired.flow/         # Automatic cleanup
        └── demo_provisioner.app/         # Self-service UI
```

## Cleanup

```bash
# Stop and remove all demo containers
docker rm -f $(docker ps -q --filter "name=demo-")

# Stop Windmill and databases
cd docker && docker compose down

# Or to also remove all data:
cd docker && docker compose down -v
```

## Troubleshooting

### "Connection refused" errors
- Make sure Docker is running: `docker ps`
- Check containers are healthy: `docker compose -f docker/docker-compose.yaml ps`

### Container won't start
- Check if port 8000 is in use: `lsof -i :8000`
- Check Docker socket is accessible from worker

### App shows empty table
- Verify database has data: `psql postgres://demo:demo123@localhost:5433/demo_db -c "SELECT * FROM demo_environments"`
- Check background script errors in browser console

### wmill sync fails
- Ensure you're logged in: `wmill workspace whoami`
- Check token validity: `wmill user whoami`
