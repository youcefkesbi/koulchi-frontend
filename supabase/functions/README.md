# Maystro Integration Edge Functions

This directory contains Supabase Edge Functions for integrating with Maystro Delivery services.

## Functions

### 1. `connect-maystro`

Connects a seller's account to Maystro by storing encrypted credentials.

**Endpoint:** `POST /functions/v1/connect-maystro`

**Request Body:**
```json
{
  "accountId": "string",
  "accessToken": "string", 
  "refreshToken": "string",
  "expiresAt": "string (ISO date)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maystro integration connected successfully",
  "data": {
    "id": "uuid",
    "account_id": "string",
    "enabled": true
  }
}
```

### 2. `disconnect-maystro`

Removes a seller's Maystro integration.

**Endpoint:** `DELETE /functions/v1/disconnect-maystro`

**Response:**
```json
{
  "success": true,
  "message": "Maystro integration disconnected successfully"
}
```

## Environment Variables

Set these environment variables in your Supabase project:

```bash
# Required
MAYSTRO_ENCRYPTION_SECRET=your-32-character-secret-key

# Already set by Supabase
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Features

- **Token Encryption**: Access and refresh tokens are encrypted using AES-GCM before storage
- **JWT Verification**: All requests must include a valid JWT token
- **Row Level Security**: Database operations respect RLS policies
- **Service Role Access**: Functions use service role key for database operations

## Deployment

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Deploy functions:
```bash
supabase functions deploy connect-maystro
supabase functions deploy disconnect-maystro
```

4. Set environment variables:
```bash
supabase secrets set MAYSTRO_ENCRYPTION_SECRET=your-secret-key
```

## Database Schema

The functions work with the `seller_integrations` table:

```sql
create table seller_integrations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  provider text not null,
  account_id text,
  access_token text,      -- encrypted
  refresh_token text,     -- encrypted
  expires_at timestamptz,
  enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Usage Example

```typescript
// Connect to Maystro
const { data, error } = await supabase.functions.invoke('connect-maystro', {
  body: {
    accountId: 'maystro_account_123',
    accessToken: 'access_token_here',
    refreshToken: 'refresh_token_here',
    expiresAt: '2024-12-31T23:59:59Z'
  }
})

// Disconnect from Maystro
const { data, error } = await supabase.functions.invoke('disconnect-maystro')
```

## Error Handling

All functions return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error scenarios:
- Missing or invalid JWT token
- Missing required fields in request body
- Database operation failures
- Missing environment variables
