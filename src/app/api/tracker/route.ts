import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";
import { calcOverdueStatus } from "@/lib/topicRevisionEngine";
import { buildDynamicRulesFromLegacy } from "@/lib/syllabusRules";
import { sortSyllabusItems } from "@/lib/utils";
import { ensureUniqueColorsAndIcons } from "@/lib/subjectThemeMap";

async function cleanupCorruptedSyllabusItems(userId: string) {
  try {
    const [allSyllabus, allTopicRevisions] = await Promise.all([
      prisma.syllabusItem.findMany({ where: { userId } }),
      prisma.topicRevision.findMany({ where: { userId }, select: { topic: true } }),
    ]);

    const knownCategories = ["gs1", "gs2", "gs3", "gs4", "maths", "csat", "optional", "essay", "general", "study"];
    const topicSet = new Set(allTopicRevisions.map((t) => t.topic?.trim().toLowerCase()).filter(Boolean));

    const toDeleteIds: string[] = [];
    const subjectMap = new Map<string, any[]>();

    for (const item of allSyllabus) {
      const sName = item.subject?.trim().toLowerCase();
      if (!sName) {
        toDeleteIds.push(item.id);
        continue;
      }
      if (!subjectMap.has(sName)) {
        subjectMap.set(sName, []);
      }
      subjectMap.get(sName)!.push(item);
    }

    for (const [_, items] of subjectMap.entries()) {
      if (items.length > 1) {
        const validItems = items.filter((i) => knownCategories.some((k) => i.category?.toLowerCase().includes(k)));
        const keepId = (validItems.length > 0 ? validItems[0] : items[0]).id;
        items.forEach((i) => {
          if (i.id !== keepId) {
            toDeleteIds.push(i.id);
          }
        });
      } else if (items.length === 1) {
        const item = items[0];
        const catLower = item.category?.trim().toLowerCase() || "";
        const isKnown = knownCategories.some((k) => catLower.includes(k));
        if (!isKnown && topicSet.has(catLower)) {
          toDeleteIds.push(item.id);
        }
      }
    }

    if (toDeleteIds.length > 0) {
      await prisma.syllabusItem.deleteMany({ where: { id: { in: toDeleteIds } } });
    }
  } catch (err) {
    console.error("Failed to clean up corrupted SyllabusItems:", err);
  }
}

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const todayStr = new Date().toISOString().split("T")[0];

    const [syllabus, testLogs, topicRevisions, dbRuleSets, batchedRevisions] = await Promise.all([
      prisma.syllabusItem.findMany({ where: { userId } }),
      prisma.testLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.topicRevision.findMany({ where: { userId } }),
      prisma.syllabusRuleSet.findMany({ where: { userId } }),
      prisma.batchedRevisionItem.findMany({ where: { userId } }),
    ]);

    const rawSyllabus = syllabus.map((item) => ({
      id: item.customId || item.id,
      dbId: item.id,
      subject: item.subject,
      category: item.category || "GS1",
      status: item.status || "Not Started",
      date: item.date || "",
      nextRev: item.nextRev || "",
      color: (item as any).color || "",
      icon: (item as any).icon || "",
      rules: buildDynamicRulesFromLegacy(item, dbRuleSets),
    }));

    const uniqueSyllabus = ensureUniqueColorsAndIcons(rawSyllabus);

    for (const item of uniqueSyllabus) {
      const orig = syllabus.find((s) => s.id === item.dbId);
      if (orig && (!(orig as any).color || !(orig as any).icon)) {
        await prisma.syllabusItem.update({
          where: { id: item.dbId },
          data: { color: item.color, icon: item.icon },
        }).catch(() => {});
      }
    }

    const formattedSyllabus = sortSyllabusItems(uniqueSyllabus);

    const formattedTestLogs = testLogs.map((item) => ({
      id: item.customId || item.id,
      testName: item.testName || item.code || "Untitled Mock Test",
      code: item.code || item.testName || "MOCK",
      type: item.type || "PRELIMS",
      category: item.category || item.subject || "GS1",
      subject: item.subject || item.category || "General Studies",
      date: item.date || "",
      score: item.score || 0,
      maxScore: item.maxScore || 200,
      percent: item.percent !== null && item.percent !== undefined ? item.percent : Math.round(((item.score || 0) / (item.maxScore || 200)) * 100),
      correctCount: item.correctCount ?? Math.round((((item.percent || Math.round(((item.score || 0) / (item.maxScore || 200)) * 100)) / 100) * 100) * 0.5),
      incorrectCount: item.incorrectCount ?? Math.round((((100 - (item.percent || Math.round(((item.score || 0) / (item.maxScore || 200)) * 100))) / 100) * 100) * 0.2),
      unattemptedCount: item.unattemptedCount ?? 30,
      negMarks: item.negMarks ?? Math.round((item.incorrectCount || 10) * 0.66),
      accuracy: item.accuracy || `${item.percent || Math.round(((item.score || 0) / (item.maxScore || 200)) * 100)}%`,
      concept: item.concept || 0,
      silly: item.silly || 0,
      timeP: item.timeP || 0,
      weakAreas: Array.isArray(item.weakAreas) ? item.weakAreas : [],
      takeaway: item.takeaway || "",
    }));

    const formattedTopicRevisions = topicRevisions.map((t) => {
      const overdueInfo = t.nextScheduledDate
        ? calcOverdueStatus(t.nextScheduledDate, todayStr)
        : { isOverdue: false, overdueDays: 0 };
      return {
        id: t.customId || t.id,
        subject: t.subject,
        category: t.category,
        topic: t.topic,
        firstReadDate: t.firstReadDate,
        lastRevisedDate: t.lastRevisedDate,
        status: t.status,
        isAugmentedRevision: t.isAugmentedRevision,
        isBatchedRevision: t.isBatchedRevision,
        isOverdue: overdueInfo.isOverdue,
        overdueDays: overdueInfo.overdueDays,
        nextScheduledDate: t.nextScheduledDate,
        revisions: Array.isArray(t.revisions) ? t.revisions : [],
      };
    });

    cleanupCorruptedSyllabusItems(userId).catch(() => {});

    return NextResponse.json({
      syllabusList: formattedSyllabus,
      testLogs: formattedTestLogs,
      topicRevisions: formattedTopicRevisions,
      batchedRevisions,
    });
  } catch (error: any) {
    console.error("Fetch tracker data error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.syllabusItem.deleteMany({ where: { userId: user.userId } });
    await prisma.testLog.deleteMany({ where: { userId: user.userId } });
    await prisma.topicRevision.deleteMany({ where: { userId: user.userId } });

    return NextResponse.json({
      message: "All dummy data wiped successfully. Blank sheet initialized!",
      syllabusList: [],
      testLogs: [],
      topicRevisions: [],
    });
  } catch (error: any) {
    console.error("Wipe data error:", error);
    return NextResponse.json({ error: "Failed to wipe data" }, { status: 500 });
  }
}
