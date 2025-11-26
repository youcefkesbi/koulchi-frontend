# Forgot Password Flow

## Phase 1 – Customer Initiation
1. Customer selects “Forgot password” on the login screen.
2. Enters their account email and submits the request.

## Phase 2 – Backend Validation & Throttling
1. Backend checks `auth.users` for the email.
2. Always respond with a success message to avoid account enumeration.
3. Apply IP/email rate limiting to prevent abuse.

## Phase 3 – Token Issuance
1. Generate a short-lived reset token (JWT or random string, ~30 min TTL).
2. Store the hashed token + expiry in a `password_reset_tokens` table (or use Supabase Auth helpers).
3. Capture metadata such as `user_id`, requester IP, and request timestamp.

## Phase 4 – Email Dispatch
1. Use `notificationService` (Resend) to send the “Reset your password” email.
2. Include a one-time link, e.g. `https://app.example.com/reset?token=XYZ`.
3. Log the email in notification/audit tables for traceability.

## Phase 5 – Token Verification
1. Customer clicks the link; frontend calls backend to validate the token.
2. Backend ensures the token exists, is not expired, and not already used.
3. Invalid tokens return “Link expired” and allow requesting a new one.

## Phase 6 – Password Update
1. User submits a new password (with confirmation).
2. Backend enforces password policy, then updates the password via Supabase Auth Admin API.
3. Invalidate existing sessions and mark the token as used.

## Phase 7 – Confirmation & Auditing
1. Show a success message with a link to log in.
2. Send a confirmation email (“Your password was changed”).
3. Record the event in monitoring/log tables (e.g., `status_monitoring`) for security auditing.

## Notes on Schema Alignment
- Credentials remain in `auth.users`; `profiles` (`full_name`, `shipping_address`, `phone_num`) stay untouched.
- Activity logs can reuse existing `notification_logs`, `error_handling`, or monitoring tables.
- Flow works for any role (`user_roles`) since password reset is user-centric.

