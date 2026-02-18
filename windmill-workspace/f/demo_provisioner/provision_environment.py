import subprocess
import re
import os
from datetime import datetime, timedelta, timezone
import wmill


def main(
    customer_name: str,
    record_id: int,
    app_name: str = "Demo Workspace",
    num_users: int = 10,
    num_rooms: int = 4,
    ttl_minutes: int = 30,
):
    """
    Provisions a new demo environment by spinning up a Docker container.
    All config is passed as environment variables - no URL params needed.
    """
    # Sanitize customer name for container naming
    safe_name = re.sub(r"[^a-z0-9-]", "-", customer_name.lower())
    safe_name = re.sub(r"-+", "-", safe_name).strip("-")
    container_name = f"demo-{safe_name}"

    # Generate a port based on hash
    port = 8080 + (hash(container_name) % 1000)

    # Calculate expiration time (UTC)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

    # Get Windmill connection info for state persistence
    # Use internal Docker URL - Flask backend calls Windmill, not browser
    windmill_url = "http://training-windmill-server:8000"
    workspace = os.environ.get("WM_WORKSPACE", "training_demo")
    api_token = wmill.get_variable("f/demo_provisioner/api_token")

    # Check if container already exists
    check_cmd = ["docker", "ps", "-a", "--filter", f"name=^{container_name}$", "--format", "{{.Names}}"]
    existing = subprocess.run(check_cmd, capture_output=True, text=True)
    if existing.stdout.strip() == container_name:
        subprocess.run(["docker", "rm", "-f", container_name], capture_output=True)

    # Run container - only pass what's needed to connect to Windmill
    # The app fetches all config from the data table
    # Connect to docker_windmill network so container can reach windmill_server
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "--network", "docker_windmill",
        "-p", f"{port}:80",
        "-e", f"RECORD_ID={record_id}",
        "-e", f"WINDMILL_URL={windmill_url}",
        "-e", f"WORKSPACE={workspace}",
        "-e", f"WINDMILL_TOKEN={api_token}",
        "demo-workspace",
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Failed to provision container: {result.stderr}")

    container_id = result.stdout.strip()[:12]

    # Get public host from variable (fallback to localhost)
    public_host = wmill.get_variable("f/demo_provisioner/public_host") or "localhost"
    url = f"http://{public_host}:{port}"

    return {
        "container_id": container_id,
        "container_name": container_name,
        "url": url,
        "port": port,
        "customer_name": customer_name,
        "app_name": app_name,
        "num_users": num_users,
        "num_rooms": num_rooms,
        "ttl_minutes": ttl_minutes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at.isoformat(),
    }
