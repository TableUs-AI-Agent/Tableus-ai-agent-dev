export const OFFLINE_REFRESH_MESSAGE = "Offline. Showing the most recently loaded data.";

export async function refreshWhenOnline(isOnline: boolean, refetch: () => Promise<unknown>) {
  if (!isOnline) return false;
  await refetch();
  return true;
}
