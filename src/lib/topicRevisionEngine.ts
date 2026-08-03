import prisma from '@/lib/prisma';
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
  userId: string,
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

  const isAugmentedRevision = !!tag.isAugmentedRevision;

  // Find existing TopicRevision document using Prisma
  let doc = await prisma.topicRevision.findFirst({
    where: {
      userId,
      subject: { equals: subjName, mode: 'insensitive' },
      topic: { equals: topicName, mode: 'insensitive' },
    },
  });

  if (!doc) {
    const customId = 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    if (isAugmentedRevision) {
      if (!tag.isRevision) {
        const r1Sched = addDaysStr(logDate, 7);
        const r2Sched = addDaysStr(logDate, 21);
        const r3Sched = addDaysStr(logDate, 45);
        const overdueInfo = calcOverdueStatus(r1Sched, logDate);

        const revisions = [
          { stage: 'First Read', scheduledDate: logDate, completedDate: logDate, status: 'Completed', note: tag.note || 'Initial Study Read' },
          { stage: 'R1', scheduledDate: r1Sched, completedDate: '', status: 'Pending', note: '' },
          { stage: 'R2', scheduledDate: r2Sched, completedDate: '', status: 'Pending', note: '' },
          { stage: 'R3', scheduledDate: r3Sched, completedDate: '', status: 'Pending', note: '' },
        ];

        doc = await prisma.topicRevision.create({
          data: {
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
            revisions,
          },
        });
      } else {
        const r1Sched = addDaysStr(logDate, -7);
        const r2Sched = addDaysStr(logDate, 21);
        const r3Sched = addDaysStr(logDate, 45);

        const revisions = [
          { stage: 'First Read', scheduledDate: logDate, completedDate: logDate, status: 'Completed', note: 'Initial Read' },
          { stage: 'R1', scheduledDate: r1Sched, completedDate: logDate, status: 'Completed', note: tag.note || 'Direct Revision Logged' },
          { stage: 'R2', scheduledDate: r2Sched, completedDate: '', status: 'Pending', note: '' },
          { stage: 'R3', scheduledDate: r3Sched, completedDate: '', status: 'Pending', note: '' },
        ];

        doc = await prisma.topicRevision.create({
          data: {
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
            revisions,
          },
        });
      }
    } else {
      doc = await prisma.topicRevision.create({
        data: {
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
          revisions: [],
        },
      });
    }
  } else {
    // Existing record - update revisions
    const revisions: any[] = Array.isArray(doc.revisions) ? [...(doc.revisions as any[])] : [];
    let lastRevisedDate = doc.lastRevisedDate;
    let nextScheduledDate = doc.nextScheduledDate;
    let isOverdue = doc.isOverdue;
    let overdueDays = doc.overdueDays;

    if (isAugmentedRevision && tag.isRevision) {
      lastRevisedDate = logDate;
      const baseDate = doc.firstReadDate || logDate;

      let r1 = revisions.find((r: any) => r.stage === 'R1');
      let r2 = revisions.find((r: any) => r.stage === 'R2');
      let r3 = revisions.find((r: any) => r.stage === 'R3');

      if (!r1) {
        r1 = { stage: 'R1', scheduledDate: addDaysStr(baseDate, 7), completedDate: '', status: 'Pending', note: '' };
        revisions.push(r1);
      }

      if (!r1.completedDate || r1.status !== 'Completed') {
        r1.completedDate = logDate;
        r1.status = 'Completed';
        if (!r2) {
          r2 = { stage: 'R2', scheduledDate: addDaysStr(baseDate, 21), completedDate: '', status: 'Pending', note: '' };
          revisions.push(r2);
        }
        nextScheduledDate = r2.scheduledDate;
      } else if (!r2 || !r2.completedDate || r2.status !== 'Completed') {
        if (!r2) {
          r2 = { stage: 'R2', scheduledDate: addDaysStr(baseDate, 21), completedDate: '', status: 'Pending', note: '' };
          revisions.push(r2);
        }
        r2.completedDate = logDate;
        r2.status = 'Completed';
        if (!r3) {
          r3 = { stage: 'R3', scheduledDate: addDaysStr(baseDate, 45), completedDate: '', status: 'Pending', note: '' };
          revisions.push(r3);
        }
        nextScheduledDate = r3.scheduledDate;
      } else if (!r3 || !r3.completedDate || r3.status !== 'Completed') {
        if (!r3) {
          r3 = { stage: 'R3', scheduledDate: addDaysStr(baseDate, 45), completedDate: '', status: 'Pending', note: '' };
          revisions.push(r3);
        }
        r3.completedDate = logDate;
        r3.status = 'Completed';
        isOverdue = false;
        overdueDays = 0;
        nextScheduledDate = '';
      }
    } else {
      if (isAugmentedRevision) {
        let r1 = revisions.find((r: any) => r.stage === 'R1');
        if (!r1) {
          const r1Sched = addDaysStr(logDate, 7);
          r1 = { stage: 'R1', scheduledDate: r1Sched, completedDate: '', status: 'Pending', note: '' };
          revisions.push(r1);
          nextScheduledDate = r1Sched;
        }
      }
    }

    if (isAugmentedRevision && nextScheduledDate) {
      const overdueInfo = calcOverdueStatus(nextScheduledDate, logDate);
      isOverdue = overdueInfo.isOverdue;
      overdueDays = overdueInfo.overdueDays;
    } else {
      isOverdue = false;
      overdueDays = 0;
    }

    doc = await prisma.topicRevision.update({
      where: { id: doc.id },
      data: {
        lastRevisedDate,
        nextScheduledDate,
        isOverdue,
        overdueDays,
        revisions,
      },
    });
  }

  // Update master SyllabusItem if exists
  const sysItem = await prisma.syllabusItem.findFirst({
    where: {
      userId,
      subject: { equals: subjName, mode: 'insensitive' },
    },
  });

  if (sysItem) {
    const existingTopicRevIds: string[] = Array.isArray(sysItem.topicRevisionIds) ? (sysItem.topicRevisionIds as string[]) : [];
    const updatedTopicRevIds = existingTopicRevIds.includes(doc.id) ? existingTopicRevIds : [...existingTopicRevIds, doc.id];

    await prisma.syllabusItem.update({
      where: { id: sysItem.id },
      data: {
        date: logDate,
        nextRev: isAugmentedRevision ? doc.nextScheduledDate : sysItem.nextRev,
        topicRevisionIds: updatedTopicRevIds,
      },
    });
  }

  return doc;
}
