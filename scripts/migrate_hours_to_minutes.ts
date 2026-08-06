import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function migrate() {
  console.log('Starting migration: Hours -> Minutes for HabitItems...');
  const habits = await prisma.habitItem.findMany();
  let updatedCount = 0;

  for (const h of habits) {
    let modified = false;
    const targetObj = typeof h.target === 'object' && h.target !== null ? { ...(h.target as any) } : {};
    const unitStr = String(targetObj.unit || '').toLowerCase().trim();
    const isHourUnit = ['hours', 'hrs', 'hour'].includes(unitStr);

    if (isHourUnit) {
      const origVal = targetObj.value || 1;
      const newTargetVal = Math.round(origVal * 60);
      targetObj.value = newTargetVal;
      targetObj.unit = 'minutes';
      modified = true;
      console.log(`Converting habit "${h.title}" target: ${origVal} hours -> ${newTargetVal} minutes`);
    }

    const history = Array.isArray(h.history) ? [...(h.history as any[])] : [];
    const newHistory = history.map((entry: any) => {
      if (!entry) return entry;
      const updatedEntry = { ...entry };
      const val = updatedEntry.value || 0;

      // If unit was hours and value is small (e.g. <= 24), convert to minutes
      if (isHourUnit && val > 0 && val <= 24) {
        const valInMins = Math.round(val * 60);
        console.log(`Converting habit "${h.title}" history entry on ${entry.date}: ${val} hrs -> ${valInMins} mins`);
        updatedEntry.value = valInMins;
        modified = true;
      }
      return updatedEntry;
    });

    if (modified) {
      await prisma.habitItem.update({
        where: { id: h.id },
        data: {
          target: targetObj,
          history: newHistory,
        },
      });
      updatedCount++;
    }
  }

  console.log(`Migration completed successfully! Updated ${updatedCount} habits.`);
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
