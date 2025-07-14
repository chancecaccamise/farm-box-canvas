-- Set up admin user (assign admin role to existing user)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'mangiadma@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add sample fresh catch announcements
INSERT INTO public.fresh_catch_announcements (fish_name, description, fisherman_name, image_url, created_at) VALUES
(
  'Black Sea Bass',
  'Just pulled in this beautiful 3lb Black Sea Bass from the rocky bottom near the jetties. Perfect eating size with firm white meat. Caught on live bait at 40ft depth during the early morning bite.',
  'Captain Mike Rodriguez',
  'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800',
  NOW() - INTERVAL '2 hours'
),
(
  'Red Snapper',
  'What a catch! This 8lb Red Snapper fought hard from 80ft of water. The crimson color and firm texture make this a premium fish for tonight''s dinner. Caught using circle hooks to ensure sustainable fishing.',
  'Sarah Thompson',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  NOW() - INTERVAL '1 day'
),
(
  'Grouper',
  'Trophy Grouper weighing in at 12 pounds! This monster was hiding in the reef structure and gave us a 20-minute fight. The sweet, flaky meat will feed the whole family. Fresh off the boat this morning.',
  'Tony ''Big Fish'' Martinez',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  NOW() - INTERVAL '3 hours'
),
(
  'Mahi Mahi',
  'Gorgeous Mahi Mahi with brilliant golden colors caught offshore in blue water. This 6lb beauty hit a ballyhoo bait and jumped 3 times! The lean, sweet meat is perfect for grilling or fish tacos.',
  'Captain Lisa Chen',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  NOW() - INTERVAL '5 hours'
),
(
  'Striped Bass',
  'Local Striper caught in the bay using live eels. This 5lb fish is in perfect condition with bright silver sides and distinct stripes. Sustainable catch-and-keep from our abundant local population.',
  'Joey ''Striper King'' Wilson',
  'https://images.unsplash.com/photo-1582042478155-e1c7862b1aa1?w=800',
  NOW() - INTERVAL '6 hours'
);