-- ================================
-- Notifications Table
-- ================================

-- ================================
-- TRIGGER FOR STORE CREATION NOTIFICATIONS
-- ================================
-- Copy this section to Supabase SQL Editor to add the trigger

-- Trigger function to notify all admins when a store is created
CREATE OR REPLACE FUNCTION public.notify_admins_on_store_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
    pack_name_en_val TEXT;
    pack_name_ar_val TEXT;
    pack_name_fr_val TEXT;
    pack_price_val DECIMAL(10,2);
BEGIN
    -- Get pack information if pack_id exists
    IF NEW.pack_id IS NOT NULL THEN
        SELECT 
            p.name_en,
            p.name_ar,
            p.name_fr,
            p.price
        INTO 
            pack_name_en_val,
            pack_name_ar_val,
            pack_name_fr_val,
            pack_price_val
        FROM public.packs p
        WHERE p.id = NEW.pack_id;
    END IF;
    
    -- Loop through all admin users and create notifications for each
    FOR admin_user_id IN 
        SELECT ur.user_id
        FROM public.user_roles ur
        WHERE ur.role = 'admin'
    LOOP
        -- 1. Store creation notification for admin
        INSERT INTO public.notifications (
            user_id,
            type,
            template_key,
            metadata,
            link,
            target_role,
            is_read,
            created_at
        ) VALUES (
            admin_user_id,
            'store_created',
            'notifications.adminStoreCreated',
            jsonb_build_object(
                'message', format('User %s has created a %s store successfully', NEW.owner_id, COALESCE(pack_name_en_val, 'Basic Pack')),
                'store_id', NEW.id,
                'store_name', NEW.name,
                'owner_id', NEW.owner_id,
                'store_status', NEW.status,
                'pack_id', NEW.pack_id,
                'pack_name_en', COALESCE(pack_name_en_val, 'Basic Pack'),
                'pack_name_ar', COALESCE(pack_name_ar_val, pack_name_en_val, 'Basic Pack'),
                'pack_name_fr', COALESCE(pack_name_fr_val, pack_name_en_val, 'Basic Pack')
            ),
            format('/admin/stores/%s', NEW.id),
            'admin',
            FALSE,
            NOW()
        );
        
        -- 2. Pack subscription notification (only if pack exists)
        IF NEW.pack_id IS NOT NULL AND pack_name_en_val IS NOT NULL THEN
            INSERT INTO public.notifications (
                user_id,
                type,
                template_key,
                metadata,
                link,
                target_role,
                is_read,
                created_at
            ) VALUES (
                admin_user_id,
                'pack_subscription',
                'notifications.packSubscription',
                jsonb_build_object(
                    'message', format('User %s has subscribed with %s pack', NEW.owner_id, pack_name_en_val),
                    'user_id', NEW.owner_id,
                    'store_id', NEW.id,
                    'store_name', NEW.name,
                    'pack_id', NEW.pack_id,
                    'pack_name_en', pack_name_en_val,
                    'pack_name_ar', COALESCE(pack_name_ar_val, pack_name_en_val),
                    'pack_name_fr', COALESCE(pack_name_fr_val, pack_name_en_val),
                    'pack_price', COALESCE(pack_price_val, 0),
                    'subscription_date', NOW()
                ),
                format('/admin/stores/%s', NEW.id),
                'admin',
                FALSE,
                NOW()
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- Create trigger on stores table
DROP TRIGGER IF EXISTS trigger_notify_admins_on_store_creation ON public.stores;
CREATE TRIGGER trigger_notify_admins_on_store_creation
    AFTER INSERT ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_on_store_creation();

-- ================================
-- TABLE STRUCTURE
-- ================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'store_rejected', 'order_placed', 'store_approved', etc.
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT, -- Optional link to navigate to when notification is clicked
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
); 

-- ================================
-- Create target_role enum
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_target_role') THEN
        CREATE TYPE notification_target_role AS ENUM ('admin', 'vendor', 'customer', 'employee');
    END IF;
END$$;

-- ================================
-- Update the notifications table with new columns
-- ================================
ALTER TABLE public.notifications 
    DROP COLUMN IF EXISTS message,
    ADD COLUMN IF NOT EXISTS template_key TEXT NOT NULL DEFAULT 'notifications.default',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS target_role notification_target_role;

-- Add constraint to ensure template_key is provided
ALTER TABLE public.notifications
    ALTER COLUMN template_key DROP DEFAULT;

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_template_key_idx ON public.notifications(template_key);
CREATE INDEX IF NOT EXISTS notifications_metadata_idx ON public.notifications USING GIN(metadata);
CREATE INDEX IF NOT EXISTS notifications_target_role_idx ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS notifications_user_target_role_idx ON public.notifications(user_id, target_role);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can insert notifications
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ================================
-- Functions
-- ================================

-- Function to get unread notification count for current user
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM public.notifications
    WHERE user_id = auth.uid() AND is_read = FALSE;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- Function to mark all notifications as read for current user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE
    WHERE user_id = auth.uid() AND is_read = FALSE;
END;
$$;

-- ================================
-- Permissions (GRANT statements)
-- ================================

-- Grant permissions to service_role for backend operations
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO postgres, anon, authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;

-- ================================
-- Enable Realtime for notifications table
-- ================================
-- This allows real-time subscriptions to work
-- If you get "mismatch" errors, first run: ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
-- Then run this command:
DO $$
BEGIN
    -- Try to add the table, ignore if it already exists
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already in publication, that's fine
        RAISE NOTICE 'Table notifications already in supabase_realtime publication';
    END;
END $$;
