-- Assign admin roles to Billy and Ana Dugger
INSERT INTO public.user_roles (user_id, role) VALUES
  ('2b07ca0e-03a2-4465-8caa-2e06ab8433fd', 'admin'),  -- Billy Dugger (duggerwd@gmail.com)
  ('35f1537f-2a7b-4c59-bf32-7831af4de6d8', 'admin')   -- Ana Dugger (duggeran@billysbotanicals.com)
ON CONFLICT (user_id, role) DO NOTHING;