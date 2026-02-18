import wmill


def main(record_id: int):
    """
    Gets the config and state for a demo environment by record ID.
    """
    db = wmill.datatable("demo_environments")

    result = db.query(
        """
        SELECT app_name, customer_name, num_users, num_rooms,
               ttl_minutes, expires_at, app_state
        FROM demo_environments
        WHERE id = $1::int
        """,
        record_id,
    ).fetch_one()

    if not result:
        return None

    return {
        "app_name": result["app_name"],
        "customer_name": result["customer_name"],
        "num_users": result["num_users"],
        "num_rooms": result["num_rooms"],
        "ttl_minutes": result["ttl_minutes"],
        "expires_at": str(result["expires_at"]) if result["expires_at"] else None,
        "app_state": result["app_state"],
    }
