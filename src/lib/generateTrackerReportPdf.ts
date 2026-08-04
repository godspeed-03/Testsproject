import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------- Types (loose - mirrors src/app/api/tracker/report/route.ts response) ----------
export interface TrackerReportData {
  user: { name: string; email: string };
  generatedAt: string;
  todosAndHabits: any[];
  lists: any[];
  syllabusMatrix: any[];
  topicRevisions: any[];
  testLogs: any[];
  dailySnapshots: any[];
  monthlySnapshots: any[];
  consistencyMonthly: {
    monthKey: string;
    monthName: string;
    overallScore: number;
    grade: string;
    habits: any[];
    subjects: any[];
    categories: any[];
  };
  consistencyAllTime: {
    overallScore: number;
    grade: string;
    totalStudyHours: number;
    totalDaysLogged: number;
    bestStreakDays: number;
    currentStreakDays: number;
    categoryBreakdown: Record<string, any>;
    subjectBreakdown: Record<string, any>;
  };
  weeklyAnalytics: Record<string, any>;
}

// ---------- Colors (amber/slate/emerald to roughly match the app's palette) ----------
const AMBER: [number, number, number] = [217, 119, 6];
const SLATE_DARK: [number, number, number] = [15, 23, 42];
const SLATE_MED: [number, number, number] = [100, 116, 139];
const EMERALD: [number, number, number] = [16, 185, 129];
const LIGHT_BG: [number, number, number] = [248, 250, 252];
const BORDER: [number, number, number] = [226, 232, 240];

const PAGE_W = 210;
const MARGIN = 14;

function fmtDate(d: string | Date) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

