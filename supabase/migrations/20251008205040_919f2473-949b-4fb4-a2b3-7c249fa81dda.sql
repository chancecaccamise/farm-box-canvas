-- Delete all test orders, keeping only the real order BB233F0D95
DELETE FROM public.orders 
WHERE order_confirmation_number != 'BB233F0D95' OR order_confirmation_number IS NULL;