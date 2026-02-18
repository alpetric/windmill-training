import wmill


def main():
    """
    Gets list of expired demo environments that need cleanup.
    """
    db = wmill.datatable("demo_environments")

    expired = db.query(
        """
        SELECT id, customer_name, container_name
        FROM demo_environments
        WHERE status = 'active'
          AND expires_at < NOW()
        """
    ).fetch()

    return expired
