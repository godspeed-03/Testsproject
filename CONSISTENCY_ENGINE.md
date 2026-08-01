# UPSC Tracker - Consistency Engine Documentation

> **Version**: 2.0  
> **Module**: Consistency Analytics & MongoDB Snapshot Engine  
> **Location**: `/src/app/tracker/analytics` | `/src/app/api/tracker/consistency` | `/src/models/ConsistencySnapshot.ts`

---

## 1. Executive Overview

The **UPSC Consistency Engine** is an automated, database-backed performance analytics system designed to track, score, and archive an aspirant's preparation discipline. It synthesizes performance across:
1. **Daily Habits** (e.g. Newspaper reading, Exercise, Mock tests)
2. **Recurring Tasks** (e.g. Daily answer writing, CSAT practice)
3. **Syllabus Revision Matrix** (7-Stage SRS Milestones for GS1–GS4, Optionals, and CSAT)

Scores are calculated using a **fair assessment algorithm** that excludes dates prior to an item's creation, preventing artificial score depression. Snapshots are stored permanently in **MongoDB** on a **4:00 AM study-day schedule**.

---

## 2. 4:00 AM Study-Day Reset Protocol

In competitive exam preparation, late-night study sessions extending past midnight belong to the same academic day. The engine enforces a **4:00 AM Reset Boundary**.

### Implementation Logic (`getStudyDayKey`)
- If current time is between **12:00 AM and 03:59 AM**, the study day key maps to **yesterday's date**.
- At **04:00 AM**, the new study day key initializes.

```typescript
function getStudyDayKey(d: Date = new Date()): string {
  const adjusted = new Date(d);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const y = adjusted.getFullYear();
  const m = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
```

---

## 3. Consistency Scoring Logic

### A. Fair Assessment Protection
- Days occurring **before** a habit or task's `startDate` are ignored.
- Users are never penalized for past days when a habit did not yet exist.

### B. Weighted Score Weights (30-Day Moving Window)

$$\text{Overall Score} = (0.40 \times \text{HabitScore}) + (0.30 \times \text{TaskScore}) + (0.30 \times \text{RevisionScore})$$

| Component | Weight | Calculation Method |
| :--- | :--- | :--- |
| **Habit Execution** | **40%** | $\frac{\text{Completed Scheduled Days}}{\text{Total Scheduled Days (post-startDate)}} \times 100$ |
| **Task Routine** | **30%** | $\frac{\text{Completed Recurring Task Days}}{\text{Total Scheduled Task Days}} \times 100$ |
| **Revision Matrix** | **30%** | $\frac{\text{Logged Revisions Done}}{\max(1, \text{Total Revision Items})} \times 100$ |

### C. Overall Till-Date Cumulative Score
Calculates total discipline from Day 1 to Today across all logged MongoDB history:

$$\text{TillDateScore} = \min\left(100, \text{Round}\left(\frac{\sum \text{Done Entries}}{\sum \text{Logged Days}} \times 100\right)\right)$$

---

## 4. Database Schema Specification

### `ConsistencySnapshot` (`/src/models/ConsistencySnapshot.ts`)

```typescript
export interface IHabitBreakdownItem {
  id: string;
  title: string;
  type: string;
  icon?: string;
  subject?: string;
  category?: string;
  score: number;
  doneCount: number;
  streakCurrent: number;
  streakBest: number;
}

export interface ICategoryBreakdownItem {
  category: string;
  score: number;
  totalDone: number;
  habitsCount: number;
}

export interface IConsistencySnapshot extends Document {
  userId: string;
  studyDayKey: string;      // Unique key per study day e.g. "2026-08-01"
  monthKey: string;         // e.g. "2026-08"
  monthName: string;        // e.g. "August 2026"
  overallScore: number;     // 30-Day weighted score
  tillDateScore?: number;   // Till-date overall score
  habitScore: number;
  taskScore: number;
  revisionScore: number;
  totalDone: number;
  habitBreakdown?: IHabitBreakdownItem[];
  categoryBreakdown?: ICategoryBreakdownItem[];
  calculatedAt: string;     // Timestamp e.g. "04:00 AM"
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5. API Route Specification (`/api/tracker/consistency`)

### `GET /api/tracker/consistency`
Fetches current study day snapshot and MongoDB monthly aggregated archives.

- **Response Body**:
```json
{
  "todaySnapshot": {
    "studyDayKey": "2026-08-01",
    "monthKey": "2026-08",
    "overallScore": 88,
    "tillDateScore": 92,
    "habitScore": 90,
    "taskScore": 85,
    "revisionScore": 88,
    "totalDone": 142,
    "calculatedAt": "04:00 AM"
  },
  "monthlyHistory": [
    {
      "monthKey": "2026-08",
      "monthName": "August 2026",
      "score": 88,
      "totalDone": 142
    }
  ],
  "tillDateScore": 92,
  "habitBreakdown": [...],
  "categoryBreakdown": [...]
}
```

### `POST /api/tracker/consistency`
Triggers an immediate manual recalculation of consistency scores and upserts the `ConsistencySnapshot` document in MongoDB.

---

## 6. Frontend Analytics Controls & Visual UI

Located in `/src/app/tracker/analytics/page.tsx`:

1. **Month Navigator Pill (`< August 2026 >`)**:
   - Stepper pill for toggling through authentic monthly database records.
2. **Multi-View Filter Bar**:
   - **Overall Till-Date**: Displays cumulative discipline from Day 1 to present.
   - **Habit-Wise**: Select any habit to inspect its individual score, completion count, and streak.
   - **Syllabus GS Subject**: Filter performance by `GS1`, `GS2`, `GS3`, `GS4`, `Maths`, `CSAT`, or `Current Affairs`.
3. **Radial Score Gauge & Badges**:
   - SVG circle gauge with color gradient (#6366F1 to #10B981).
   - Grade Badges:
     - `S-TIER ASPIRANT` ($\ge 90\%$)
     - `A-TIER CONSISTENT` ($75\% - 89\%$)
     - `B-TIER STEADY` ($60\% - 74\%$)
     - `NEEDS FOCUS` ($< 60\%$)
4. **Recharts Area Chart**:
   - Visual trend line graph representing historical consistency score snapshots stored in MongoDB.
