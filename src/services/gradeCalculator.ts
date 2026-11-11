import { StudentMarks } from '../types';

export function isSpecialSubject(subject: string): boolean {
  if (!subject) return false;
  const s = subject.trim();
  return /تربية فنية|فنية|نشاط بدني|رياضة|تربية بدنية|موسيقى|نشيد|أخلاقية|تربية أخلاقية/.test(s);
}

export function defaultStudentMarks(): StudentMarks {
  return {
    m1Daily: [0, 0, 0, 0],
    m1Written: 0,
    m1MonthAvg: 0,
    m2Daily: [0, 0, 0, 0],
    m2Written: 0,
    m2MonthAvg: 0,
    firstTermAvg: 0,
    midtermOral: [0],
    midtermScore: 0,
    midtermTotal: 0,
    midtermFinalGrade: 0,
    m3Daily: [0, 0, 0, 0],
    m3Written: 0,
    m3MonthAvg: 0,
    m4Daily: [0, 0, 0, 0],
    m4Written: 0,
    m4MonthAvg: 0,
    secondTermAvg: 0,
    annualPursuit: 0,
    finalOral: [0],
    finalWrittenD1: 0,
    finalWrittenD2: null,
    finalExamTotal: 0,
    finalRound1Grade: null,
    finalRound2Grade: null,
    finalDecidedGrade: null
  };
}

export function calculateTotals(marks: StudentMarks, subject: string): StudentMarks {
  const u = { ...marks };
  const isSpecial = isSpecialSubject(subject);

  const hasM1 = u.m1Written > 0 || u.m1Daily.some(d => d > 0);
  const hasM2 = u.m2Written > 0 || u.m2Daily.some(d => d > 0);
  const hasMidterm = u.midtermScore > 0 || u.midtermOral.some(d => d > 0);
  const hasM3 = u.m3Written > 0 || u.m3Daily.some(d => d > 0);
  const hasM4 = u.m4Written > 0 || u.m4Daily.some(d => d > 0);
  const hasFinalExam = u.finalWrittenD1 > 0 || (u.finalWrittenD2 != null && u.finalWrittenD2 > 0);

  if (isSpecial) {
    // Special subjects: sum directly without division
    u.m1MonthAvg = hasM1 ? (u.m1Daily.reduce((a, b) => a + b, 0) + u.m1Written) : 0;
    u.m2MonthAvg = hasM2 ? (u.m2Daily.reduce((a, b) => a + b, 0) + u.m2Written) : 0;
    u.m3MonthAvg = hasM3 ? (u.m3Daily.reduce((a, b) => a + b, 0) + u.m3Written) : 0;
    u.m4MonthAvg = hasM4 ? (u.m4Daily.reduce((a, b) => a + b, 0) + u.m4Written) : 0;

    u.midtermTotal = hasMidterm ? (u.midtermOral.reduce((a, b) => a + b, 0) + u.midtermScore) : 0;
    u.midtermFinalGrade = u.midtermTotal;
    u.finalExamTotal = hasFinalExam ? (u.finalOral.reduce((a, b) => a + b, 0) + u.finalWrittenD1) : 0;
  } else {
    // Standard academic subjects (الرياضيات، العلوم، اللغة العربية، الخ)
    // Month 1
    const m1ActiveDaily = u.m1Daily.filter(d => d > 0);
    const m1DailyAvg = m1ActiveDaily.length > 0 ? (m1ActiveDaily.reduce((a, b) => a + b, 0) / m1ActiveDaily.length) : 0;
    u.m1MonthAvg = hasM1 ? Math.round((m1DailyAvg + u.m1Written) / 2) : 0;

    // Month 2
    const m2ActiveDaily = u.m2Daily.filter(d => d > 0);
    const m2DailyAvg = m2ActiveDaily.length > 0 ? (m2ActiveDaily.reduce((a, b) => a + b, 0) / m2ActiveDaily.length) : 0;
    u.m2MonthAvg = hasM2 ? Math.round((m2DailyAvg + u.m2Written) / 2) : 0;

    // Midterm
    const midtermOralSum = u.midtermOral.reduce((a, b) => a + b, 0);
    u.midtermTotal = hasMidterm ? Math.round((midtermOralSum + u.midtermScore) / (midtermOralSum > 0 ? 2 : 1)) : 0;
    u.midtermFinalGrade = u.midtermTotal;

    // Month 3
    const m3ActiveDaily = u.m3Daily.filter(d => d > 0);
    const m3DailyAvg = m3ActiveDaily.length > 0 ? (m3ActiveDaily.reduce((a, b) => a + b, 0) / m3ActiveDaily.length) : 0;
    u.m3MonthAvg = hasM3 ? Math.round((m3DailyAvg + u.m3Written) / 2) : 0;

    // Month 4
    const m4ActiveDaily = u.m4Daily.filter(d => d > 0);
    const m4DailyAvg = m4ActiveDaily.length > 0 ? (m4ActiveDaily.reduce((a, b) => a + b, 0) / m4ActiveDaily.length) : 0;
    u.m4MonthAvg = hasM4 ? Math.round((m4DailyAvg + u.m4Written) / 2) : 0;

    // Final Exam Total
    const finalOralSum = u.finalOral.reduce((a, b) => a + b, 0);
    u.finalExamTotal = hasFinalExam ? Math.round((finalOralSum + u.finalWrittenD1) / (finalOralSum > 0 ? 2 : 1)) : 0;
  }

  // First Term Average
  if (u.m1MonthAvg > 0 || u.m2MonthAvg > 0) {
    const activeMonths = (u.m1MonthAvg > 0 ? 1 : 0) + (u.m2MonthAvg > 0 ? 1 : 0);
    u.firstTermAvg = Math.round((u.m1MonthAvg + u.m2MonthAvg) / (activeMonths || 1));
  } else {
    u.firstTermAvg = 0;
  }

  // Second Term Average
  if (u.m3MonthAvg > 0 || u.m4MonthAvg > 0) {
    const activeMonths = (u.m3MonthAvg > 0 ? 1 : 0) + (u.m4MonthAvg > 0 ? 1 : 0);
    u.secondTermAvg = Math.round((u.m3MonthAvg + u.m4MonthAvg) / (activeMonths || 1));
  } else {
    u.secondTermAvg = 0;
  }

  // Annual Pursuit (السعي السنوي) = (معدل الفصل الأول + نصف السنة + معدل الفصل الثاني) / 3
  const components = [u.firstTermAvg, u.midtermFinalGrade, u.secondTermAvg].filter(c => c > 0);
  u.annualPursuit = components.length > 0 ? Math.round(components.reduce((a, b) => a + b, 0) / components.length) : 0;

  // Final Round 1 Grade
  if (u.annualPursuit > 0 && u.finalExamTotal > 0) {
    u.finalRound1Grade = Math.round((u.annualPursuit + u.finalExamTotal) / 2);
  } else {
    u.finalRound1Grade = null;
  }

  // Final Decided Grade
  u.finalDecidedGrade = u.finalRound2Grade ?? u.finalRound1Grade ?? (u.annualPursuit > 0 ? u.annualPursuit : null);

  return u;
}
