# Email Notification System Setup Guide

## Overview
This guide will help you set up the email notification system for store rejections using Supabase Edge Functions and Resend API.

## Prerequisites
- ✅ Resend API key (already configured)
- ✅ Email address: contact@koulchi.site
- ✅ Supabase project with stores table

## Step-by-Step Setup

### 1. Deploy the Edge Function

```bash
# Navigate to your project root
cd koulchi-frontend

# Deploy the Edge Function
supabase functions deploy send-store-notification
```

### 2. Configure Environment Variables

In your Supabase dashboard:
1. Go to **Settings** > **Edge Functions**
2. Find `send-store-notification` function
3. Add these environment variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Set Up Database Webhook

In your Supabase dashboard:
1. Go to **Database** > **Webhooks**
2. Click **Create a new webhook**
3. Configure the webhook:

**Basic Settings:**
- **Name**: `Store Rejection Notification`
- **Table**: `stores`
- **Events**: `Update`
- **Type**: `HTTP Request`

**HTTP Request Settings:**
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-store-notification`
- **HTTP Method**: `POST`
- **HTTP Headers**:
  ```
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY
  Content-Type: application/json
  ```

**Filter Settings:**
- **Filter**: `status = 'rejected'`

### 4. Test the System

#### Option A: Use the Test Script
1. Open `test-email-notification.js`
2. Replace placeholder values with your actual credentials
3. Run the script in your browser console

#### Option B: Manual Testing
1. Go to your Employee Dashboard
2. Find a pending store
3. Click "Reject" and provide a rejection reason
4. Check if the store owner receives an email

### 5. Verify Setup

Check these locations for confirmation:
- **Edge Function Logs**: Supabase Dashboard > Edge Functions > send-store-notification > Logs
- **Webhook Logs**: Supabase Dashboard > Database > Webhooks > Store Rejection Notification
- **Email Delivery**: Check Resend dashboard for delivery status

## Email Templates

The system includes three language templates:

### English (Default)
- Subject: "Store Rejection Notification - [Store Name]"
- Includes rejection reason and next steps

### French
- Subject: "Notification de Rejet de Boutique - [Store Name]"
- Triggered when pack name contains "basique"

### Arabic
- Subject: "إشعار رفض المتجر - [Store Name]"
- Triggered when pack name contains "أساسي"
- RTL layout support

## Troubleshooting

### Common Issues

1. **Email not sent**
   - Check Edge Function logs for errors
   - Verify Resend API key is correct
   - Ensure webhook is properly configured

2. **Wrong language template**
   - Check pack name in database
   - Verify language detection logic in Edge Function

3. **Webhook not triggering**
   - Verify filter condition: `status = 'rejected'`
   - Check webhook URL is correct
   - Ensure service role key has proper permissions

### Debug Steps

1. **Check Edge Function logs**:
   ```bash
   supabase functions logs send-store-notification
   ```

2. **Test webhook manually**:
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-store-notification \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"record":{"status":"rejected","owner_id":"USER_ID","name":"Test Store","rejection_reason":"Test reason"}}'
   ```

3. **Verify database trigger**:
   ```sql
   -- Check if trigger exists
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'store_notification_trigger';
   ```

## Database Schema Requirements

The system expects these fields in the `stores` table:
- `id` (UUID)
- `name` (TEXT)
- `owner_id` (UUID) - References auth.users
- `status` (store_status enum)
- `rejection_reason` (TEXT)
- `pack_id` (UUID) - For language detection

## Security Notes

- Service role key is used for admin operations
- Webhook is protected by authorization header
- Email addresses are retrieved securely from auth.users
- No sensitive data is logged

## Cost Estimation

- **Supabase Edge Functions**: Free tier included
- **Resend**: $20/month for 50,000 emails
- **Total**: ~$20/month for most small businesses

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Edge Function logs
3. Verify webhook configuration
4. Test with the provided test script
