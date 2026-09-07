Android verification snippet (Kotlin, pseudocode)

// Use your Supabase client or REST API to query the session_upload_tokens table
suspend fun verifyToken(token: String, teacherId: String, subjectId: String?, classId: String?): Boolean {
  // Example using a simple HTTP GET to Supabase REST (or use supabase-kotlin client)
  val resp = supabase.from("session_upload_tokens").select("id,teacher_id,subject_ids,class_ids,expires_at,revoked").eq("token", token).single()
  if (resp.error != null) return false
  val row = resp.data
  if (row.revoked == true) return false
  if (Instant.parse(row.expires_at).isBefore(Instant.now())) return false
  // subject_ids and class_ids are JSON arrays
  val allowedByTeacher = row.teacher_id == teacherId
  val allowedBySubject = subjectId != null && row.subject_ids?.contains(subjectId) == true
  val allowedByClass = classId != null && row.class_ids?.contains(classId) == true
  return allowedByTeacher || allowedBySubject || allowedByClass
}

// Call this function from the upload flow; return a clear error message on failure.
