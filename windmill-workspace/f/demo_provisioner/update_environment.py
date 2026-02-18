from typing import Optional
from datetime import datetime, timezone
import wmill


def main(
    id: int,
    status: Optional[str] = None,
    container_id: Optional[str] = None,
    container_name: Optional[str] = None,
    url: Optional[str] = None,
    port: Optional[int] = None,
    expires_at: Optional[str] = None,
    approved_by: Optional[str] = None,
    rejection_reason: Optional[str] = None,
):
    """
    Updates a demo environment record in the data table.
    """
    db = wmill.datatable("demo_environments")

    # Build dynamic UPDATE statement
    updates = []
    values = []
    param_num = 1

    if status is not None:
        updates.append(f"status = ${param_num}")
        values.append(status)
        param_num += 1

    if container_id is not None:
        updates.append(f"container_id = ${param_num}")
        values.append(container_id)
        param_num += 1

    if container_name is not None:
        updates.append(f"container_name = ${param_num}")
        values.append(container_name)
        param_num += 1

    if url is not None:
        updates.append(f"url = ${param_num}")
        values.append(url)
        param_num += 1

    if port is not None:
        updates.append(f"port = ${param_num}::int")
        values.append(port)
        param_num += 1

    if expires_at is not None:
        updates.append(f"expires_at = ${param_num}::timestamptz")
        values.append(expires_at)
        param_num += 1

    if approved_by is not None:
        updates.append(f"approved_by = ${param_num}")
        values.append(approved_by)
        param_num += 1
        updates.append(f"approved_at = ${param_num}::timestamptz")
        values.append(datetime.now(timezone.utc).isoformat())
        param_num += 1

    if rejection_reason is not None:
        updates.append(f"rejection_reason = ${param_num}")
        values.append(rejection_reason)
        param_num += 1

    if not updates:
        return {"id": id, "message": "No updates provided"}

    values.append(id)

    query = f"""
        UPDATE demo_environments
        SET {', '.join(updates)}
        WHERE id = ${param_num}::int
        RETURNING id, customer_name, status
    """

    result = db.query(query, *values).fetch_one()

    return {"id": result["id"], "customer_name": result["customer_name"], "status": result["status"]}
