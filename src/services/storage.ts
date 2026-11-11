import { Student, ClassPackage, SchoolConfig, TimetableRow, Directive, AttendanceRecord } from '../types';
import { getSupabaseClient } from './supabase';
import { calculateTotals } from './gradeCalculator';

const STORAGE_KEYS = {
  CONFIG: 'diyala_school_config',
  PACKAGES: 'diyala_class_packages',
  STUDENTS: 'diyala_students_records',
  SCHEDULE: 'diyala_weekly_schedule',
  ATTENDANCE: 'diyala_daily_attendance',
  DIRECTIVES: 'diyala_school_directives',
  TEACHER_NAME: 'diyala_teacher_name'
};

export const StorageService = {
  // Config
  getConfig(): SchoolConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      schoolId: 'school_01',
      schoolName: 'مدرسة نموذجية',
      pairingCode: '112233',
      isActivated: false,
      role: 'teacher',
      isCloudSyncEnabled: true
    };
  },

  saveConfig(config: SchoolConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    if (config.schoolId) localStorage.setItem('diyala_school_id', config.schoolId);
    if (config.pairingCode) localStorage.setItem('diyala_pairing_code', config.pairingCode);
  },

  // Teacher Name
  getTeacherName(): string {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_NAME) || 'أستاذ المادة';
  },

  setTeacherName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.TEACHER_NAME, name.trim());
  },

  // Class Packages (الشعب والمواد المسندة)
  getPackages(): ClassPackage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [
      { id: 'pkg-1', grade: 'الأول المتوسط', section: 'أ', subject: 'الرياضيات', studentsCount: 0 },
      { id: 'pkg-2', grade: 'الأول المتوسط', section: 'ب', subject: 'الرياضيات', studentsCount: 0 }
    ];
  },

  savePackages(packages: ClassPackage[]): void {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  },

  addPackage(pkg: ClassPackage): void {
    const list = this.getPackages();
    const exists = list.some(p => p.grade === pkg.grade && p.section === pkg.section && p.subject === pkg.subject);
    if (!exists) {
      list.push(pkg);
      this.savePackages(list);
    }
  },

  deletePackage(pkgId: string): void {
    const list = this.getPackages().filter(p => p.id !== pkgId);
    this.savePackages(list);
  },

  updatePackage(pkg: ClassPackage): void {
    const list = this.getPackages().map(p => p.id === pkg.id ? pkg : p);
    this.savePackages(list);
  },

  // Students & Grades (الطلاب والدرجات)
  getStudents(grade?: string, section?: string, subject?: string): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      let all: Student[] = raw ? JSON.parse(raw) : [];
      if (grade && section && subject) {
        return all.filter(s => s.currentGrade === grade && s.section === section && s.subject === subject);
      }
      return all;
    } catch (_) {
      return [];
    }
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  updateStudentMarks(studentId: string, updatedMarks: any): void {
    const all = this.getStudents();
    const idx = all.findIndex(s => s.id === studentId);
    if (idx > -1) {
      all[idx].marks = calculateTotals(updatedMarks, all[idx].subject);
      this.saveStudents(all);
    }
  },

  // Cloud Synchronization with Supabase
  async syncRosterFromCloud(grade: string, section: string, subject: string): Promise<{ success: boolean; count: number; message: string }> {
    const config = this.getConfig();
    const schoolId = config.schoolId || 'school_01';
    const client = getSupabaseClient(schoolId);

    try {
      // 1. Fetch Students from cloud for this class
      const { data: cloudStudents, error: stdError } = await client
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('current_grade', grade)
        .eq('section', section);

      if (stdError) throw stdError;

      if (!cloudStudents || cloudStudents.length === 0) {
        return { success: false, count: 0, message: 'لم يتم العثور على طلاب مسجلين في السحابة لهذه الشعبة.' };
      }

      // 2. Fetch existing grades for this subject
      const { data: cloudGrades } = await client
        .from('grades')
        .select('*')
        .eq('school_id', schoolId)
        .eq('grade', grade)
        .eq('section', section)
        .eq('subject', subject);

      const gradesMap = new Map<string, any>();
      if (cloudGrades) {
        cloudGrades.forEach(g => gradesMap.set(g.student_record_number, g.marks));
      }

      // 3. Map into local students list
      const mappedStudents: Student[] = cloudStudents.map(cs => {
        const existingMark = gradesMap.get(cs.record_number);
        const marks = existingMark ? calculateTotals(existingMark, subject) : calculateTotals({
          m1Daily: [0, 0, 0, 0], m1Written: 0, m1MonthAvg: 0,
          m2Daily: [0, 0, 0, 0], m2Written: 0, m2MonthAvg: 0,
          firstTermAvg: 0, midtermOral: [0], midtermScore: 0, midtermTotal: 0, midtermFinalGrade: 0,
          m3Daily: [0, 0, 0, 0], m3Written: 0, m3MonthAvg: 0,
          m4Daily: [0, 0, 0, 0], m4Written: 0, m4MonthAvg: 0,
          secondTermAvg: 0, annualPursuit: 0, finalOral: [0], finalWrittenD1: 0,
          finalExamTotal: 0
        }, subject);

        return {
          id: `std_${cs.record_number}_${subject}`,
          recordNumber: cs.record_number,
          fullName: cs.full_name || `${cs.first_name} ${cs.second_name || ''} ${cs.third_name || ''}`.trim(),
          currentGrade: grade,
          section: section,
          subject: subject,
          marks: marks,
          status: cs.status || 'مستمر'
        };
      });

      // Merge with local storage
      const existingAll = this.getStudents();
      const filtered = existingAll.filter(s => !(s.currentGrade === grade && s.section === section && s.subject === subject));
      const merged = [...filtered, ...mappedStudents];
      this.saveStudents(merged);

      // Update package count
      const pkgs = this.getPackages();
      const pIdx = pkgs.findIndex(p => p.grade === grade && p.section === section && p.subject === subject);
      if (pIdx > -1) {
        pkgs[pIdx].studentsCount = mappedStudents.length;
        this.savePackages(pkgs);
      }

      return {
        success: true,
        count: mappedStudents.length,
        message: `تم تنزيل ومزامنة (${mappedStudents.length}) طالباً بنجاح من السحابة ☁️✓`
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: `تعذر الاتصال بالسحابة: ${err.message || 'خطأ غير متوقع'}`
      };
    }
  },

  async uploadGradesToCloud(grade: string, section: string, subject: string): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const schoolId = config.schoolId || 'school_01';
    const client = getSupabaseClient(schoolId);
    const students = this.getStudents(grade, section, subject);

    if (students.length === 0) {
      return { success: false, message: 'لا يوجد طلاب لرفع درجاتهم.' };
    }

    try {
      const payload = students.map(s => ({
        school_id: schoolId,
        student_record_number: s.recordNumber,
        subject: subject,
        grade: grade,
        section: section,
        marks: s.marks,
        updated_at: new Date().toISOString()
      }));

      const { error } = await client
        .from('grades')
        .upsert(payload, { onConflict: 'school_id,student_record_number,subject' });

      if (error) throw error;

      return {
        success: true,
        message: `تم رفع وتأمين درجات (${students.length}) طالباً في السحابة بنجاح! ☁️✓`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `فشل رفع الدرجات: ${err.message || 'خطأ غير معروف'}`
      };
    }
  }
};
