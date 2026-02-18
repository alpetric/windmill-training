# Windmill Training - Workspace

This folder contains the Windmill workspace assets for the training demo scenario:
**Demo Environment Provisioner**.

## Contents

### Scripts

| Script | Description |
|--------|-------------|
| `provision_environment` | Spins up a Docker container running the demo app |
| `teardown_environment` | Stops and removes a demo container |
| `insert_environment` | Inserts a record into the database |
| `update_environment` | Updates a record in the database |
| `list_environments` | Lists all environments from the database |
| `check_expired_environments` | Lists active demo containers (scheduled cleanup) |

### Flows

| Flow | Description |
|------|-------------|
| `provision_demo` | Full provisioning flow with approval step |

**Flow steps:**
1. **validate_request** - Validates input parameters
2. **insert_pending** - Creates database record with pending status
3. **approval** - Pauses for manager approval (human-in-the-loop)
4. **check_approval** - Branches based on approval decision
   - If approved: provisions the environment, updates record to active
   - If rejected: updates record with rejection reason
5. **final_result** - Returns the result

### Apps

| App | Description |
|-----|-------------|
| `demo_provisioner` | Self-service UI for requesting demo environments |

### Schedules

| Schedule | Description |
|----------|-------------|
| `cleanup_schedule` | Runs every 5 minutes to check for expired environments |

## Import to Windmill

### Using wmill CLI

```bash
# Navigate to this directory
cd windmill-workspace

# Add your workspace (if not already configured)
wmill workspace add training_demo https://your-windmill-instance.com --token YOUR_TOKEN

# Push all assets
wmill sync push
```

## Prerequisites

Before running the demo:

1. **Start the PostgreSQL database:**
   ```bash
   cd ../docker
   docker compose up -d
   ```

2. **Build the demo-product Docker image:**
   ```bash
   cd ../demo-product
   docker build -t demo-workspace .
   ```

3. **Ensure Docker is accessible from Windmill workers:**
   - The worker must have access to the Docker socket
   - Or use a remote Docker host configuration

## Customization

### Changing the Docker Image

Update the image name in `provision_environment.py`:
```python
"demo-workspace"  # Change to your image name/registry
```

### Changing the Base URL

Update the base URL in `provision_environment.py`:
```python
base_url = "http://localhost"  # Change to your actual hostname
```

### Adding Approval Groups

Edit `provision_demo.flow/flow.yaml` to restrict approvers:
```yaml
suspend:
  user_groups_required:
    type: static
    value: ["managers", "admins"]
```

## Testing

1. Push the workspace to your Windmill instance
2. Navigate to Apps > demo_provisioner > demo_provisioner
3. Fill out the form and submit
4. Check the approval inbox
5. Approve the request
6. Access the provisioned demo at the returned URL
