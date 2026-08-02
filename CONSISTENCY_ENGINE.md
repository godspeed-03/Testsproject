# UPSC Tracker — Analytics & Scoring Engine V4

> **Version**: 4.0  
> **Module**: Consistency Analytics & MongoDB Snapshot Pipeline  
> **Engine**: `/src/lib/consistencyEngineV3.ts`  
> **Weekly Engine**: `/src/lib/weeklyAnalyticsEngine.ts`  
> **API**: `/src/app/api/tracker/consistency` | `/src/app/api/tracker/weekly-analytics`  
> **Models**: `DailySnapshot` · `MonthlySnapshot` · `AllTimeSnapshot` · `WeeklyData`

---

## 1. Architecture — 3-Tier Snapshot Hierarchy

```
HabitItem.history[] ──┐
TopicRevision.revisions[] ──┤──► DailySnapshot ──► MonthlySnapshot ──► AllTimeSnapshot
SyllabusItem ──────────────┘         (per day)       (per month)        (per user)
```

**Separate Pipeline**: `WeeklyData` calculates 7-day study velocity, subject/habit distribution independently.

---

## 2. Study Day Boundary (4:00 AM Reset)

- **12:00 AM – 3:59 AM** → study day key = **yesterday**
- **4:00 AM onwards** → study day key = **today**

Late-night study sessions count as the same academic day.

---

## 3. Scoring Algorithm

### 3.1 Daily Composite Score

$$\text{Overall} = \frac{0.40 \times \text{HabitScore} + 0.30 \times \text{TaskScore} + 0.30 \times \text{RevisionScore}}{\text{Sum of active weights}}$$

**Dynamic Weight Redistribution**: If a component has no scheduled items (score = -1), its weight redistributes proportionally to active components.

### 3.2 Habit Score (40% Weight)

For each HabitItem where `frequency.mode ≠ 'once'` and `startDate ≤ studyDayKey`:

| Frequency Mode | Scheduled Check |
|:---|:---|
| `daily` | Always scheduled |
| `specific_days` / `weekly` | Today's weekday ∈ `frequency.days[]` |
| `monthly` | Today's date == `frequency.monthlyDay` |

$$\text{HabitScore} = \frac{\text{Completed Scheduled Items}}{\text{Total Scheduled Items}} \times 100$$

**Fair Assessment**: Days before a habit's `startDate` are excluded.

### 3.3 Task Score (30% Weight)

Same as Habit Score but filtered to `type === 'task'` with recurring frequency.

### 3.4 Revision Score (30% Weight) — Asymmetric Weighting

| Constant | Value | Purpose |
|:---|:---|:---|
| `W_DONE` | 1.0 | Credit per completed revision |
| `W_MISS` | 1.3 | Penalty per missed revision (30% harsher) |
| `GRACE_DAYS` | 1 | Grace period before marking as missed |

$$\text{RevisionScore} = \text{clamp}\left(0, 100, \frac{\text{done} \times 1.0 - \text{missed} \times 1.3}{\text{due}} \times 100\right)$$

### 3.5 Monthly Aggregation

- **Scores**: Simple average of all DailySnapshot scores in that month
- **Habit Breakdown**: Aggregate scheduledDays / completedDays per habit across daily snapshots
- **Category/Subject Breakdown**: Sum revisionsDue/Done/Missed across daily snapshots, recalculate score

### 3.6 All-Time Aggregation

- **Scores**: Weighted average across all MonthlySnapshots, weighted by `daysWithData`
- **Breakdowns**: Same aggregation pattern across all months

---

## 4. Grade System

| Score Range | Grade | Badge Color |
|:---|:---|:---|
| ≥ 90% | `S-TIER CONSISTENT` | Purple |
| 75% – 89% | `A-TIER CONSISTENT` | Emerald |
| 60% – 74% | `B-TIER STABLE` | Amber |
| < 60% | `NEEDS FOCUS` | Rose |

---

## 5. API Reference

### `GET /api/tracker/consistency`

| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| `range` | `month \| alltime` | `month` | Time scope |
| `monthKey` | `YYYY-MM` | Current month | Month filter |
| `habitId` | `string` | — | Individual habit filter |
| `category` | `string` | — | Category filter |
| `subject` | `string` | — | Subject filter |

### `POST /api/tracker/consistency/recalculate`

Triggers: `DailySnapshot → MonthlySnapshot → AllTimeSnapshot` full pipeline.

### `GET /api/tracker/weekly-analytics`

Returns current 7-day study velocity data from `WeeklyData` collection.

---

## 6. MongoDB Collections

| Collection | Key | Unique Index |
|:---|:---|:---|
| `dailysnapshots` | `userId + studyDayKey` | ✅ |
| `monthlysnapshots` | `userId + monthKey` | ✅ |
| `alltimesnapshots` | `userId` | ✅ |
| `weeklydatas` | `userId + weekKey` | ✅ |
