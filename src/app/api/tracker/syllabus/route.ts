import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/auth';
import SyllabusItem from '@/models/SyllabusItem';

function addDaysStr(dateStr: string, days: number) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const {
      action,
      id,
      subject,
      category,
      status,
      source,
      date,
      nextRev,
      firstRead,
      rev1,
      rev2,
      preNotes,
      mainsNotes,
      questionBank,
      prePyq,
      mainsPyq,
      ansWriting,
      preFinalRev,
      mainsFinalRev
    } = body;

    const isMongoId = id && id.match(/^[0-9a-fA-F]{24}$/);
    const queryFilter = isMongoId
      ? { userId: user.userId, $or: [{ customId: id }, { _id: id }] }
      : { userId: user.userId, customId: id };

    if (action === 'delete') {
      await SyllabusItem.deleteOne(queryFilter);
    } else if (action === 'update' || action === 'advance' || action === 'toggle_milestone') {
      let item = await SyllabusItem.findOne(queryFilter);
      if (item) {
        const todayStr = new Date().toISOString().split('T')[0];
        item.subject = subject ?? item.subject;
        item.category = category ?? item.category;
        item.status = status ?? item.status;
        item.source = source ?? item.source;
        item.date = date ?? (item.date || todayStr);
        item.nextRev = nextRev ?? (item.nextRev || addDaysStr(item.date || todayStr, 7));
        item.firstRead = firstRead !== undefined ? !!firstRead : item.firstRead;
        item.rev1 = rev1 !== undefined ? !!rev1 : item.rev1;
        item.rev2 = rev2 !== undefined ? !!rev2 : item.rev2;
        item.preNotes = preNotes !== undefined ? !!preNotes : item.preNotes;
        item.mainsNotes = mainsNotes !== undefined ? !!mainsNotes : item.mainsNotes;
        item.questionBank = questionBank !== undefined ? !!questionBank : item.questionBank;
        item.prePyq = prePyq !== undefined ? !!prePyq : item.prePyq;
        item.mainsPyq = mainsPyq !== undefined ? !!mainsPyq : item.mainsPyq;
        item.ansWriting = ansWriting !== undefined ? !!ansWriting : item.ansWriting;
        item.preFinalRev = preFinalRev !== undefined ? !!preFinalRev : item.preFinalRev;
        item.mainsFinalRev = mainsFinalRev !== undefined ? !!mainsFinalRev : item.mainsFinalRev;
        await item.save();
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const initialDate = date || todayStr;
        const initialNextRev = nextRev || addDaysStr(initialDate, 7);
        await SyllabusItem.create({
          userId: user.userId,
          customId: id || 'subj_' + Date.now(),
          subject,
          category: category || 'GS1',
          status: status || 'First Read Done',
          source: source || '',
          date: initialDate,
          nextRev: initialNextRev,
          firstRead: firstRead !== undefined ? !!firstRead : true,
          rev1: !!rev1,
          rev2: !!rev2,
          preNotes: !!preNotes,
          mainsNotes: !!mainsNotes,
          questionBank: !!questionBank,
          prePyq: !!prePyq,
          mainsPyq: !!mainsPyq,
          ansWriting: !!ansWriting,
          preFinalRev: !!preFinalRev,
          mainsFinalRev: !!mainsFinalRev
        });
      }
    } else if (action === 'create') {
      const customId = 'subj_' + Date.now();
      const todayStr = new Date().toISOString().split('T')[0];
      const initialDate = date || todayStr;
      const initialNextRev = nextRev || addDaysStr(initialDate, 7);
      await SyllabusItem.create({
        userId: user.userId,
        customId,
        subject,
        category: category || 'GS1',
        status: status || 'First Read Done',
        source: source || '',
        date: initialDate,
        nextRev: initialNextRev,
        firstRead: firstRead !== undefined ? !!firstRead : true,
        rev1: !!rev1,
        rev2: !!rev2,
        preNotes: !!preNotes,
        mainsNotes: !!mainsNotes,
        questionBank: !!questionBank,
        prePyq: !!prePyq,
        mainsPyq: !!mainsPyq,
        ansWriting: !!ansWriting,
        preFinalRev: !!preFinalRev,
        mainsFinalRev: !!mainsFinalRev
      });
    }

    const syllabus = await SyllabusItem.find({ userId: user.userId }).lean();
    const formattedSyllabus = syllabus.map((item: any) => ({
      id: item.customId || item._id.toString(),
      subject: item.subject,
      category: item.category || 'GS1',
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

    return NextResponse.json({ syllabusList: formattedSyllabus });
  } catch (error: any) {
    console.error('Syllabus mutation error:', error);
    return NextResponse.json({ error: 'Failed to modify subject' }, { status: 500 });
  }
}
