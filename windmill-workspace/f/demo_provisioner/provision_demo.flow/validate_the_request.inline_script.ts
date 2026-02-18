export async function main(
  customer_name: string,
  app_name: string = "Demo Workspace",
  num_users: number = 10,
  num_rooms: number = 4,
  ttl_minutes: number = 30
) {
  // Validate customer name
  if (!customer_name || customer_name.trim().length < 2) {
    throw new Error("Customer name must be at least 2 characters");
  }

  // Validate limits
  if (num_users < 1 || num_users > 50) {
    throw new Error("Number of users must be between 1 and 50");
  }

  if (num_rooms < 1 || num_rooms > 10) {
    throw new Error("Number of rooms must be between 1 and 10");
  }

  if (ttl_minutes < 5 || ttl_minutes > 480) {
    throw new Error("TTL must be between 5 and 480 minutes (8 hours)");
  }

  console.log(`Validated request for customer: ${customer_name}`);
  console.log(`Config: ${num_users} users, ${num_rooms} rooms, ${ttl_minutes} min TTL`);

  return {
    customer_name: customer_name.trim(),
    app_name: app_name || "Demo Workspace",
    num_users,
    num_rooms,
    ttl_minutes,
    validated_at: new Date().toISOString(),
  };
}
