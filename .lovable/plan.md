
# Plan: Fix Sunday Bag Editing for February Deliveries

## Summary

Update the week calculation logic so that on Sundays, users see and edit the **upcoming week's bag** (for their Saturday delivery), not the previous week's locked bag.

**Immediate Impact:** Stacey Wells and all other subscribers will be able to edit their bags for the February 7th delivery starting today (Sunday, February 1st).

---

## Changes Overview

### 1. Database Function: `get_or_create_current_week_bag_with_size`

Update to detect Sunday (in EST) and return the next week's bag:

```sql
-- Current (broken on Sundays):
current_week_start := DATE_TRUNC('week', CURRENT_DATE);

-- Fixed:
today_in_est := (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::DATE;
day_of_week := EXTRACT(DOW FROM today_in_est);

IF day_of_week = 0 THEN  -- Sunday
  current_week_start := DATE_TRUNC('week', today_in_est) + INTERVAL '7 days';
ELSE
  current_week_start := DATE_TRUNC('week', today_in_est);
END IF;
```

### 2. Database Function: `get_or_create_current_week_bag`

Apply the same Sunday detection logic to this simpler variant function.

### 3. Frontend: `MyBag.tsx` (lines 130-132)

Fix JavaScript week calculation to match database logic:

```typescript
// Current (broken):
currentWeekStart.setDate(now.getDate() - now.getDay() + 1);

// Fixed:
const dayOfWeek = now.getDay();
if (dayOfWeek === 0) {
  // Sunday: Use next Monday
  currentWeekStart.setDate(now.getDate() + 1);
} else {
  currentWeekStart.setDate(now.getDate() - dayOfWeek + 1);
}
```

### 4. Frontend: `BagHistory.tsx` (lines 50-51)

Apply same Sunday fix so history queries use correct week boundary.

### 5. Frontend: `useOrderCutoff.ts`

Update the lockout logic to properly handle Sunday as the start of the new edit window (not part of lockout).

---

## Files to Modify

| File | Change |
|------|--------|
| New SQL migration | Update both `get_or_create_current_week_bag` and `get_or_create_current_week_bag_with_size` functions |
| `src/pages/MyBag.tsx` | Fix week start calculation for Sunday |
| `src/components/BagHistory.tsx` | Fix week start calculation for Sunday |
| `src/hooks/useOrderCutoff.ts` | Ensure Sunday is correctly identified as unlocked |

---

## Expected Behavior After Fix

| Day/Time | What User Sees |
|----------|----------------|
| **Sunday (today)** | Feb 2-8 bag — **editable** |
| Monday - Thursday | Feb 2-8 bag — editable |
| Friday before noon | Feb 2-8 bag — editable |
| Friday after noon | Feb 2-8 bag — **locked** |
| Saturday | Feb 2-8 bag — locked |
| Next Sunday | Feb 9-15 bag — editable |

---

## Verification

After implementation:
1. Stacey Wells can visit My Bag and edit her selections for her Feb 7th delivery
2. All subscribers see the correct week's bag
3. Cutoff banner shows "Friday, February 6 at 12:00 PM EST"
