// Client and server must use the same protocol for the connected Blob store.
export function uploadMode(): 'token' | 'presigned' | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'token';
  if (process.env.BLOB_STORE_ID && process.env.BLOB_WEBHOOK_PUBLIC_KEY) return 'presigned';
  return null;
}