export function generateTrackerReportPdf(data: TrackerReportData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const toc: { title: string; page: number }[] = [];
  const bookmarkRoot = null as any;

  // ---------------------------------------------------------------------
  // COVER PAGE
  // ---------------------------------------------------------------------
  doc.setFillColor(...SLATE_DARK);
  doc.rect(0, 0, PAGE_W, 297, 'F');

  doc.setTextColor(...AMBER);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('UPSC TRACKER', MARGIN, 40);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('Progress Report', MARGIN, 55);

  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 62, PAGE_W - MARGIN, 62);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  const displayName = data.user?.name || data.user?.email || 'Aspirant';
  doc.text(`Prepared for: ${displayName}`, MARGIN, 74);
  doc.text(`Generated: ${fmtDate(data.generatedAt)}`, MARGIN, 81);

  // Headline stats
  const at = data.consistencyAllTime || ({} as any);
  const stats: [string, string][] = [
    ['Overall Consistency Score', `${Math.round(at.overallScore || 0)} / 100`],
    ['Grade', at.grade || '—'],
    ['Total Study Hours Logged', `${Math.round(at.totalStudyHours || 0)} hrs`],
    ['Total Days Logged', `${at.totalDaysLogged || 0}`],
    ['Current Streak', `${at.currentStreakDays || 0} days`],
    ['Best Streak', `${at.bestStreakDays || 0} days`],
  ];

  let sy = 100;
  stats.forEach(([label, value], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = MARGIN + col * 90;
    const y = sy + row * 26;
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, y, 82, 20, 2, 2, 'F');
    doc.setTextColor(...AMBER);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 5, y + 9);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + 5, y + 15);
  });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Generated automatically from your saved tracker data. Use the bookmarks panel in your PDF viewer to jump between sections.', MARGIN, 280, { maxWidth: PAGE_W - MARGIN * 2 });

  // ---------------------------------------------------------------------
  // TABLE OF CONTENTS (placeholder page - links filled in after content built)
  // ---------------------------------------------------------------------
  doc.addPage();
  const tocPageIndex = doc.getNumberOfPages();
  doc.setTextColor(...SLATE_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Contents', MARGIN, 20);
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN, 24, PAGE_W - MARGIN, 24);

  function addSectionHeading(title: string) {
    doc.addPage();
    const pageNum = doc.getNumberOfPages();
    toc.push({ title, page: pageNum });
    doc.outline.add(bookmarkRoot, title, { pageNumber: pageNum });
    doc.setTextColor(...SLATE_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, MARGIN, 20);
    doc.setDrawColor(...AMBER);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, 24, MARGIN + 30, 24);
    return 32; // starting Y for content
  }

  function ensureSpace(y: number, needed = 20): number {
    if (y + needed > 280) {
      doc.addPage();
      return 20;
    }
    return y;
  }

  function scoreBadgeColor(score: number): [number, number, number] {
    if (score >= 75) return EMERALD;
    if (score >= 50) return AMBER;
    return [239, 68, 68];
  }

  // ---------------------------------------------------------------------
  // SECTION: Daily Agenda — Habits & Todos
  // ---------------------------------------------------------------------
  {
    let y = addSectionHeading('Daily Agenda — Habits & Todos');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text('Every habit / recurring task saved in your tracker, with its current streak.', MARGIN, y);
    y += 6;

    const scoreByHabitId: Record<string, number> = {};
    (data.consistencyMonthly?.habits || []).forEach((h: any) => {
      scoreByHabitId[h.habitId] = h.score;
    });

    const rows = (data.todosAndHabits || []).map((h: any) => {
      const catLabel = typeof h.category === 'string' ? h.category : (h.category?.name || h.category?.label || JSON.stringify(h.category || ''));
      const freqLabel = typeof h.frequency === 'string' ? h.frequency : (h.frequency?.type || JSON.stringify(h.frequency || ''));
      const score = scoreByHabitId[h.id];
      return [
        h.title || 'Untitled',
        h.type === 'habit' ? 'Habit' : 'Task',
        catLabel || '—',
        freqLabel || '—',
        `${h.streakCurrent || 0} / ${h.streakBest || 0}`,
        score !== undefined ? `${score}%` : '—',
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Title', 'Type', 'Category', 'Frequency', 'Streak (Cur/Best)', 'Consistency']],
      body: rows.length ? rows : [['No habits or tasks saved yet.', '', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  // ---------------------------------------------------------------------
  // SECTION: Syllabus Matrix
  // ---------------------------------------------------------------------
  {
    let y = addSectionHeading('Syllabus Matrix');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text('Coverage status across every subject / topic entered into the syllabus tracker.', MARGIN, y);
    y += 6;

    const rows = (data.syllabusMatrix || []).map((s: any) => [
      s.subject || '—',
      s.category || '—',
      s.status || '—',
      s.source || '—',
      s.nextRev || '—',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Subject', 'Category', 'Status', 'Source', 'Next Revision']],
      body: rows.length ? rows : [['No syllabus items saved yet.', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 2) {
          const val = String(hookData.cell.raw || '').toLowerCase();
          if (val.includes('complet') || val === 'done') {
            hookData.cell.styles.textColor = EMERALD;
            hookData.cell.styles.fontStyle = 'bold';
          } else if (val.includes('progress')) {
            hookData.cell.styles.textColor = AMBER;
          }
        }
      },
    });
  }

  // ---------------------------------------------------------------------
  // SECTION: Topic Revisions (SRS)
  // ---------------------------------------------------------------------
  if ((data.topicRevisions || []).length) {
    let y = addSectionHeading('Revision Schedule (SRS)');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text('Spaced-repetition status for topics already read.', MARGIN, y);
    y += 6;

    const rows = data.topicRevisions.map((t: any) => [
      t.subject || '—',
      t.topic || '—',
      t.status || '—',
      t.nextScheduledDate || '—',
      t.isOverdue ? `Overdue (${t.overdueDays}d)` : 'On track',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Subject', 'Topic', 'Status', 'Next Due', 'Revision Health']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 4) {
          const val = String(hookData.cell.raw || '');
          if (val.startsWith('Overdue')) {
            hookData.cell.styles.textColor = [239, 68, 68];
            hookData.cell.styles.fontStyle = 'bold';
          } else {
            hookData.cell.styles.textColor = EMERALD;
          }
        }
      },
    });
  }

  // ---------------------------------------------------------------------
  // SECTION: Monthly Tracker
  // ---------------------------------------------------------------------
  {
    let y = addSectionHeading('Monthly Tracker');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text('Month-by-month rollup of consistency, study hours and active days.', MARGIN, y);
    y += 6;

    const rows = (data.monthlySnapshots || []).map((m: any) => [
      m.monthKey || '—',
      `${Math.round(m.avgConsistencyScore || 0)}%`,
      `${Math.round(m.totalStudyHours || 0)} hrs`,
      `${Math.round(m.habitFulfillmentPercent || 0)}%`,
      `${Math.round(m.topicFulfillmentPercent || 0)}%`,
      `${m.activeDaysCount || 0}`,
      `${m.streakDays || 0}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Month', 'Avg Score', 'Study Hrs', 'Habit Ful.', 'Topic Ful.', 'Active Days', 'Streak']],
      body: rows.length ? rows : [['No monthly data yet.', '', '', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  // ---------------------------------------------------------------------
  // SECTION: Weekly Analysis
  // ---------------------------------------------------------------------
  {
    let y = addSectionHeading('Weekly Analysis');
    const w = data.weeklyAnalytics || {};
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text(`Week: ${w.weekKey || '—'}`, MARGIN, y);
    y += 8;

    const weeklyStats: [string, string][] = [
      ['Weekly Score', `${Math.round(w.weeklyScore || 0)}%`],
      ['Total Hours Logged', `${Math.round(w.totalHours || 0)} hrs`],
      ['Habits Completed', `${w.completedHabitsCount || 0}`],
      ['Topics Completed', `${w.completedTopicsCount || 0}`],
    ];

    autoTable(doc, {
      startY: y,
      body: weeklyStats,
      theme: 'plain',
      bodyStyles: { fontSize: 9, textColor: SLATE_DARK, fontStyle: 'bold' },
      columnStyles: { 0: { textColor: SLATE_MED, fontStyle: 'normal' } },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ---------------------------------------------------------------------
  // SECTION: Consistency Score — Per Subject & Category (this month)
  // ---------------------------------------------------------------------
  {
    let y = addSectionHeading(`Consistency Score — ${data.consistencyMonthly?.monthName || 'This Month'}`);
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text(`Overall this month: ${Math.round(data.consistencyMonthly?.overallScore || 0)}% (${data.consistencyMonthly?.grade || '—'})`, MARGIN, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_DARK);
    doc.text('By Subject', MARGIN, y);
    y += 4;

    const subjRows = (data.consistencyMonthly?.subjects || []).map((s: any) => [
      s.subject || '—',
      s.category || '—',
      `${s.revisionsDone || 0}/${s.revisionsDue || 0}`,
      `${s.revisionsMissed || 0}`,
      `${s.score}%`,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Subject', 'Category', 'Done/Due', 'Missed', 'Score']],
      body: subjRows.length ? subjRows : [['No syllabus/revision activity yet.', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    y = ensureSpace(y, 40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_DARK);
    doc.text('By Category', MARGIN, y);
    y += 4;

    const catRows = (data.consistencyMonthly?.categories || []).map((c: any) => [
      c.category || '—',
      `${c.revisionsDone || 0}/${c.revisionsDue || 0}`,
      `${c.revisionsMissed || 0}`,
      `${c.score}%`,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Done/Due', 'Missed', 'Score']],
      body: catRows.length ? catRows : [['No category activity yet.', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  // ---------------------------------------------------------------------
  // SECTION: Mock Test Performance
  // ---------------------------------------------------------------------
  if ((data.testLogs || []).length) {
    let y = addSectionHeading('Mock Test Performance');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MED);
    doc.setFont('helvetica', 'normal');
    doc.text('Every logged mock/test attempt, most recent first.', MARGIN, y);
    y += 6;

    const rows = data.testLogs.map((t: any) => [
      t.testName || '—',
      t.date || '—',
      t.subject || '—',
      `${t.score}/${t.maxScore}`,
      `${Math.round(t.percent || 0)}%`,
      t.accuracy || '—',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Test', 'Date', 'Subject', 'Score', '%', 'Accuracy']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: SLATE_DARK, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: SLATE_DARK },
      alternateRowStyles: { fillColor: LIGHT_BG },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  // ---------------------------------------------------------------------
  // Fill in the Table of Contents page now that we know real page numbers
  // ---------------------------------------------------------------------
  doc.setPage(tocPageIndex);
  let ty = 34;
  doc.setFont('helvetica', 'normal');
  toc.forEach((entry) => {
    doc.setFontSize(11);
    doc.setTextColor(...SLATE_DARK);
    doc.textWithLink(entry.title, MARGIN, ty, { pageNumber: entry.page });
    doc.setTextColor(...SLATE_MED);
    doc.text(String(entry.page), PAGE_W - MARGIN - 6, ty);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, ty + 2, PAGE_W - MARGIN, ty + 2);
    ty += 10;
  });

  // ---------------------------------------------------------------------
  // Footer (page numbers) on every content page
  // ---------------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_MED);
    doc.text(`UPSC Tracker Report — ${displayName}`, MARGIN, 291);
    doc.text(`Page ${p - 1} of ${totalPages - 1}`, PAGE_W - MARGIN - 20, 291);
  }

  const fileDate = new Date().toISOString().split('T')[0];
  doc.save(`upsc_tracker_report_${fileDate}.pdf`);
}
