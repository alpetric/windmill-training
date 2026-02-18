import subprocess
import re
import wmill


def main(customer_name: str):
    """
    Stops and removes a demo container for the given customer name.
    Updates the database status to 'expired'.
    """
    # Derive container name from customer name (same logic as provisioning)
    safe_name = re.sub(r"[^a-z0-9-]", "-", customer_name.lower())
    safe_name = re.sub(r"-+", "-", safe_name).strip("-")
    container_name = f"demo-{safe_name}"

    # Stop the container
    stop_result = subprocess.run(
        ["docker", "stop", container_name],
        capture_output=True,
        text=True
    )

    # Remove the container
    rm_result = subprocess.run(
        ["docker", "rm", container_name],
        capture_output=True,
        text=True
    )

    # Update status in database
    db = wmill.datatable("demo_environments")
    db.query(
        """
        UPDATE demo_environments
        SET status = 'expired'
        WHERE customer_name = $1
          AND status = 'active'
        """,
        customer_name,
    ).fetch()

    return {
        "customer_name": customer_name,
        "container_name": container_name,
        "stopped": stop_result.returncode == 0,
        "removed": rm_result.returncode == 0,
    }
