import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import DailyLog from '@/models/DailyLog';
import SyllabusItem from '@/models/SyllabusItem';
import TopicRevision from '@/models/TopicRevision';
import HabitItem from '@/models/HabitItem';
import { processTopicTag, addDaysStr } from '@/lib/topicRevisionEngine';
import { format } from 'date-fns';

async function getFormattedResponse(userId: any) {
  const dailyLogs = await DailyLog.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).sort({ date: -1 }).lean();
  const syllabus = await SyllabusItem.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();
  const topicRevisions = await TopicRevision.find({ $or: [{ userId }, { userId: '000000000000000000000000' }] }).lean();

  const formattedDailyLogs = dailyLogs.map((item: any) => {
    let resolvedTags: any[] = [];
    if (item.topicRevisionIds && Array.isArray(item.topicRevisionIds) && item.topicRevisionIds.length > 0) {
      resolvedTags = item.topicRevisionIds
        .map((trId: any) => {
          const strId = trId.toString();
          const tr = topicRevisions.find((t: any) => t._id.toString() === strId || t.customId === strId);
          if (tr) {
            return {
              id: tr._id.toString(),
              subject: tr.subject,
              category: tr.category,
              topic: tr.topic,
              isRevision: tr.firstReadDate !== item.date
            };
          }
          return null;
        })
        .filter(Boolean);
    }
    if (resolvedTags.length === 0 && item.subjectTags && Array.isArray(item.subjectTags)) {
      resolvedTags = item.subjectTags;
    }

    return {
      id: item._id.toString(),
      date: item.date,
      isOff: item.isOff,
      total: item.total,
      gs: item.gs,
      maths: item.maths,
      ca: item.ca,
      ans: item.ans,
      newH: item.newH,
      revH: item.revH,
      caDone: item.caDone,
      ansCount: item.ansCount,
      focus: item.focus,
      weakest: item.weakest,
      topicsRead: item.topicsRead || '',
      selectedSubject: item.selectedSubject || '',
      topicRevisionIds: (item.topicRevisionIds || []).map((id: any) => id.toString()),
      subjectTags: resolvedTags
    };
  });

  const formattedSyllabus = syllabus.map((item: any) => ({
    id: item.customId || item._id.toString(),
    subject: item.subject,
    category: item.category,
    status: item.status || 'Not Started',
    source: item.source || '',
    date: item.date || '',
    nextRev: item.nextRev || '',
    firstRead: !!item.firstRead,
    rev1: !!item.rev1,
    rev2: !!item.rev2,
    preNotes: !!item.preNotes,
    mainsNotes: !!item.mainsNotes,
    questionBank: !!item.questionBank,
    prePyq: !!item.prePyq,
    mainsPyq: !!item.mainsPyq,
    ansWriting: !!item.ansWriting,
    preFinalRev: !!item.preFinalRev,
    mainsFinalRev: !!item.mainsFinalRev
  }));

  const formattedTopicRevisions = topicRevisions.map((t: any) => ({
    id: t.customId || t._id.toString(),
    subject: t.subject,
    category: t.category,
    topic: t.topic,
    firstReadDate: t.firstReadDate,
    lastRevisedDate: t.lastRevisedDate,
    status: t.status,
    r1ScheduledDate: t.r1ScheduledDate,
    r1CompletedDate: t.r1CompletedDate,
    r1Status: t.r1Status,
    r2ScheduledDate: t.r2ScheduledDate,
    r2CompletedDate: t.r2CompletedDate,
    r2Status: t.r2Status,
    r3ScheduledDate: t.r3ScheduledDate,
    r3CompletedDate: t.r3CompletedDate,
    r3Status: t.r3Status,
    isOverdue: t.isOverdue,
    overdueDays: t.overdueDays,
    nextScheduledDate: t.nextScheduledDate,
    subTopics: t.subTopics || [],
    extraRevisions: (t.extraRevisions || []).map((er: any) => ({
      date: er.date || '',
      note: er.note || '',
      clusterTitle: er.clusterTitle || '',
      subTopics: er.subTopics || []
    })),
    revisionLogs: (t.revisionLogs || []).map((rl: any) => ({
      date: rl.date || '',
      stage: rl.stage || '',
      note: rl.note || '',
      clusterTitle: rl.clusterTitle || '',
      subTopics: rl.subTopics || []
    }))
  }));

  return NextResponse.json({
    success: true,
    dailyLogs: formattedDailyLogs,
    syllabusList: formattedSyllabus,
    topicRevisions: formattedTopicRevisions
  });
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    const userId = user?.userId || '000000000000000000000000';

    await connectToDatabase();
    const entry = await req.json();

    if (entry.action === 'batchLogCluster') {
      const { subject, category, clusterTitle, topicNames, date } = entry;
      const logDate = date || format(new Date(), 'yyyy-MM-dd');
      const cat = category || 'GS1';

      if (Array.isArray(topicNames) && topicNames.length > 0) {
        // 1. Process revision for every selected child topic
        for (const topicName of topicNames) {
          let microDoc = await TopicRevision.findOne({ userId, subject, topic: topicName });
          if (microDoc) {
            microDoc.subTopics = [];
            microDoc.isCluster = false;
            await microDoc.save();
          }
          await processTopicTag(
            userId,
            {
              subject,
              category: cat,
              topic: topicName,
              isRevision: true
            },
            logDate
          );
        }

        // 2. Log Cluster Block topic entry if clusterTitle is provided (without scheduling future revision dates)
        if (clusterTitle && clusterTitle.trim()) {
          const clusterName = clusterTitle.trim();
          let clusterDoc = await TopicRevision.findOne({ userId, subject, topic: clusterName });
          if (!clusterDoc) {
            const customId = `${userId}_${subject}_${clusterName}`.toLowerCase().replace(/\s+/g, '_');
            await TopicRevision.create({
              userId,
              customId,
              subject,
              category: cat,
              topic: clusterName,
              isCluster: true,
              subTopics: topicNames,
              firstReadDate: logDate,
              lastRevisedDate: logDate,
              r1ScheduledDate: '',
              r1CompletedDate: logDate,
              r1Status: 'Completed',
              r2ScheduledDate: '',
              r2CompletedDate: '',
              r2Status: 'Pending',
              r3ScheduledDate: '',
              r3CompletedDate: '',
              r3Status: 'Pending',
              isOverdue: false,
              overdueDays: 0,
              nextScheduledDate: '',
              extraRevisions: [],
              revisionLogs: [{ date: logDate, stage: 'Cluster Creation', note: `Cluster Block containing: ${topicNames.join(', ')}` }]
            });
          } else {
            clusterDoc.isCluster = true;
            clusterDoc.subTopics = topicNames;
            clusterDoc.lastRevisedDate = logDate;
            clusterDoc.nextScheduledDate = '';
            clusterDoc.isOverdue = false;
            await clusterDoc.save();
          }
        }



        // 3. Append to Today's Daily Log (topicsRead and subjectTags)
        let dailyLog = await DailyLog.findOne({ userId, date: logDate });
        if (!dailyLog) {
          dailyLog = new DailyLog({
            userId,
            date: logDate,
            total: 0,
            topicsRead: '',
            subjectTags: []
          });
        }

        const readEntryStr = clusterTitle && clusterTitle.trim()
          ? `${subject}: ${clusterTitle.trim()} [${topicNames.join(', ')}]`
          : `${subject}: ${topicNames.join(', ')}`;

        const existingText = dailyLog.topicsRead || '';
        dailyLog.topicsRead = existingText
          ? `${existingText}; ${readEntryStr}`
          : readEntryStr;

        const newTags = dailyLog.subjectTags || [];
        if (clusterTitle && clusterTitle.trim()) {
          newTags.push({
            subject,
            category: cat,
            topic: clusterTitle.trim(),
            isRevision: true,
            clusterTitle: clusterTitle.trim(),
            subTopics: topicNames
          });
        }
        for (const tn of topicNames) {
          newTags.push({
            subject,
            category: cat,
            topic: tn,
            isRevision: true,
            clusterTitle: clusterTitle?.trim() || '',
            subTopics: topicNames
          });
        }
        dailyLog.subjectTags = newTags;
        await dailyLog.save();
      }

      return getFormattedResponse(userId);
    }

    if (entry.action === 'addTopicRevision') {
      const { subject, category, topic, isRevision, firstReadDate } = entry;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      if (subject && topic) {
        await processTopicTag(
          userId,
          { subject, category: category || 'GS1', topic, isRevision: !!isRevision },
          firstReadDate || todayStr
        );
      }

      return getFormattedResponse(userId);
    }

    if (entry.action === 'skipRevision') {
      const { topicId, note } = entry;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      let topic = null;
      if (topicId && topicId.match(/^[0-9a-fA-F]{24}$/)) {
        topic = await TopicRevision.findOne({ _id: topicId });
      }
      if (!topic && topicId) {
        topic = await TopicRevision.findOne({ customId: topicId });
      }
      if (topic) {
        let stageSkipped = 'R1';
        if (!topic.r1CompletedDate || topic.r1Status !== 'Completed') {
          topic.r1Status = 'Skipped';
          topic.r1CompletedDate = '';
          topic.r2ScheduledDate = topic.r2ScheduledDate || addDaysStr(todayStr, 14);
          topic.r2Status = 'Pending';
          topic.nextScheduledDate = topic.r2ScheduledDate;
          stageSkipped = 'R1';
        } else if (!topic.r2CompletedDate || topic.r2Status !== 'Completed') {
          topic.r2Status = 'Skipped';
          topic.r2CompletedDate = '';
          topic.r3ScheduledDate = topic.r3ScheduledDate || addDaysStr(todayStr, 24);
          topic.r3Status = 'Pending';
          topic.nextScheduledDate = topic.r3ScheduledDate;
          stageSkipped = 'R2';
        } else if (!topic.r3CompletedDate || topic.r3Status !== 'Completed') {
          topic.r3Status = 'Skipped';
          topic.r3CompletedDate = '';
          topic.nextScheduledDate = '';
          stageSkipped = 'R3';
        }

        topic.isOverdue = false;
        topic.overdueDays = 0;

        if (!topic.revisionLogs) topic.revisionLogs = [];
        topic.revisionLogs.push({
          date: todayStr,
          stage: `Skipped (${stageSkipped})`,
          note: note && note.trim() ? note.trim() : 'Skipped Overdue Revision',
          clusterTitle: '',
          subTopics: []
        });

        await topic.save();

        // Also add log entry to DailyLog
        let dailyLog = await DailyLog.findOne({ userId, date: todayStr });
        if (!dailyLog) {
          dailyLog = new DailyLog({
            userId,
            date: todayStr,
            total: 0,
            topicsRead: '',
            subjectTags: [],
            completedRevisions: []
          });
        }

        // Remove from completedRevisions if present so it doesn't falsely report as completed today
        if (dailyLog.completedRevisions && dailyLog.completedRevisions.length > 0) {
          dailyLog.completedRevisions = dailyLog.completedRevisions.filter(
            (idStr: string) => idStr !== (topic.customId || topic._id.toString()) && idStr !== topic._id.toString()
          );
        }

        // Remove from subjectTags if present so it doesn't falsely report in Daily Log modal
        if (dailyLog.subjectTags && dailyLog.subjectTags.length > 0) {
          dailyLog.subjectTags = dailyLog.subjectTags.filter(
            (t: any) => !(t.subject?.toLowerCase() === topic.subject?.toLowerCase() && t.topic?.toLowerCase() === topic.topic?.toLowerCase())
          );
        }
        await dailyLog.save();
      }

      return getFormattedResponse(userId);
    }

    if (entry.action === 'logExtraRevision') {
      const { topicId, date, note } = entry;
      const logDate = date || format(new Date(), 'yyyy-MM-dd');
      let topic = null;
      if (topicId && topicId.match(/^[0-9a-fA-F]{24}$/)) {
        topic = await TopicRevision.findOne({ _id: topicId });
      }
      if (!topic && topicId) {
        topic = await TopicRevision.findOne({ customId: topicId });
      }
      if (topic) {
        await processTopicTag(
          userId,
          {
            subject: topic.subject,
            category: topic.category,
            topic: topic.topic,
            isRevision: true,
            note: note ? note.trim() : ''
          },
          logDate
        );

        // Also sync into DailyLog for the specified logDate!
        let dailyLog = await DailyLog.findOne({ userId, date: logDate });
        if (!dailyLog) {
          dailyLog = new DailyLog({
            userId,
            date: logDate,
            total: 0,
            topicsRead: '',
            subjectTags: []
          });
        }

        const readEntryStr = note && note.trim()
          ? `${topic.subject}: ${topic.topic} (${note.trim()})`
          : `${topic.subject}: ${topic.topic}`;

        const existingText = dailyLog.topicsRead || '';
        dailyLog.topicsRead = existingText
          ? `${existingText}; ${readEntryStr}`
          : readEntryStr;

        const newTags = dailyLog.subjectTags || [];
        newTags.push({
          subject: topic.subject,
          category: topic.category || 'GS1',
          topic: topic.topic,
          isRevision: true,
          note: note ? note.trim() : ''
        });
        dailyLog.subjectTags = newTags;
        await dailyLog.save();
      }

      return getFormattedResponse(userId);
    }

    if (entry.action === 'resetOverdue') {
      const { topicId } = entry;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      let topic = null;
      if (topicId && topicId.match(/^[0-9a-fA-F]{24}$/)) {
        topic = await TopicRevision.findOne({ _id: topicId });
      }
      if (!topic && topicId) {
        topic = await TopicRevision.findOne({ customId: topicId });
      }
      if (topic) {
        topic.isOverdue = false;
        topic.overdueDays = 0;
        topic.nextScheduledDate = todayStr;
        if (!topic.r1CompletedDate) topic.r1ScheduledDate = todayStr;
        else if (!topic.r2CompletedDate) topic.r2ScheduledDate = todayStr;
        else if (!topic.r3CompletedDate) topic.r3ScheduledDate = todayStr;
        await topic.save();
      }

      return getFormattedResponse(userId);
    }

    if (entry.action === 'deleteTopic') {
      let { topicId, subject, topic: topicName } = entry;

      if (topicId) {
        let deleted: any = null;
        if (typeof topicId === 'string' && topicId.match(/^[0-9a-fA-F]{24}$/)) {
          deleted = await TopicRevision.findOneAndDelete({ _id: topicId });
        }
        if (!deleted && topicId) {
          deleted = await TopicRevision.findOneAndDelete({ customId: topicId });
        }
        if (deleted && (!subject || !topicName)) {
          subject = deleted.subject;
          topicName = deleted.topic;
        }
      }

      const pullConditions: any[] = [];
      if (topicId) {
        pullConditions.push({ topicRevisionId: topicId });
      }
      if (subject && topicName) {
        const safeSubj = subject.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const safeTopic = topicName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        await TopicRevision.deleteMany({
          $or: [{ userId }, { userId: '000000000000000000000000' }],
          subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') },
          topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') }
        });

        await HabitItem.deleteMany({
          $or: [{ userId }, { userId: '000000000000000000000000' }],
          subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') },
          topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') }
        });

        pullConditions.push({
          subject: { $regex: new RegExp(`^${safeSubj}$`, 'i') },
          topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') }
        });
      } else if (topicName) {
        const safeTopic = topicName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        pullConditions.push({
          topic: { $regex: new RegExp(`^${safeTopic}$`, 'i') }
        });
      }

      if (topicId) {
        const isValidOid = mongoose.Types.ObjectId.isValid(topicId);
        const pullObjectIds: any[] = [];

        if (isValidOid) {
          pullObjectIds.push(new mongoose.Types.ObjectId(topicId));
        }

        const foundTopic = await TopicRevision.findOne({
          $or: [
            ...(isValidOid ? [{ _id: topicId }] : []),
            { customId: topicId }
          ]
        });

        if (foundTopic) {
          pullObjectIds.push(foundTopic._id);
        }

        if (pullObjectIds.length > 0) {
          await DailyLog.updateMany(
            { $or: [{ userId }, { userId: '000000000000000000000000' }] },
            { $pull: { topicRevisionIds: { $in: pullObjectIds } } }
          );
          await SyllabusItem.updateMany(
            { $or: [{ userId }, { userId: '000000000000000000000000' }] },
            { $pull: { topicRevisionIds: { $in: pullObjectIds } } }
          );
        }
      }

      if (pullConditions.length > 0) {
        await DailyLog.updateMany(
          { $or: [{ userId }, { userId: '000000000000000000000000' }] },
          { $pull: { subjectTags: { $or: pullConditions } } }
        );
      }

      return getFormattedResponse(userId);
    }

    // Standard Daily Log Save / Update
    const {
      date,
      isOff,
      total,
      gs,
      maths,
      ca,
      ans,
      newH,
      revH,
      caDone,
      ansCount,
      focus,
      weakest,
      topicsRead,
      selectedSubject,
      subjectTags,
      completedRevisions
    } = entry;

    const today = date || new Date().toISOString().split('T')[0];
    const processedSubjectTags: any[] = [];

    // Process every topic tag through TopicRevision engine and attach topicRevisionId reference
    if (subjectTags && Array.isArray(subjectTags) && subjectTags.length > 0) {
      for (const tag of subjectTags) {
        if (tag.subject && tag.topic) {
          const revDoc = await processTopicTag(userId, tag, date || today);
          processedSubjectTags.push({
            ...tag,
            topicRevisionId: revDoc?._id || tag.topicRevisionId
          });
        } else {
          processedSubjectTags.push(tag);
        }
      }
    }

    await DailyLog.findOneAndUpdate(
      { userId, date: today },
      {
        userId,
        date: today,
        isOff: !!isOff,
        total: total || 0,
        gs: gs || 0,
        maths: maths || 0,
        ca: ca || 0,
        ans: ans || 0,
        newH: newH || 0,
        revH: revH || 0,
        caDone: caDone || 'NO',
        ansCount: ansCount || 0,
        focus: focus || 3,
        weakest: weakest || '',
        topicsRead: topicsRead || '',
        selectedSubject: selectedSubject || '',
        subjectTags: processedSubjectTags,
        completedRevisions: completedRevisions || []
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Process completedRevisions checkmarks
    if (completedRevisions && Array.isArray(completedRevisions) && completedRevisions.length > 0) {
      for (const subjId of completedRevisions) {
        let item = await SyllabusItem.findOne({ userId, customId: subjId });
        if (!item && subjId.match(/^[0-9a-fA-F]{24}$/)) {
          item = await SyllabusItem.findOne({ userId, _id: subjId });
        }
        if (item) {
          const parts = item.subject.split(': ');
          const subjName = parts[0];
          const topicName = parts.slice(1).join(': ') || parts[0];
          await processTopicTag(
            userId,
            { subject: subjName, category: item.category, topic: topicName, isRevision: true },
            date || today
          );
        }
      }
    }

    return getFormattedResponse(userId);
  } catch (error: any) {
    console.error('Daily log save error:', error);
    return NextResponse.json({ error: 'Failed to save daily log' }, { status: 500 });
  }
}
