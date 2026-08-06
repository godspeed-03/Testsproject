import 'dotenv/config';
import prisma from '../src/lib/prisma';

function getTodayIso() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utcMs + 5.5 * 3600000);
  const y = istTime.getFullYear();
  const m = String(istTime.getMonth() + 1).padStart(2, '0');
  const d = String(istTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isHabitScheduledForDate(h: any, dateIso: string): boolean {
  if (h.startDate && h.startDate > dateIso) return false;
  if (h.endDate && h.endDate < dateIso) return false;

  const freq = typeof h.frequency === 'object' && h.frequency !== null ? h.frequency : {};
  const mode = freq.mode || 'daily';
  if (mode === 'daily') return true;
  if (mode === 'once') return h.startDate === dateIso;

  if (mode === 'specific_days' || mode === 'weekly') {
    const dateObj = new Date(dateIso + 'T00:00:00');
    const dayShortNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayFullNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIdx = dateObj.getDay();
    const shortDay = dayShortNames[dayIdx];
    const fullDay = dayFullNames[dayIdx];

    const daysArr = Array.isArray(freq.days) ? freq.days.map((d: any) => String(d).toLowerCase().trim()) : [];
    return daysArr.includes(shortDay) || daysArr.includes(fullDay) || daysArr.includes(shortDay.slice(0, 3));
  }

  if (mode === 'monthly') {
    const dateObj = new Date(dateIso + 'T00:00:00');
    const monthlyDay = freq.monthlyDay || 1;
    return dateObj.getDate() === monthlyDay;
  }

  return true;
}

async function finalizePast() {
  const todayIso = getTodayIso();
  console.log(`Starting auto-finalization of past uncompleted habits/tasks for today: ${todayIso}...`);

  const habits = await prisma.habitItem.findMany();
  let updatedCount = 0;

  for (const h of habits) {
    let modified = false;
    const history = Array.isArray(h.history) ? [...(h.history as any[])] : [];
    const startDate = h.startDate || todayIso;

    // Check past dates from startDate up to yesterday
    let current = startDate;
    const yesterdayIso = addDaysStr(todayIso, -1);

    // Limit check range to last 60 days to keep performance fast
    const minCheckDate = addDaysStr(todayIso, -60);
    if (current < minCheckDate) {
      current = minCheckDate;
    }

    while (current <= yesterdayIso) {
      if (isHabitScheduledForDate(h, current)) {
        const existingIdx = history.findIndex((e: any) => e.date === current);

        if (existingIdx === -1) {
          // No log entry exists for past scheduled date -> mark as failed
          history.push({ date: current, status: 'failed', value: 0 });
          modified = true;
          console.log(`Setting past uncompleted "${h.title}" on ${current} to "failed"`);
        } else {
          const entry = history[existingIdx];
          if (entry.status !== 'done' && entry.status !== 'failed' && entry.status !== 'false') {
            history[existingIdx] = { ...entry, status: 'failed' };
            modified = true;
            console.log(`Updating past uncompleted "${h.title}" on ${current} from "${entry.status}" to "failed"`);
          }
        }
      }
      current = addDaysStr(current, 1);
    }

    if (modified) {
      await prisma.habitItem.update({
        where: { id: h.id },
        data: { history },
      });
      updatedCount++;
    }
  }

  console.log(`Past finalization complete! Updated ${updatedCount} habits in DB.`);
}

finalizePast()
  .catch((e) => {
    console.error('Finalization failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
