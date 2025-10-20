-- ================================
-- Store Notification Trigger Function
-- ================================

-- Function to call the Edge Function when store status changes to rejected
CREATE OR REPLACE FUNCTION public.trigger_store_notification()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSONB;
  response TEXT;
BEGIN
  -- Only trigger on status change to 'rejected'
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    -- Get the webhook URL for the Edge Function
    webhook_url := 'https://' || current_setting('app.settings.supabase_url', true) || '/functions/v1/send-store-notification';
    
    -- Prepare the payload with store and owner information
    payload := jsonb_build_object(
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD),
      'type', 'UPDATE',
      'table', 'stores',
      'schema', 'public'
    );
    
    -- Call the Edge Function using pg_net extension
    BEGIN
      SELECT content INTO response
      FROM http((
        'POST',
        webhook_url,
        ARRAY[http_header('Content-Type', 'application/json'),
              http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))],
        'application/json',
        payload::text
      ));
      
      RAISE NOTICE 'Store rejection notification sent for store ID: %, response: %', NEW.id, response;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send store rejection notification for store ID: %, error: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS store_notification_trigger ON public.stores;
CREATE TRIGGER store_notification_trigger
  AFTER UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_store_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.trigger_store_notification() TO authenticated;
