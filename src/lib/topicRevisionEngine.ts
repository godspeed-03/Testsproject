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
    isAugmentedRevision?: boolean;
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

  // Determine if this topic uses Augmented Revision (SRS) strictly based on frontend flag
  const isAugmentedRevision = !!tag.isAugmentedRevision;

  const safeSubj = subjName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const safeTop = topicName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Find existing TopicRevision document
  let doc = await TopicRevision.findOne({
    $or: [{ userId }, { userId: '000000000000000000000000' }],
    subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') },
    topic: { $regex: new RegExp(`^${safeTop}$`, 'i') }
  });

  if (!doc) {
    const customId = 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    if (isAugmentedRevision) {
      if (!tag.isRevision) {
        // First Read: set R1 (+7d), R2 (+21d), R3 (+45d) scheduled dates inside revisions array
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
          isAugmentedRevision: true,
          status: 'Pending',
          isOverdue: overdueInfo.isOverdue,
          overdueDays: overdueInfo.overdueDays,
          nextScheduledDate: r1Sched,
          revisions: [
            { stage: 'First Read', scheduledDate: logDate, completedDate: logDate, status: 'Completed', note: tag.note || 'Initial Study Read' },
            { stage: 'R1', scheduledDate: r1Sched, completedDate: '', status: 'Pending', note: '' },
            { stage: 'R2', scheduledDate: r2Sched, completedDate: '', status: 'Pending', note: '' },
            { stage: 'R3', scheduledDate: r3Sched, completedDate: '', status: 'Pending', note: '' }
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
          isAugmentedRevision: true,
          status: 'Completed',
          isOverdue: false,
          overdueDays: 0,
          nextScheduledDate: r2Sched,
          revisions: [
            { stage: 'First Read', scheduledDate: logDate, completedDate: logDate, status: 'Completed', note: 'Initial Read' },
            { stage: 'R1', scheduledDate: r1Sched, completedDate: logDate, status: 'Completed', note: tag.note || 'Direct Revision Logged' },
            { stage: 'R2', scheduledDate: r2Sched, completedDate: '', status: 'Pending', note: '' },
            { stage: 'R3', scheduledDate: r3Sched, completedDate: '', status: 'Pending', note: '' }
          ]
        });
      }
    } else {
      // Non-Augmented Topic (CSAT / MATHS / Not subject to revision) -> revisions array is EMPTY []
      doc = await TopicRevision.create({
        userId,
        customId,
        subject: subjName,
        category: catName,
        topic: topicName,
        firstReadDate: logDate,
        lastRevisedDate: logDate,
        isAugmentedRevision: false,
        status: 'Completed',
        isOverdue: false,
        overdueDays: 0,
        nextScheduledDate: '',
        revisions: [] // Empty array for topics not subject to revision!
      });
    }
  } else {
    // Document exists - update based on action
    if (!doc.revisions) doc.revisions = [];

    if (isAugmentedRevision && tag.isRevision) {
      doc.lastRevisedDate = logDate;
      const baseDate = doc.firstReadDate || logDate;

      let r1 = doc.revisions.find((r: any) => r.stage === 'R1');
      let r2 = doc.revisions.find((r: any) => r.stage === 'R2');
      let r3 = doc.revisions.find((r: any) => r.stage === 'R3');

      if (!r1) {
        r1 = { stage: 'R1', scheduledDate: addDaysStr(baseDate, 7), completedDate: '', status: 'Pending', note: '' };
        doc.revisions.push(r1);
      }

      if (!r1.completedDate || r1.status !== 'Completed') {
        r1.completedDate = logDate;
        r1.status = 'Completed';
        if (!r2) {
          r2 = { stage: 'R2', scheduledDate: addDaysStr(baseDate, 21), completedDate: '', status: 'Pending', note: '' };
          doc.revisions.push(r2);
        }
        doc.nextScheduledDate = r2.scheduledDate;
      } else if (!r2 || !r2.completedDate || r2.status !== 'Completed') {
        if (!r2) {
          r2 = { stage: 'R2', scheduledDate: addDaysStr(baseDate, 21), completedDate: '', status: 'Pending', note: '' };
          doc.revisions.push(r2);
        }
        r2.completedDate = logDate;
        r2.status = 'Completed';
        if (!r3) {
          r3 = { stage: 'R3', scheduledDate: addDaysStr(baseDate, 45), completedDate: '', status: 'Pending', note: '' };
          doc.revisions.push(r3);
        }
        doc.nextScheduledDate = r3.scheduledDate;
      } else if (!r3 || !r3.completedDate || r3.status !== 'Completed') {
        if (!r3) {
          r3 = { stage: 'R3', scheduledDate: addDaysStr(baseDate, 45), completedDate: '', status: 'Pending', note: '' };
          doc.revisions.push(r3);
        }
        r3.completedDate = logDate;
        r3.status = 'Completed';
        doc.isOverdue = false;
        doc.overdueDays = 0;
        doc.nextScheduledDate = '';
      }
    } else {
      if (!doc.firstReadDate) doc.firstReadDate = logDate;
      if (isAugmentedRevision) {
        let r1 = doc.revisions.find((r: any) => r.stage === 'R1');
        if (!r1) {
          const r1Sched = addDaysStr(logDate, 7);
          r1 = { stage: 'R1', scheduledDate: r1Sched, completedDate: '', status: 'Pending', note: '' };
          doc.revisions.push(r1);
          doc.nextScheduledDate = r1Sched;
        }
      }
    }

    if (isAugmentedRevision && doc.nextScheduledDate) {
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
  let sysItem = await SyllabusItem.findOne({
    $or: [{ userId }, { userId: '000000000000000000000000' }],
    subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') }
  });

  if (sysItem) {
    sysItem.date = logDate;
    if (isAugmentedRevision) {
      sysItem.nextRev = doc.nextScheduledDate;
    }
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
