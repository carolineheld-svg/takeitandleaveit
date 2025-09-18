-- Final Security Fixes for Supabase
-- Run this script to fix the remaining security issues

-- 1. Fix the complete_trade function in schema (different signature)
DROP FUNCTION IF EXISTS public.complete_trade(UUID);

CREATE OR REPLACE FUNCTION public.complete_trade(trade_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_record RECORD;
BEGIN
  -- Get trade request details
  SELECT * INTO trade_record 
  FROM public.trade_requests 
  WHERE id = trade_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade request not found';
  END IF;
  
  -- Mark the item as traded
  UPDATE public.items 
  SET 
    is_traded = true,
    traded_at = NOW(),
    traded_to_user_id = trade_record.from_user_id,
    status = 'traded'
  WHERE id = trade_record.item_id;
  
  -- Update trade request status
  UPDATE public.trade_requests 
  SET status = 'completed'
  WHERE id = trade_request_id;
  
  -- Create notification for the trade completion
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    read_at,
    related_item_id,
    related_trade_request_id,
    related_chat_message_id,
    metadata
  ) VALUES (
    trade_record.from_user_id,
    'item_bought',
    'Trade Completed',
    'Your trade request has been completed successfully!',
    false,
    null,
    trade_record.item_id,
    trade_record.id,
    null,
    '{}'
  );
END;
$$;

-- 2. Fix the notification functions from notifications_migration.sql
CREATE OR REPLACE FUNCTION public.create_trade_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    read_at,
    related_item_id,
    related_trade_request_id,
    related_chat_message_id,
    metadata
  ) VALUES (
    NEW.to_user_id,
    'trade_request',
    'New Trade Request',
    'You have received a new trade request for your item.',
    false,
    null,
    NEW.item_id,
    NEW.id,
    null,
    '{}'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_trade_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        is_read,
        read_at,
        related_item_id,
        related_trade_request_id,
        related_chat_message_id,
        metadata
      ) VALUES (
        NEW.from_user_id,
        'trade_accepted',
        'Trade Request Accepted',
        'Your trade request has been accepted!',
        false,
        null,
        NEW.item_id,
        NEW.id,
        null,
        '{}'
      );
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        is_read,
        read_at,
        related_item_id,
        related_trade_request_id,
        related_chat_message_id,
        metadata
      ) VALUES (
        NEW.from_user_id,
        'trade_declined',
        'Trade Request Declined',
        'Your trade request has been declined.',
        false,
        null,
        NEW.item_id,
        NEW.id,
        null,
        '{}'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_chat_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_record RECORD;
BEGIN
  -- Get the trade request to find the recipient
  SELECT * INTO trade_record 
  FROM public.trade_requests 
  WHERE id = NEW.trade_request_id;
  
  -- Create notification for the recipient (not the sender)
  IF trade_record.from_user_id = NEW.sender_id THEN
    -- Message from requester to lister
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      read_at,
      related_item_id,
      related_trade_request_id,
      related_chat_message_id,
      metadata
    ) VALUES (
      trade_record.to_user_id,
      'chat_message',
      'New Message',
      'You have received a new message in your trade conversation.',
      false,
      null,
      trade_record.item_id,
      NEW.trade_request_id,
      NEW.id,
      '{}'
    );
  ELSE
    -- Message from lister to requester
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      read_at,
      related_item_id,
      related_trade_request_id,
      related_chat_message_id,
      metadata
    ) VALUES (
      trade_record.from_user_id,
      'chat_message',
      'New Message',
      'You have received a new message in your trade conversation.',
      false,
      null,
      trade_record.item_id,
      NEW.trade_request_id,
      NEW.id,
      '{}'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Ensure all triggers are properly set up
DROP TRIGGER IF EXISTS trade_request_notification_trigger ON public.trade_requests;
CREATE TRIGGER trade_request_notification_trigger
  AFTER INSERT ON public.trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_trade_request_notification();

DROP TRIGGER IF EXISTS trade_status_notification_trigger ON public.trade_requests;
CREATE TRIGGER trade_status_notification_trigger
  AFTER UPDATE ON public.trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_trade_status_notification();

DROP TRIGGER IF EXISTS chat_message_notification_trigger ON public.chat_messages;
CREATE TRIGGER chat_message_notification_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_message_notification();

-- 4. Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_item ON public.notifications(related_item_id);

-- 5. Verify all functions have proper security settings
-- This query will show any functions that still have mutable search_path
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true
AND NOT EXISTS (
  SELECT 1 FROM pg_proc p2
  WHERE p2.oid = p.oid
  AND p2.proconfig IS NOT NULL
  AND 'search_path=public' = ANY(p2.proconfig)
);

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.complete_trade(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_trade_request_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_trade_status_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_chat_message_notification() TO authenticated;
