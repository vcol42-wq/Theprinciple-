export type AppRole = 'teacher' | 'student' | 'principal';

export interface StudentMarks {
  // Month 1
  m1Daily: number[];
  m1Written: number;
  m1MonthAvg: number;
  
  // Month 2
  m2Daily: number[];
  m2Written: number;
  m2MonthAvg: number;
  
  // First Term Final Average (معدل الفصل الأول)
  firstTermAvg: number;
  
  // Midterm Exam (امتحان نصف السنة)
  midtermOral: number[];
  midtermScore: number;
  midtermTotal: number;
  midtermFinalGrade: number;
  
  // Month 3
  m3Daily: number[];
  m3Written: number;
  m3MonthAvg: number;
  
  // Month 4
  m4Daily: number[];
  m4Written: number;
  m4MonthAvg: number;
  
  // Second Term Final Average (معدل الفصل الثاني)
  secondTermAvg: number;
  
  // Annual Pursuit (السعي السنوي)
  annualPursuit: number;
  
  // Final Exams
  finalOral: number[];
  finalWrittenD1: number;
  finalWrittenD2?: number | null;
  finalExamTotal: number;
  
  // Final Result
  finalRound1Grade?: number | null;
  finalRound2Grade?: number | null;
  finalDecidedGrade?: number | null;
}

export interface Student {
  id: string;
  recordNumber: string;
  fullName: string;
  currentGrade: string;
  section: string;
  subject: string;
  marks: StudentMarks;
  absencesCount?: number;
  status?: string;
}

export interface ClassPackage {
  id: string;
  grade: string;
  section: string;
  subject: string;
  teacherName?: string;
  studentsCount?: number;
}

export interface SchoolConfig {
  schoolId: string;
  schoolName: string;
  pairingCode: string;
  studentPairingCode?: string;
  principalPairingCode?: string;
  managerName?: string;
  isActivated: boolean;
  role: AppRole;
  isCloudSyncEnabled: boolean;
  syncSealToken?: string;
}

export interface TimetableSlot {
  subject: string;
  teacherName: string;
  isOff?: boolean;
}

export interface TimetableRow {
  grade: string;
  section: string;
  lessons: {
    lesson1?: TimetableSlot;
    lesson2?: TimetableSlot;
    lesson3?: TimetableSlot;
    lesson4?: TimetableSlot;
    lesson5?: TimetableSlot;
    lesson6?: TimetableSlot;
  };
}

export interface Directive {
  id: string;
  title: string;
  content: string;
  target_role: string;
  created_at: string;
}

export interface AttendanceRecord {
  id?: string;
  studentRecordNumber: string;
  dateString: string;
  status: 'absent' | 'present';
  subject: string;
  periodNumber: number;
}
