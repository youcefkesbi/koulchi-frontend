-- Seed data for packs table
-- Insert default packs

INSERT INTO public.packs (name, description, price, max_announcements, max_images) VALUES
('Basic Pack', 'Free pack with basic features', 0.00, 150, 300),
('Pro Pack', 'Premium pack with advanced features', 1000.00, 3000, 6000)
ON CONFLICT (name) DO NOTHING;
