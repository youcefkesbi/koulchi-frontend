# Enhanced Store System

A comprehensive store creation and management system with pack-based features, verification requirements, and employee review workflows.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase CLI
- Supabase project

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Deploy database schema:**
   ```bash
   chmod +x deploy-store-system.sh
   ./deploy-store-system.sh
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── EnhancedStoreCreation.vue    # New 4-step store creation
│   ├── VerificationManager.vue      # Verification document management
│   └── StoreManagement.vue          # Updated store management
├── views/
│   ├── EmployeeDashboard.vue        # Employee review dashboard
│   └── AdminDashboard.vue           # Admin management dashboard
├── stores/
│   ├── pack.js                      # Pack and feature management
│   ├── verification.js              # Verification management
│   └── store.js                     # Enhanced store management
└── database/
    ├── migration_store_system.sql   # Complete database migration
    ├── packs_table.sql              # Packs table schema
    ├── features_table.sql           # Features table schema
    ├── verifications_table.sql      # Verifications table schema
    └── audit_logs_table.sql         # Audit logs table schema
```

## 🎯 Key Features

### Pack System
- **Basic Pack (Free)**: 150 announcements, 300 images, external buttons
- **Pro Pack (1000 DZD)**: 3000 announcements, 6000 images, full customization

### Verification System
- Document upload and management
- Employee review workflow
- Status tracking (pending/approved/rejected)

### Review System
- Employee dashboard for reviewing stores/products
- Admin dashboard for full system control
- Audit logging for all actions

### Store Customization
- Logo and banner uploads (Pro Pack)
- Color customization
- External button integration
- Location management

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Storage Buckets
VITE_STORAGE_BUCKET_VERIFICATIONS=verification-documents
VITE_STORAGE_BUCKET_STORE_LOGOS=stores-logos
VITE_STORAGE_BUCKET_STORE_BANNERS=stores-banners
```

### Database Setup

1. **Run migration:**
   ```sql
   \i database/migration_store_system.sql
   ```

2. **Create storage buckets:**
   ```bash
   supabase storage create verification-documents --public false
   supabase storage create stores-logos --public true
   supabase storage create stores-banners --public true
   ```

3. **Set up storage policies:**
   ```sql
   -- See deploy-store-system.sh for complete policies
   ```

## 🎨 Usage Examples

### Store Creation Flow

```vue
<template>
  <EnhancedStoreCreation />
</template>

<script setup>
import EnhancedStoreCreation from '@/components/EnhancedStoreCreation.vue'
</script>
```

### Verification Management

```vue
<template>
  <VerificationManager />
</template>

<script setup>
import VerificationManager from '@/components/VerificationManager.vue'
</script>
```

### Employee Dashboard

```vue
<template>
  <EmployeeDashboard />
</template>

<script setup>
import EmployeeDashboard from '@/views/EmployeeDashboard.vue'
</script>
```

### Using Pack Store

```javascript
import { usePackStore } from '@/stores/pack'

const packStore = usePackStore()

// Fetch available packs
await packStore.fetchPacks()

// Check if pack has feature
const hasLogo = packStore.hasFeature(packId, 'store_logo')

// Get store creation requirements
const requirements = await packStore.getStoreCreationRequirements('Pro Pack')
```

### Using Verification Store

```javascript
import { useVerificationStore } from '@/stores/verification'

const verificationStore = useVerificationStore()

// Upload verification document
await verificationStore.uploadVerification('id_card', file)

// Check if user can create store
const canCreate = await verificationStore.hasRequiredVerifications(userId, 'Pro Pack')
```

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Employees can view pending items
- Admins have full access

### File Upload Security
- Image type validation
- File size limits (5MB)
- Secure storage with access controls

### Audit Logging
- All employee actions logged
- Immutable audit trail
- IP address and user agent tracking

## 📊 Database Schema

### Core Tables

#### `packs`
```sql
CREATE TABLE packs (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  max_announcements INTEGER NOT NULL,
  max_images INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

#### `features`
```sql
CREATE TABLE features (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

#### `verifications`
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  verification_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ
);
```

#### `stores` (Enhanced)
```sql
ALTER TABLE stores ADD COLUMN pack_id UUID REFERENCES packs(id);
ALTER TABLE stores ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE stores ADD COLUMN location TEXT;
ALTER TABLE stores ADD COLUMN external_buttons JSONB DEFAULT '[]';
ALTER TABLE stores ADD COLUMN customization_settings JSONB DEFAULT '{}';
```

## 🚀 Deployment

### Frontend Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform:**
   ```bash
   # Example for Vercel
   vercel --prod
   ```

### Database Deployment

1. **Run the deployment script:**
   ```bash
   ./deploy-store-system.sh
   ```

2. **Verify deployment:**
   ```bash
   supabase db ping --linked
   ```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📈 Monitoring

### Key Metrics
- Store creation success rate
- Verification approval rate
- Employee review response time
- System performance metrics

### Logs
- Application logs in browser console
- Database logs in Supabase dashboard
- Audit logs in `audit_logs` table

## 🔧 Troubleshooting

### Common Issues

#### Store Creation Fails
- Check user authentication
- Verify pack selection
- Ensure required verifications are uploaded
- Check pack limits

#### Verification Upload Fails
- Verify file type and size
- Check storage bucket permissions
- Ensure user is authenticated

#### Review Process Issues
- Check employee permissions
- Verify RLS policies
- Check audit log function

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true')
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the troubleshooting guide
- Open an issue on GitHub
- Contact the development team

## 🔄 Changelog

### v2.0.0 - Enhanced Store System
- Added pack-based store creation
- Implemented verification system
- Added employee review workflow
- Created admin dashboard
- Added audit logging
- Enhanced security with RLS

### v1.0.0 - Initial Release
- Basic store creation
- Simple store management
- User authentication

## 🎯 Roadmap

### Upcoming Features
- Store upgrade path (Basic → Pro)
- Advanced customization options
- Bulk verification processing
- Automated review workflows
- Analytics dashboard
- Mobile app integration

### Performance Improvements
- Database query optimization
- Image compression
- CDN integration
- Caching strategies

---

**Built with ❤️ using Vue.js, Supabase, and modern web technologies.**
