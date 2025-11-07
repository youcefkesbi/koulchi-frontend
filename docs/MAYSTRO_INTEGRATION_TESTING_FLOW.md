# Maystro Integration Testing Flow

## Phase 1: Connection Testing

### Test Connect to Maystro
- Go to Store Dashboard → Click "Connect to Maystro"
- Click "Create Account" → Opens Maystro registration (verify in new tab)
- OR click "Login to Account" → Opens Maystro login (verify in new tab)
- Enter valid API token from Maystro team
- Click "Connect"

Expected:
- Success message, integration status shows "Connected"
- `seller_shipping` table has encrypted token for your store

### Test Disconnect
- Click "Disconnect" button
- Confirm disconnect

Expected:
- Success message, integration status shows "Disconnected"
- Token removed from `seller_shipping` table

### Test Edge Function Logs
- Check Supabase Dashboard → Edge Functions → connect-maystro logs

Expected:
- See request logs with storeId, successful encryption and database upsert

## Phase 2: Order Creation Testing

### Create Order in Maystro
- Have at least one approved order in your store
- Go to Store Dashboard → Orders table
- Find order without Maystro integration
- Click "Create in Maystro" button

Expected:
- Order created in Maystro API
- `orders.maystro_order_id` populated
- `orders.maystro_display_id` populated
- Orders table refreshes showing Maystro status

### Verify Order Details
- Check order row shows Maystro badge/status
- Click "View Status History"

Expected:
- Modal shows status timeline with initial status

## Phase 3: Webhook Testing

### Configure Webhook in Maystro Dashboard
- Go to Maystro web app → Settings → Webhooks
- Add webhook endpoint: https://your-backend-url.com/webhooks/maystro
- Select trigger: "All" or specific events (orderCreated, OrderStatusChanged)

Expected:
- Webhook created and active in Maystro

### Test Webhook Reception
- Trigger a status change in Maystro (or use test webhook feature)
- Check backend logs at /webhooks/maystro

Expected:
- POST request received with base64-encoded payload
- Decoded successfully (decode twice per Maystro docs)
- Event parsed: orderCreated or OrderStatusChanged
- Order status updated in database
- Entry added to order_status_logs table

### Test Webhook Payload Parsing
- Use Maystro test endpoint: POST /api/stores/hooks/test/request/

Expected:
- Test payload received and decoded correctly

## Phase 4: Status Synchronization Testing

### Manual Status Change Test
- Update order status in Maystro dashboard
- Wait for webhook or polling interval (30 seconds)
- Check Store Dashboard orders table

Expected:
- Order status updated, maystro_status_code column reflects new status

### Status History Verification
- Click "View Status History" on an order

Expected:
- Timeline shows all status changes with timestamps, source (webhook/polling), old/new status values

### Polling Fallback Test (if webhooks fail)
- Temporarily disable webhook endpoint
- Enable polling: POST /api/error-handling/start-polling
- Wait for polling cycle

Expected:
- Orders sync via polling, status updates appear

## Phase 5: Notification Testing

### Test Notification Settings
- Go to Notification Settings component
- Toggle notification preferences (order confirmation, shipped, delivered, etc.)

Expected:
- Settings saved (localStorage for now)

### Test Manual Notification
- Click "Send Test Notification"

Expected:
- Email sent via Resend, success message shown

### Test Automatic Notifications
- Trigger status change that should send notification (e.g., order shipped)

Expected:
- Email sent to customer
- Respects notification settings (if disabled, email not sent)

## Phase 6: Error Handling Testing

### Test Webhook Error Logging
- Send invalid webhook payload to /webhooks/maystro
- Check /api/error-handling/webhook-logs

Expected:
- Error logged with details, error type and metadata captured

### Test Retry Mechanism
- Create failed webhook event (e.g., temporarily break database connection)
- Check dead_letter_queue table
- Click "Retry" on failed item

Expected:
- Retry executed with exponential backoff, eventually succeeds

### Test DLQ Management
- Go to Webhooks admin page (Admin only)
- View Dead Letter Queue

Expected:
- Shows failed webhooks with retry counts, last error messages

## Phase 7: Order Cancellation Testing

### Cancel Order in Maystro
- Find order that exists in Maystro
- Click "Cancel in Maystro" button

Expected:
- Order cancelled via Maystro API
- Status updated to cancelled
- Customer notification sent (if enabled)



