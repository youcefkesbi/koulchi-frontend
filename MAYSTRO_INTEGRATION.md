# Maystro-Delivery Integration

This document describes the complete implementation of the Maystro-Delivery integration flow for the Koulchi e-commerce platform.

## Overview

The Maystro integration allows sellers to connect their stores to Maystro's delivery services, enabling automated delivery management. The integration includes:

- **Frontend Component**: Vue.js component with toggle and modal interfaces
- **Backend Functions**: Supabase Edge Functions for secure credential management
- **Database Integration**: Encrypted storage of API tokens with Row Level Security
- **Security**: End-to-end encryption of sensitive credentials

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vue.js Frontend │    │  Supabase Client │    │ Supabase Edge   │
│                 │    │                  │    │   Functions     │
│ MaystroIntegration│◄──►│  MaystroClient  │◄──►│ connect-maystro │
│   Component     │    │   Utility Class  │    │ disconnect-     │
└─────────────────┘    └──────────────────┘    │   maystro       │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Supabase      │
                                               │   Database      │
                                               │                 │
                                               │ seller_         │
                                               │ integrations    │
                                               │   table         │
                                               └─────────────────┘
```

## Components

### 1. MaystroIntegration.vue

**Location**: `src/components/MaystroIntegration.vue`

**Features**:
- Toggle switch for enabling/disabling integration
- Connection modal with options to create or login to Maystro account
- Credentials input form for API tokens
- Integration status display
- Management options for connected accounts

**Key Methods**:
- `handleToggle()`: Manages the enable/disable toggle
- `createAccount()`: Opens Maystro registration page
- `loginAccount()`: Opens Maystro login page
- `submitCredentials()`: Sends credentials to Edge Function
- `disconnect()`: Removes the integration

### 2. MaystroClient.js

**Location**: `src/lib/maystro.js`

**Features**:
- Utility class for all Maystro-related operations
- Methods for CRUD operations on integrations
- Token expiry validation
- Error handling and logging

**Key Methods**:
- `getIntegration()`: Fetch current integration status
- `connect(credentials)`: Connect to Maystro
- `disconnect()`: Remove integration
- `updateStatus(enabled)`: Toggle integration on/off
- `isEnabled()`: Check if integration is active and valid

## Database Schema

### seller_integrations Table

```sql
create table seller_integrations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  provider text not null, -- e.g. 'maystro'
  account_id text,        -- seller's Maystro account ID
  access_token text,      -- encrypted, stored via Edge Function
  refresh_token text,     -- encrypted, stored via Edge Function
  expires_at timestamptz, -- Maystro token expiry
  enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure each seller has only one Maystro integration
create unique index uniq_seller_provider
on seller_integrations (seller_id, provider);

-- Row Level Security
alter table seller_integrations enable row level security;

create policy "Sellers can manage their own integrations"
on seller_integrations
for all
using (auth.uid() = seller_id);
```

## Edge Functions

### 1. connect-maystro

**Location**: `supabase/functions/connect-maystro/index.js`

**Purpose**: Securely stores encrypted Maystro credentials

**Input**:
```json
{
  "accountId": "string",
  "accessToken": "string",
  "refreshToken": "string",
  "expiresAt": "string (ISO date)"
}
```

**Security Features**:
- JWT token verification
- AES-GCM encryption of sensitive tokens
- Row Level Security enforcement
- Input validation

### 2. disconnect-maystro

**Location**: `supabase/functions/disconnect-maystro/index.js`

**Purpose**: Removes the seller's Maystro integration

**Security Features**:
- JWT token verification
- Secure deletion of integration data
- Row Level Security enforcement

## Security Implementation

### Token Encryption

- **Algorithm**: AES-GCM (Galois/Counter Mode)
- **Key**: 32-character secret stored in environment variables
- **IV**: Random 12-byte initialization vector for each encryption
- **Storage**: Encrypted tokens stored in base64 format

### Authentication

- **JWT Verification**: All Edge Function calls require valid JWT tokens
- **User Isolation**: Sellers can only access their own integration data
- **Service Role**: Edge Functions use service role key for database operations

### Data Protection

- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive validation of all input parameters
- **Error Handling**: Secure error messages without exposing sensitive information

## Installation & Deployment

### Prerequisites

1. **Supabase CLI**: `npm install -g supabase`
2. **Project Link**: `supabase link --project-ref YOUR_PROJECT_REF`
3. **Environment Variables**: Set encryption secret

### Deployment Steps

1. **Deploy Functions**:
   ```bash
   ./deploy-maystro-functions.sh
   ```

2. **Set Environment Variables**:
   ```bash
   supabase secrets set MAYSTRO_ENCRYPTION_SECRET=your-32-character-secret
   ```

3. **Verify Deployment**:
   - Check Supabase dashboard for deployed functions
   - Test function endpoints
   - Verify database table creation

### Environment Variables

```bash
# Required
MAYSTRO_ENCRYPTION_SECRET=your-32-character-secret-key

# Already set by Supabase
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Usage Flow

### 1. Initial Connection

1. Seller navigates to Selling Dashboard
2. Clicks "Enable Maystro-Delivery" toggle
3. Modal appears with connection options
4. Seller chooses to create account or login
5. Maystro website opens in new tab
6. Seller obtains API credentials
7. Seller returns to enter credentials
8. Credentials are encrypted and stored
9. Integration is enabled

### 2. Daily Operations

1. Toggle controls integration status
2. Integration automatically checks token expiry
3. Expired tokens disable integration
4. Seller can manage account settings
5. Disconnect option removes all data

### 3. Disconnection

1. Seller clicks "Disconnect" button
2. Confirmation dialog appears
3. Integration data is completely removed
4. Toggle returns to disabled state

## Internationalization

The integration supports three languages:

- **English**: Primary language with full translations
- **French**: Complete French translations
- **Arabic**: Complete Arabic translations with RTL support

Translation keys are organized under the `maystro` namespace in each locale file.

## Error Handling

### Frontend Errors

- **Network Errors**: Graceful fallback with user-friendly messages
- **Validation Errors**: Form validation with clear error messages
- **API Errors**: Error handling for all Edge Function calls

### Backend Errors

- **Authentication Errors**: Clear messages for invalid tokens
- **Validation Errors**: Detailed validation failure messages
- **Database Errors**: Logged errors with user-friendly responses

## Testing

### Manual Testing

1. **Connection Flow**: Test complete connection process
2. **Toggle Functionality**: Test enable/disable toggle
3. **Error Scenarios**: Test with invalid credentials
4. **Disconnection**: Test complete removal process

### Automated Testing

- Unit tests for utility functions
- Integration tests for Edge Functions
- E2E tests for complete user flows

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
