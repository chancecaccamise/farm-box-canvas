
# Plan: Fix Sunday Bag Editing for February Deliveries

## ✅ COMPLETED

All changes have been implemented:

### Database Changes
- Updated `get_or_create_current_week_bag` function with Sunday detection
- Updated `get_or_create_current_week_bag_with_size` function with Sunday detection
- Both now use EST timezone and shift to next week's Monday when called on Sunday

### Frontend Changes
- `src/pages/MyBag.tsx` (lines 129-143) - Fixed week start calculation
- `src/components/BagHistory.tsx` (lines 48-61) - Fixed week start calculation  
- `src/hooks/useOrderCutoff.ts` (lines 49-54) - Clarified Sunday is unlocked

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

Stacey Wells and all subscribers can now:
1. Visit My Bag on Sunday and see the upcoming week's bag (Feb 2-8)
2. Edit their selections for their Saturday Feb 7th delivery
3. See cutoff banner showing "Friday, February 6 at 12:00 PM EST"
