Fix: Session upload tokens (generate + Supabase schema + Android verification)

What changed
- Added SQL script `create_session_upload_tokens.sql` to create the session_upload_tokens table and an optional audit table.
- Added `desktop-generate-upload-token.ts` helper to securely generate URL-safe tokens.

How to integrate (Desktop)
1. Import generateUploadToken and call when creating a new session token:

```ts
import { generateUploadToken } from './desktop-generate-upload-token';
const token = generateUploadToken();
// store token to Supabase with teacher_id, allowed subject_ids/class_ids and expires_at
```

2. Save the token in Supabase table `session_upload_tokens` with an expiry (default 1 hour).
3. Display the token in the Desktop UI or encode it in the QR for the teacher.

How to integrate (Android)
- Before uploading grades, call endpoint or query Supabase to verify token:
  - token exists
  - not revoked
  - not expired
  - teacher_id matches OR subject/class is permitted

Kotlin sketch (verification):
```
suspend fun verifyToken(token: String, teacherId: String, subjectId: String?, classId: String?): Boolean { 
  // query session_upload_tokens where token = token
  // check revoked == false && expires_at > now()
  // check teacher_id == teacherId || subjectId in subject_ids || classId in class_ids
}
```

Testing
1. Run SQL script on Supabase
2. Generate a token from Desktop, insert it, scan QR in Android
3. Upload grades (should succeed)
4. After expiry, upload should fail with clear message

Notes
- Consider adding an is_permanent boolean for long-lived teacher tokens managed by admins.
- Add audit logging for token creation/use/revocation.
