# Demo Product: Team Workspace

A simple HTML/JS demo application that simulates a "Team Workspace" product.
Used for Windmill training demo scenarios.

## Features

- Accepts URL parameters: `app_name`, `customer_name`, `num_users`, `num_rooms`, `ttl_minutes`
- Auto-generates fake users on load
- Shows:
  - Header with app name and customer name
  - TTL countdown timer (prominent, updates every second)
  - Grid of "rooms" with capacity limits
  - List of users with drag-to-assign functionality
  - Stats bar showing total users, rooms, and assigned count

## Build & Run

```bash
# Build the Docker image
docker build -t demo-workspace .

# Run a container
docker run -d -p 8080:80 --name my-demo demo-workspace

# Access at:
# http://localhost:8080?app_name=Acme%20Corp&customer_name=Acme%20Inc&num_users=8&num_rooms=3&ttl_minutes=30
```

## URL Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `app_name` | "Demo Workspace" | Name shown in header |
| `customer_name` | "Demo Customer" | Customer name shown below app name |
| `num_users` | 10 | Number of users to generate |
| `num_rooms` | 4 | Number of rooms to create |
| `ttl_minutes` | 30 | Countdown timer duration |

## Tech Stack

- Single HTML file
- Vanilla JavaScript
- Tailwind CSS (CDN)
- Nginx Alpine for serving
