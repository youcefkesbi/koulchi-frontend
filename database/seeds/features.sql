-- Seed data for features table
-- Insert default features

INSERT INTO public.features (name, display_name, description) VALUES
('store_logo', 'Store Logo', 'Ability to upload and display a store logo'),
('store_banner', 'Store Banner', 'Ability to upload and display a store banner'),
('color_customization', 'Color Customization', 'Ability to customize store colors and design'),
('external_buttons', 'External Buttons', 'Ability to add external buttons (WhatsApp, Telegram, etc.)'),
('store_name', 'Store Name', 'Ability to set a custom store name'),
('location_input', 'Location Input', 'Single large input for store location (3 lines)')
ON CONFLICT (name) DO NOTHING;
