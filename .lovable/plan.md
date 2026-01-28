
# Plan: Add "Pause Checkout" Toggle to Admin Delivery Days Tab

## Overview
This plan adds a simple admin toggle in the Delivery Days Management tab that, when enabled, prevents all new checkouts across the entire site while showing customers a friendly "We're taking a break" message.

---

## Where Customers Will See the Pause Message

When checkout is paused, customers will see a friendly message in these locations:

### 1. Order Summary Page (New Customers)
The checkout button at the bottom of the page will be replaced with:
- A soft orange/amber banner explaining you're on a break
- Text like: "We're taking a short break! We'll be back soon to serve you fresh, local produce."
- The button will be disabled with text: "Checkout Currently Unavailable"

### 2. My Bag Page (Subscribers adding extras)
- The checkout button will be disabled
- A similar banner will appear above the bag summary
- Subscribers can still view their bag contents but cannot add new add-ons during the pause

### 3. Start Farm Box Journey (New Visitors)
- The "Choose Your Box Size" button will be replaced with a friendly pause message
- Visitors can still learn about the service but cannot start a new order

---

## Admin Toggle Location

The toggle will be placed at the **top of the Delivery Days Management tab** as a prominent card:

```text
+--------------------------------------------------+
| CHECKOUT STATUS                                  |
| [GREEN BADGE: Active] or [AMBER BADGE: Paused]   |
|                                                  |
| [ Switch Toggle ]  Pause All Checkouts           |
|                                                  |
| When paused, customers cannot start new orders   |
| or purchase add-ons. Existing subscriptions      |
| continue to bill normally.                       |
+--------------------------------------------------+

[Existing Delivery Method & Day Management table below]
```

---

## Technical Implementation

### Step 1: Create `site_settings` Table
A new table with a single row to store global settings:

```sql
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_paused boolean NOT NULL DEFAULT false,
  checkout_paused_message text DEFAULT 'We''re taking a short break! Check back soon.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default row
INSERT INTO site_settings (id, checkout_paused) 
VALUES (gen_random_uuid(), false);

-- RLS: Everyone can read, only admins can update
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can update site settings"
  ON site_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
```

### Step 2: Add Toggle to AdminDeliveryDays.tsx
- Add a new Card at the top of the component
- Fetch the `site_settings` row on load
- Toggle updates the `checkout_paused` value
- Shows confirmation dialog when pausing (just like disabling days)

### Step 3: Create Reusable Hook: `useCheckoutStatus()`
```typescript
// src/hooks/useCheckoutStatus.ts
export function useCheckoutStatus() {
  const [isCheckoutPaused, setIsCheckoutPaused] = useState(false);
  const [pauseMessage, setPauseMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('checkout_paused, checkout_paused_message')
        .single();
      
      setIsCheckoutPaused(data?.checkout_paused || false);
      setPauseMessage(data?.checkout_paused_message || '');
      setLoading(false);
    };
    fetchStatus();
  }, []);

  return { isCheckoutPaused, pauseMessage, loading };
}
```

### Step 4: Update Customer-Facing Pages

**OrderSummary.tsx** - Add pause check before checkout button:
```tsx
const { isCheckoutPaused, pauseMessage } = useCheckoutStatus();

// In render, wrap checkout button:
{isCheckoutPaused ? (
  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
    <p className="text-amber-800 font-medium">{pauseMessage}</p>
    <Button disabled className="mt-4 w-full">
      Checkout Currently Unavailable
    </Button>
  </div>
) : (
  <Button onClick={handleCheckout}>...</Button>
)}
```

**MyBag.tsx** - Similar check before handleCheckout and in UI

**StartFarmBoxJourney.tsx** - Disable "Choose Your Box Size" button when paused

---

## What Won't Be Affected

1. **Existing Subscriptions** - Stripe continues billing normally via webhooks
2. **Admin Functions** - All admin dashboard features work as usual
3. **Order History** - Users can still view their past orders
4. **Account Management** - Users can update profiles, addresses, preferences
5. **Browsing** - All pages remain viewable (products, partners, gallery, etc.)
6. **Weekly Order Generation** - The cron job continues creating orders for subscribers

---

## Risk Assessment

| Risk Area | Mitigation |
|-----------|-----------|
| Existing checkout flows | Changes only add a check at the start, existing logic untouched |
| Database integrity | New table is independent, no FK to existing tables |
| Stripe webhooks | Webhook handlers don't touch `site_settings` |
| Edge functions | `create-payment` gets an early-exit check if paused |
| Rollback | Simply toggle off in admin dashboard |

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/migrations/new_migration.sql` | Create `site_settings` table with RLS |
| `src/hooks/useCheckoutStatus.ts` | NEW: Reusable hook for checkout status |
| `src/components/admin/AdminDeliveryDays.tsx` | Add pause toggle card at top |
| `src/pages/OrderSummary.tsx` | Add pause check around checkout button |
| `src/pages/MyBag.tsx` | Add pause check around checkout button |
| `src/components/StartFarmBoxJourney.tsx` | Disable CTA when paused |
| `supabase/functions/create-payment/index.ts` | Add early-exit check if paused |

---

## Summary

This is a safe, low-risk implementation because:
1. It adds a single boolean check at the start of checkout flows
2. It uses a new, isolated table with no dependencies on existing data
3. Existing subscription billing is completely unaffected
4. The toggle is immediately reversible from the admin dashboard
5. All checks happen before any payment processing begins
