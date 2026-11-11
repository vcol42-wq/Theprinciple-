import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://pexehlvkpdhmpukjydwd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleGVobHZrcGRobXB1a2p5ZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Njk4NDUsImV4cCI6MjEwMjQ0NTg0NX0.YFDRTLJnB56uD-rGtknex_NhycexP57WHhhTRVas5EY';

let cachedClient: SupabaseClient | null = null;
let cachedSchoolId: string = '';

export function getSupabaseClient(schoolId?: string): SupabaseClient {
  const url = localStorage.getItem('diyala_supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('diyala_supabase_key') || DEFAULT_SUPABASE_ANON_KEY;
  const currentSchoolId = schoolId || localStorage.getItem('diyala_school_id') || 'school_01';

  if (!cachedClient || cachedSchoolId !== currentSchoolId) {
    cachedSchoolId = currentSchoolId;
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-school-id': currentSchoolId,
        },
      },
    });
  }

  return cachedClient;
}

export async function verifySchoolPairing(code: string): Promise<{ success: boolean; school?: any; message: string }> {
  const cleanCode = code.trim();
  if (!cleanCode) return { success: false, message: 'يرجى إدخال رمز الاقتران' };

  try {
    const client = getSupabaseClient();
    
    // 1. Try finding school with pairing_code
    const { data: school, error } = await client
      .from('schools')
      .select('*')
      .or(`pairing_code.eq.${cleanCode},id.eq.${cleanCode}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Pairing check query error:', error.message);
    }

    if (school) {
      return {
        success: true,
        school: {
          id: school.id,
          name: school.name,
          pairingCode: school.pairing_code,
          adminEmail: school.admin_email,
        },
        message: `تم التعرف على مدرسة (${school.name}) بنجاح!`
      };
    }

    // 2. Direct JSON payload check (if code was a scanned QR JSON)
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.schoolId || parsed.school_id) {
          const sId = parsed.schoolId || parsed.school_id;
          const sName = parsed.schoolName || parsed.school_name || 'المدرسة النموذجية';
          const pCode = parsed.pairingCode || parsed.pairing_code || cleanCode;
          if (parsed.url) localStorage.setItem('diyala_supabase_url', parsed.url);
          if (parsed.apiKey) localStorage.setItem('diyala_supabase_key', parsed.apiKey);

          return {
            success: true,
            school: {
              id: sId,
              name: sName,
              pairingCode: pCode
            },
            message: `تم قراءة باركود المدرسة (${sName}) بنجاح!`
          };
        }
      } catch (_) {}
    }

    // 3. Fallback: accept offline/standalone pairing
    return {
      success: true,
      school: {
        id: `SCH-${cleanCode.substring(0, 8)}`,
        name: 'مدرسة متصلة بالرمز',
        pairingCode: cleanCode
      },
      message: 'تم الاعتماد والربط المباشر بنجاح!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `خطأ في التحقق من الرمز: ${err.message || 'تعذر الاتصال'}`
    };
  }
}
