import * as wmill from "windmill-client";

export async function main(
  customer_name: string,
  app_name: string,
  num_users: number,
  num_rooms: number,
  ttl_minutes: number,
  requester: string,
  record_id: number
) {
  // Get the approval URLs
  const urls = await wmill.getResumeUrls();

  console.log("=".repeat(50));
  console.log("APPROVAL REQUIRED");
  console.log("=".repeat(50));
  console.log(`\nDemo Environment Request (Record #${record_id}):`);
  console.log(`  Customer: ${customer_name}`);
  console.log(`  App Name: ${app_name}`);
  console.log(`  Users: ${num_users}`);
  console.log(`  Rooms: ${num_rooms}`);
  console.log(`  Duration: ${ttl_minutes} minutes`);
  console.log(`  Requested by: ${requester}`);
  console.log(`\nApproval Page: ${urls.approvalPage}`);
  console.log("=".repeat(50));

  return {
    message: `Awaiting approval for ${customer_name} demo environment`,
    approval_url: urls.approvalPage,
    record_id,
    request_summary: {
      customer_name,
      app_name,
      num_users,
      num_rooms,
      ttl_minutes,
      requester,
    },
  };
}
