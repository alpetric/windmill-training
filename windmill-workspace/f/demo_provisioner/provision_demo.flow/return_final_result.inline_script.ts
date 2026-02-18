export async function main(
  approved: boolean,
  provision_result: any | null,
  update_result: any,
  record_id: number
) {
  if (approved && provision_result) {
    console.log("Demo environment provisioned successfully!");
    console.log(`URL: ${provision_result.url}`);
    console.log(`Expires: ${provision_result.expires_at}`);

    return {
      status: "success",
      record_id,
      url: provision_result.url,
      container_name: provision_result.container_name,
      expires_at: provision_result.expires_at,
    };
  } else {
    console.log("Demo request was rejected");

    return {
      status: "rejected",
      record_id,
      message: "Request was not approved",
    };
  }
}
