export async function main(expired: any[], cleanupResults: any[]) {
  return {
    total_expired: expired.length,
    cleaned_up: cleanupResults.length,
    results: cleanupResults
  };
}
