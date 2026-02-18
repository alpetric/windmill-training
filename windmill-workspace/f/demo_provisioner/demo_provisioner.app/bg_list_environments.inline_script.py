import wmill


def main():
    """
    Background script to list all demo environments from the data table.
    """
    db = wmill.datatable("demo_environments")

    result = db.query(
        """
        SELECT id, customer_name, app_name, num_users, num_rooms,
               ttl_minutes, container_name, url, status,
               created_at, expires_at
        FROM demo_environments
        ORDER BY created_at DESC
        """
    ).fetch()

    return result
