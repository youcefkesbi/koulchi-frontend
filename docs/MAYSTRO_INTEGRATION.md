# Maystro Delivery Integration (Combined Frontend + Backend Flow)

This document describes the implemented Maystro Delivery integration in Koulchi, combining both frontend and backend flows. Products remain managed in Supabase; Maystro is used only for delivery logistics (order creation/cancellation and status sync).

Key decisions:
- One token per store (no global token). Stored encrypted.
- Products are not synced to Maystro. Orders are optionally created in Maystro when the store connects.
- Phase 5 (analytics) removed. Phase 3 notification logs table removed to keep it minimal.

## Architecture

```
Frontend (Vue + Pinia)
  ├─ MaystroIntegration.vue (connect/disconnect + status)
  ├─ StoreDashboard.vue (orders table + Maystro actions + polling)
  ├─ OrderStatusHistoryModal.vue (status timeline)
  └─ NotificationSettings.vue (preferences + test)

Backend (Node.js + Express)
  ├─ routes/maystro.js → controllers/maystroOrderController.js (create/cancel orders)
  ├─ routes/webhooks.js → controllers/webhookController.js (receive/process Maystro webhooks)
  ├─ routes/errorHandling.js → controllers/errorHandlingController.js (retry, DLQ, polling)
  └─ routes/notifications.js → controllers/notificationController.js (send emails via Resend)

Database (Postgres/Supabase)
  ├─ orders (augmented: maystro_* columns)
  ├─ order_status_logs (history)
  ├─ webhook_errors (errors)
  ├─ webhook_logs, dead_letter_queue (retry + DLQ)
  └─ seller_shipping (encrypted Maystro token by store)

Supabase Edge Functions
  ├─ connect-maystro (store encrypted apiToken)
  └─ disconnect-maystro (remove credentials)
```

## Phases (implemented)

### Phase 1: Webhook Infrastructure
- Endpoint: `POST /webhooks/maystro` to receive Maystro events.
- Base64 decode twice per docs; parse events: `orderCreated`, `OrderStatusChanged` (primary).
- Webhook config endpoints (backend) exist but UI is not exposed; configuration is done in Maystro dashboard.

### Phase 2: Status Synchronization
- DB: `order_status_logs`, `webhook_errors`, and extra `orders` columns: `maystro_order_id`, `maystro_display_id`, `maystro_status_code`, `maystro_last_update`, plus related indexes.
- Controller: maps Maystro numeric codes → internal statuses and validates transitions.
- Retry logic with exponential backoff; failed events go to `dead_letter_queue`.
- Monitoring endpoints provide status history, error summaries, and consistency checks.

### Phase 3: Customer Notifications
- Email via Resend on key status changes: confirmation, shipped, delivered, cancelled.
- No `notification_logs` table (removed per optimization). History endpoint responds with 204.
- Frontend allows manual sends (respecting settings).

### Phase 4: Error Handling & Retry (Minimal)
- Services: `retryService`, `pollingService` for fallback when webhooks fail.
- Tables: `webhook_logs`, `dead_letter_queue`.
- Admin page to monitor logs, retry DLQ items, and start/stop polling.

### Phase 5: Delivery Analytics
- Removed (Maystro provides dashboard). All related code and tables are deleted.

## Frontend Flow

### Components

1) MaystroIntegration.vue (`src/components/MaystroIntegration.vue`)
- Toggle enable/disable.
- Connect with a single `apiToken` (instructions explain how to get it from Maystro team).
- Uses Edge Functions: `connect-maystro` (encrypt + store), `disconnect-maystro`.
- Shows connection status, badges, and warnings when disabled.

2) StoreDashboard.vue (`src/views/StoreDashboard.vue`)
- Orders table for the store with filters and status control.
- Maystro columns and actions:
  - Shows whether order exists in Maystro and the `display_id` if available.
  - Action buttons:
    - Create in Maystro (calls backend `POST /api/maystro/orders`).
    - Cancel in Maystro (calls backend `POST /api/maystro/orders/cancel`).
    - View Status History (opens modal).
- Real-time polling every 30s to refresh.
- Loads per-order Maystro details from the `orders` table cache.

3) OrderStatusHistoryModal.vue (`src/components/OrderStatusHistoryModal.vue`)
- Timeline view of `order_status_logs` (source + old/new status + timestamp).
- Uses RPC `get_order_status_history(order_uuid)`.

4) NotificationSettings.vue (`src/components/NotificationSettings.vue`)
- Per-store preferences (localStorage for now): enable/disable notifications per type.
- Test notification button calls `POST /api/notifications/test`.
- Exposes `isNotificationEnabled(type)` for other components.

5) Webhooks.vue (`src/views/Webhooks.vue`) — Admin only
- Shows recent webhook logs (`GET /api/error-handling/webhook-logs`).
- Shows `dead_letter_queue` with per-item Retry (`POST /api/error-handling/retry-webhook`).
- Start/Stop polling (`POST /api/error-handling/start-polling|stop-polling`).
- Summary cards with retry stats and polling state.

### i18n
- All messages added to `locales/en.json`, `locales/fr.json`, `locales/ar.json`.
- Includes Maystro integration labels, orders actions, status history, and notifications.

## Backend Flow

### Controllers and Routes

1) Webhooks
- Route: `POST /webhooks/maystro` → `webhookController.processWebhook`.
- Decodes payload, resolves event type, maps statuses, validates transitions.
- Persists status updates to `orders` and inserts into `order_status_logs`.
- On unknown/invalid transitions or failures, logs to `webhook_errors` and/or `webhook_logs` and uses retry.

2) Orders → Maystro
- Route: `POST /api/maystro/orders` → create order in Maystro using store token.
- Route: `POST /api/maystro/orders/cancel` → cancel order in Maystro.
- Uses per-store token from `seller_shipping` (encrypted apiToken) and maps platform order data to Maystro payload.

