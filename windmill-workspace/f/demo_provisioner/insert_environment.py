import wmill


def main(
    customer_name: str,
    app_name: str = "Demo Workspace",
    num_users: int = 10,
    num_rooms: int = 4,
    ttl_minutes: int = 30,
    status: str = "pending_approval",
):
    """
    Inserts a new demo environment record into the data table.
    """
    db = wmill.datatable("demo_environments")

    result = db.query(
        """
        INSERT INTO demo_environments
            (customer_name, app_name, num_users, num_rooms, ttl_minutes, status)
        VALUES ($1, $2, $3::int, $4::int, $5::int, $6)
        RETURNING id
        """,
        customer_name,
        app_name,
        num_users,
        num_rooms,
        ttl_minutes,
        status,
    ).fetch_one()

    return {"id": result["id"], "customer_name": customer_name, "status": status}
