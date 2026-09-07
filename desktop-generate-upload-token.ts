// desktop-generate-upload-token.ts
// Secure, URL-safe random token generator for upload sessions for Desktop app
export function generateUploadToken(): string {
  const arr = new Uint8Array(32);
  if (typeof (globalThis as any).crypto !== 'undefined' && typeof (globalThis as any).crypto.getRandomValues === 'function') {
    (globalThis as any).crypto.getRandomValues(arr);
  } else {
    // Node fallback
    const nodeCrypto = require('crypto');
    const buf: Buffer = nodeCrypto.randomBytes(32);
    for (let i = 0; i < buf.length; i++) arr[i] = buf[i];
  }
  // base64url encode
  let str = Buffer.from(arr).toString('base64');
  str = str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return str;
}
