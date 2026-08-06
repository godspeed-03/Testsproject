import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";
import { buildDynamicRulesFromLegacy, getDefaultRulesForCategory } from "@/lib/syllabusRules";
import { sortSyllabusItems } from "@/lib/utils";
import { ensureUniqueColorsAndIcons } from "@/lib/subjectThemeMap";

function addDaysStr(dateStr: string, days: number) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;

    const body = await req.json();
    const { action, id, subject, category, status, source, date, nextRev, color, icon, rules, ruleKey, completed } = body;

    const dbRuleSets = await prisma.syllabusRuleSet.findMany({ where: { userId } });

    if (action === "delete") {
      await prisma.syllabusItem.deleteMany({
        where: {
          userId,
          OR: [{ id }, { customId: id }, { subject: id }],
        },
      });
    } else if (action === "toggle_rule" || action === "toggle_milestone") {
      let item = await prisma.syllabusItem.findFirst({
        where: {
          userId,
          OR: [{ id }, { customId: id }, { subject: id }],
        },
      });
      if (item) {
        let itemRules = buildDynamicRulesFromLegacy(item, dbRuleSets);

        const targetKey = ruleKey || Object.keys(body).find((k) => !["action", "id"].includes(k));
        if (targetKey) {
          const ruleIdx = itemRules.findIndex((r) => r.key === targetKey || r.label === targetKey);
          if (ruleIdx !== -1) {
            const nextCompleted = completed !== undefined ? !!completed : !itemRules[ruleIdx].completed;
            itemRules[ruleIdx].completed = nextCompleted;
          }
        }

        await prisma.syllabusItem.update({
          where: { id: item.id },
          data: { rules: itemRules as any },
        });
      }
    } else if (action === "update_status") {
      let item = await prisma.syllabusItem.findFirst({
        where: {
          userId,
          OR: [{ id }, { customId: id }, { subject: id }],
        },
      });
      if (item) {
        await prisma.syllabusItem.update({
          where: { id: item.id },
          data: { status },
        });
      }
    } else if (action === "update" || action === "update_rules") {
      let item = await prisma.syllabusItem.findFirst({
        where: {
          userId,
          OR: [{ id }, { customId: id }, { subject: id }],
        },
      });
      if (item) {
        const todayStr = new Date().toISOString().split("T")[0];
        const newRules = (rules && Array.isArray(rules)) ? rules : buildDynamicRulesFromLegacy(item, dbRuleSets);

        await prisma.syllabusItem.update({
          where: { id: item.id },
          data: {
            subject: subject ?? item.subject,
            category: category ?? item.category,
            status: status ?? item.status,
            date: date ?? (item.date || todayStr),
            nextRev: nextRev ?? (item.nextRev || addDaysStr(item.date || todayStr, 7)),
            color: color ?? (item as any).color,
            icon: icon ?? (item as any).icon,
            rules: newRules as any,
          },
        });
      }
    } else if (action === "create") {
      const customId = "subj_" + Date.now();
      const todayStr = new Date().toISOString().split("T")[0];
      const initialDate = date || todayStr;
      const initialNextRev = nextRev || addDaysStr(initialDate, 7);

      let initialRules =
        rules && Array.isArray(rules) && rules.length > 0
          ? rules
          : getDefaultRulesForCategory(category || "", dbRuleSets).map((t) => ({
              key: t.key,
              label: t.label,
              short: t.short,
              completed: false,
            }));

      await prisma.syllabusItem.create({
        data: {
          userId,
          customId,
          subject,
          category: category || "GS1",
          status: status || "Not Started",
          date: initialDate,
          nextRev: initialNextRev,
          color: color || "",
          icon: icon || "",
          rules: initialRules as any,
        },
      });
    }

    const syllabus = await prisma.syllabusItem.findMany({ where: { userId } });

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

    return NextResponse.json({ syllabusList: formattedSyllabus });
  } catch (error: any) {
    console.error("Syllabus mutation error:", error);
    return NextResponse.json({ error: "Failed to modify subject" }, { status: 500 });
  }
}
