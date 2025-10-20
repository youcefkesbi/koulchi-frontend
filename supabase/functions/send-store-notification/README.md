# Store Notification Edge Function

This Edge Function sends email notifications when a store is rejected.

## Setup Instructions

### 1. Deploy the Function
```bash
supabase functions deploy send-store-notification
```

### 2. Set Environment Variables
In your Supabase dashboard, go to Settings > Edge Functions and set:
- `RESEND_API_KEY`: Your Resend API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Create Database Webhook
In your Supabase dashboard, go to Database > Webhooks and create a new webhook:

**Webhook Settings:**
- **Name**: Store Rejection Notification
- **Table**: stores
- **Events**: Update
- **Type**: HTTP Request
- **URL**: `https://your-project-ref.supabase.co/functions/v1/send-store-notification`
- **HTTP Method**: POST
- **HTTP Headers**: 
  - `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
  - `Content-Type: application/json`

**Filter Settings:**
- **Filter**: `status = 'rejected'`

### 4. Test the Function
1. Update a store status to 'rejected' with a rejection reason
2. Check the Edge Function logs in Supabase dashboard
3. Verify the email is sent to the store owner

## Email Templates

The function includes multi-language email templates:
- **English**: Default template
- **French**: Detected when pack name contains "basique"
- **Arabic**: Detected when pack name contains "أساسي"

## Troubleshooting

1. **Check Edge Function logs** in Supabase dashboard
2. **Verify Resend API key** is correctly set
3. **Check webhook configuration** matches the function URL
4. **Ensure store has rejection_reason** when status is set to 'rejected'