3) Error Handling
- Routes under `/api/error-handling/*`:
  - `process-webhook`, `retry-webhook`, `retry-stats`, `webhook-logs`, `dead-letter-queue`, `start-polling`, `stop-polling`, `polling-status`.
- Implements exponential backoff and dead letter queue.

4) Notifications
- Routes under `/api/notifications/*`:
  - `order-confirmation`, `order-shipped`, `order-delivered`, `order-cancelled`, `urgent-delivery`, `test`.
- Service integrates with Resend. No database logging by design.

### Database

Phase 2 (Status sync):
- `order_status_logs(order_id, old_status, new_status, maystro_status_code, maystro_order_id, triggered_by, created_at)` + indexes.
- `webhook_errors(order_id, error_type, error_data, created_at)` + indexes.
- `orders` augmented columns: `maystro_order_id`, `maystro_display_id`, `maystro_status_code`, `maystro_last_update`, plus cancellation/alert fields.

Phase 4 (Retry & DLQ):
- `webhook_logs` (attempts, success/failure, metadata) and `dead_letter_queue`.

Credentials:
- `seller_shipping` holds encrypted Maystro token per store (`provider='maystro'`, `access_token` encrypted).
- Stored by Supabase Edge Function `connect-maystro` using AES-GCM and validated JWT.

RLS:
- Policies allow buyers to view their own orders and store owners to view order logs for their stores; admins see errors.

## Security

Credentials
- AES-GCM encryption in `connect-maystro` Edge Function (single field `apiToken`).
- Only store owners can create/update their integration row.

Webhooks
- Defensive parsing and validation of payloads.
- Idempotency ensured via update checks and status transition validation.

API Access
- All backend routes require Supabase JWT in `Authorization: Bearer <token>`.
- CORS restricted to frontend origin.

## Frontend ↔ Backend Data Flow (Core Paths)

1) Connect Maystro
- UI submits `apiToken` → Edge Function `connect-maystro` → encrypt + store in `seller_shipping` → UI reflects enabled state.

2) Create Order in Maystro (manual action)
- UI calls `POST /api/maystro/orders` with `orderId, storeId` → backend reads store token → calls Maystro Orders API → stores `maystro_order_id` and `display_id` back in `orders` → UI refreshes.

3) Status Sync (webhook-first, polling fallback)
- Maystro sends webhook → `/webhooks/maystro` updates `orders` and logs status → triggers notifications via controller → UI polling reflects latest.
- If webhooks fail, polling service periodically syncs.

4) Notifications
- On key transitions, `notificationController` sends emails via Resend.
- UI can send manual notifications, respecting `NotificationSettings` preferences.

## What We Do NOT Build

- Phase 5 analytics (removed; rely on Maystro dashboard).
- Webhook configuration UI (configured in Maystro; we process incoming webhooks only).
- Notification history database (removed to reduce complexity).

## Setup Notes

Environment
- Backend default port: 4000. Frontend uses `VITE_API_URL` to call backend.
- Resend requires `RESEND_API_KEY` and a sender `FROM_EMAIL`.

Deployment
- Edge Functions deploy script: `./deploy-maystro-functions.sh` for connect/disconnect only.
- Backend Node server exposes all Maystro integration endpoints.

## Troubleshooting

- 401 from backend: ensure Supabase session exists and token is forwarded in `Authorization`.
- Webhooks not updating: check `/api/error-handling/webhook-logs` and DLQ; enable polling if needed.
- Maystro order create fails: verify store’s Maystro token exists (via `connect-maystro`) and payload matches Maystro docs (wilaya/commune, products, etc.).

## References (Code)

- Frontend: `src/components/MaystroIntegration.vue`, `src/views/StoreDashboard.vue`, `src/components/OrderStatusHistoryModal.vue`, `src/components/NotificationSettings.vue`, `src/views/Webhooks.vue`.
- Backend: `controllers/{webhookController, maystroOrderController, notificationController, errorHandlingController}.js`, `routes/{webhooks, maystro, notifications, errorHandling}.js`, `server.js`.
- Database SQL: `database/status_sync_tables.sql`, `database/webhook_logs_table.sql`.

## Monitoring & Logging

### Edge Function Logs

- All function calls are logged
- Error details are captured
- Performance metrics are tracked

### Database Monitoring

- Integration status tracking
- Token expiry monitoring
- Usage analytics

## Future Enhancements

### Planned Features

1. **Token Refresh**: Automatic token refresh before expiry
2. **Webhook Integration**: Real-time delivery status updates
3. **Analytics Dashboard**: Integration usage statistics
4. **Bulk Operations**: Multiple delivery management
5. **API Rate Limiting**: Smart rate limiting for API calls

### Integration Extensions

1. **Multiple Providers**: Support for other delivery services
2. **Advanced Routing**: Intelligent delivery route optimization
3. **Cost Optimization**: Delivery cost analysis and recommendations

## Troubleshooting

### Common Issues

1. **Function Deployment Failures**: Check Supabase CLI version and project link
2. **Encryption Errors**: Verify environment variable format and length
3. **Authentication Failures**: Check JWT token validity and expiration
4. **Database Errors**: Verify table creation and RLS policies

### Debug Mode

Enable debug logging by setting environment variables:
```bash
SUPABASE_DEBUG=true
```

## Support

For technical support or questions about the Maystro integration:

1. **Documentation**: Check this file and related README files
2. **Code Issues**: Review the implementation in the source files
3. **Deployment Issues**: Use the deployment script and verify prerequisites
4. **Security Concerns**: Review the security implementation section

## License

This integration is part of the Koulchi e-commerce platform and follows the same licensing terms.
