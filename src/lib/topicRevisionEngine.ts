import SyllabusItem from '@/models/SyllabusItem';
import TopicRevision from '@/models/TopicRevision';
import { addDays, parseISO, format, differenceInCalendarDays, isValid } from 'date-fns';

export function addDaysStr(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    const fallback = new Date(dateStr);
    if (!isValid(fallback)) return '';
    return format(addDays(fallback, days), 'yyyy-MM-dd');
  }
  return format(addDays(parsed, days), 'yyyy-MM-dd');
}

export function calcOverdueStatus(scheduledDate: string, currentDate: string) {
  if (!scheduledDate || !currentDate) return { isOverdue: false, overdueDays: 0 };
  const schedParsed = parseISO(scheduledDate);
  const currParsed = parseISO(currentDate);
  if (!isValid(schedParsed) || !isValid(currParsed)) return { isOverdue: false, overdueDays: 0 };

  const diffDays = differenceInCalendarDays(currParsed, schedParsed);
  if (diffDays > 0) {
    return { isOverdue: true, overdueDays: diffDays };
  }
  return { isOverdue: false, overdueDays: 0 };
}

export async function processTopicTag(
  userId: any,
  tag: {
    subject: string;
    category?: string;
    topic: string;
    isRevision?: boolean;
    clusterTitle?: string;
    subTopics?: string[];
    note?: string;
  },
  logDate: string
) {
  if (!tag.topic || !tag.topic.trim()) return null;

  const subjName = tag.subject ? tag.subject.trim() : 'General Studies';
  const topicName = tag.topic.trim();
  const catName = tag.category || 'GS1';

  // Guard: CSAT and Maths categories/subjects are practice-based — exempt from SRS TopicRevision tracking
  const isExcluded = /csat|maths|mathematics|math/i.test(subjName) || /csat|maths|mathematics|math/i.test(catName);
  if (isExcluded) return null;

  // Find existing TopicRevision document
  let doc = await TopicRevision.findOne({
    userId,
    subject: subjName,
    topic: topicName
  });

  if (!doc) {
    const customId = 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    if (!tag.isRevision) {
      // First Read: set R1 (+7d), R2 (+21d), R3 (+45d) scheduled dates
      const r1Sched = addDaysStr(logDate, 7);
      const r2Sched = addDaysStr(logDate, 21);
      const r3Sched = addDaysStr(logDate, 45);
      const overdueInfo = calcOverdueStatus(r1Sched, logDate);
      doc = await TopicRevision.create({
        userId,
        customId,
        subject: subjName,
        category: catName,
        topic: topicName,
        firstReadDate: logDate,
        lastRevisedDate: '',
        r1ScheduledDate: r1Sched,
        r1CompletedDate: '',
        r1Status: 'Pending',
        r2ScheduledDate: r2Sched,
        r2CompletedDate: '',
        r2Status: 'Pending',
        r3ScheduledDate: r3Sched,
        r3CompletedDate: '',
        r3Status: 'Pending',
        isOverdue: overdueInfo.isOverdue,
        overdueDays: overdueInfo.overdueDays,
        nextScheduledDate: r1Sched,
        subTopics: tag.subTopics || [],
        extraRevisions: [],
        revisionLogs: [
          {
            date: logDate,
            stage: 'First Read',
            note: tag.note || 'Initial Study Read',
            clusterTitle: tag.clusterTitle || '',
            subTopics: tag.subTopics || []
          }
        ]
      });
    } else {
      // Direct Revision Tagged
      const r1Sched = addDaysStr(logDate, -7);
      const r2Sched = addDaysStr(logDate, 21);
      const r3Sched = addDaysStr(logDate, 45);
      doc = await TopicRevision.create({
        userId,
        customId,
        subject: subjName,
        category: catName,
        topic: topicName,
        firstReadDate: logDate,
        lastRevisedDate: logDate,
        r1ScheduledDate: r1Sched,
        r1CompletedDate: logDate,
        r1Status: 'Completed',
        r2ScheduledDate: r2Sched,
        r2CompletedDate: '',
        r2Status: 'Pending',
        r3ScheduledDate: r3Sched,
        r3CompletedDate: '',
        r3Status: 'Pending',
        isOverdue: false,
        overdueDays: 0,
        nextScheduledDate: r2Sched,
        subTopics: tag.subTopics || [],
        extraRevisions: [],
        revisionLogs: [
          {
            date: logDate,
            stage: 'R1',
            note: tag.note || 'Direct Revision Logged',
            clusterTitle: tag.clusterTitle || '',
            subTopics: tag.subTopics || []
          }
        ]
      });
    }
  } else {
    // Document exists - update based on action
    if (!doc.revisionLogs) doc.revisionLogs = [];
    if (!doc.extraRevisions) doc.extraRevisions = [];

    if (tag.subTopics && tag.subTopics.length > 0) {
      doc.subTopics = Array.from(new Set([...(doc.subTopics || []), ...tag.subTopics]));
    }

    if (tag.isRevision) {
      doc.lastRevisedDate = logDate;
      const baseDate = doc.firstReadDate || logDate;
      let stageLogged = 'Extra';

      if (!doc.r1CompletedDate || doc.r1Status !== 'Completed') {
        doc.r1CompletedDate = logDate;
        doc.r1Status = 'Completed';
        doc.r2ScheduledDate = doc.r2ScheduledDate || addDaysStr(baseDate, 21);
        doc.r2Status = 'Pending';
        doc.nextScheduledDate = doc.r2ScheduledDate;
        stageLogged = 'R1';
      } else if (!doc.r2CompletedDate || doc.r2Status !== 'Completed') {
        doc.r2CompletedDate = logDate;
        doc.r2Status = 'Completed';
        doc.r3ScheduledDate = doc.r3ScheduledDate || addDaysStr(baseDate, 45);
        doc.r3Status = 'Pending';
        doc.nextScheduledDate = doc.r3ScheduledDate;
        stageLogged = 'R2';
      } else if (!doc.r3CompletedDate || doc.r3Status !== 'Completed') {
        doc.r3CompletedDate = logDate;
        doc.r3Status = 'Completed';
        doc.isOverdue = false;
        doc.overdueDays = 0;
        doc.nextScheduledDate = '';
        stageLogged = 'R3';
      } else {
        // Max 3 revisions reached. Do not create extra revision logs.
        stageLogged = 'Mastered';
        doc.isOverdue = false;
        doc.overdueDays = 0;
        doc.nextScheduledDate = '';
      }

      doc.revisionLogs.push({
        date: logDate,
        stage: stageLogged,
        note: tag.note || '',
        clusterTitle: tag.clusterTitle || '',
        subTopics: tag.subTopics || []
      });
    } else {
      if (!doc.firstReadDate) doc.firstReadDate = logDate;
      if (!doc.r1ScheduledDate) {
        doc.r1ScheduledDate = addDaysStr(logDate, 7);
        doc.r1Status = 'Pending';
        doc.nextScheduledDate = doc.r1ScheduledDate;
      }
    }

    if (doc.nextScheduledDate) {
      const overdueInfo = calcOverdueStatus(doc.nextScheduledDate, logDate);
      doc.isOverdue = overdueInfo.isOverdue;
      doc.overdueDays = overdueInfo.overdueDays;
    } else {
      doc.isOverdue = false;
      doc.overdueDays = 0;
    }

    await doc.save();
  }

  // Update existing SyllabusItem only if it already exists as a master subject
  let sysItem = await SyllabusItem.findOne({ userId, subject: subjName });
  if (sysItem) {
    sysItem.date = logDate;
    sysItem.nextRev = doc.nextScheduledDate;
    if (doc && doc._id) {
      if (!sysItem.topicRevisionIds) sysItem.topicRevisionIds = [];
      const idStr = doc._id.toString();
      if (!sysItem.topicRevisionIds.some((id: any) => id.toString() === idStr)) {
        sysItem.topicRevisionIds.push(doc._id.toString());
      }
    }
    await sysItem.save();
  }

  return doc;
}
