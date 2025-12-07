# Store System Enhancement Documentation

## Overview

This document outlines the enhanced store creation system with pack-based features, verification requirements, and employee review workflows.

## System Architecture

### Database Schema

#### New Tables

1. **packs** - Store pack definitions (Basic Pack, Pro Pack)
2. **features** - Individual features that can be enabled/disabled
3. **pack_features** - Junction table linking packs to their features
4. **verifications** - User verification documents and status
5. **audit_logs** - Employee action logging for compliance

#### Updated Tables

1. **stores** - Enhanced with pack_id, status, review fields, and customization options

### Pack System

#### Basic Pack (Free)
- Max: 150 product announcements
- Storage: 300 images
- No store name, logo, or banner
- Location: single large input (3 lines)
- External buttons (WhatsApp, Telegram, etc.)
- Required verifications: ID card, driving license, or passport

#### Pro Pack (1000 DZD)
- Max: 3,000 product announcements
- Storage: 6,000 images
- Store logo + banner
- Color customization
- All Basic Pack features
- Required verifications: ID card, driving license, passport, commerce register, payment receipt

### Verification System

#### Document Types
- **id_card** - National ID card
- **driving_license** - Driving license
- **passport** - Passport
- **commerce_register** - Commerce register document
- **payment_receipt** - BaridiMob payment receipt

#### Verification Status
- **pending** - Awaiting employee review
- **approved** - Verified and accepted
- **rejected** - Rejected with reason

### Review System

#### Employee Dashboard
- Pending stores review
- Pending products review
- Pending verifications review
- Approve/reject with reasons

#### Admin Dashboard
- Full system control
- User management
- Store management
- Pack management
- Audit logs viewing

## API Endpoints

### Store Creation
```javascript
POST /api/stores
{
  "pack_id": "uuid",
  "name": "Store Name", // Only for Pro Pack
  "description": "Store description",
  "location": "Store location",
  "external_buttons": [
    { "platform": "WhatsApp", "url": "https://wa.me/..." }
  ],
  "customization_settings": {
    "primary_color": "#3B82F6"
  }
}
```

### Verification Upload
```javascript
POST /api/verifications
{
  "verification_type": "id_card",
  "document": "file"
}
```

### Employee Actions
```javascript
POST /api/stores/{id}/approve
POST /api/stores/{id}/reject
{
  "reason": "Rejection reason"
}
```

## Frontend Components

### Enhanced Store Creation
- **File**: `src/components/EnhancedStoreCreation.vue`
- **Features**: 4-step process with pack selection, verification upload, store info, and review

### Verification Manager
- **File**: `src/components/VerificationManager.vue`
- **Features**: Upload, view, and manage verification documents

### Employee Dashboard
- **File**: `src/views/EmployeeDashboard.vue`
- **Features**: Review pending stores, products, and verifications

### Admin Dashboard
- **File**: `src/views/AdminDashboard.vue`
- **Features**: Full system management and monitoring

## Store Management

### Pinia Stores

#### Pack Store (`src/stores/pack.js`)
- Pack and feature management
- Pack limit checking
- Feature availability

#### Verification Store (`src/stores/verification.js`)
- Verification upload and management
- Status tracking
- Requirement checking

#### Enhanced Store Store (`src/stores/store.js`)
- Updated with pack integration
- Verification requirement checking
- Status management

## Security & Permissions

### Row Level Security (RLS)
- Users can only access their own data
- Employees can view all pending items
- Admins have full access
- Audit logs are immutable

### File Upload Security
- Image type validation
- File size limits (5MB)
- Secure storage buckets
- Access control policies

## Migration Guide

### Database Migration
1. Run the migration script: `database/migration_store_system.sql`
2. Create storage buckets for verification documents
3. Set up storage policies
4. Update existing stores with default pack assignment

### Frontend Updates
1. Replace `CreateStore.vue` with `EnhancedStoreCreation.vue`
2. Add new routes for employee and admin dashboards
3. Update navigation to include verification management
4. Add role-based access control

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Storage Buckets
VITE_STORAGE_BUCKET_VERIFICATIONS=verification-documents
VITE_STORAGE_BUCKET_STORE_LOGOS=stores-logos
VITE_STORAGE_BUCKET_STORE_BANNERS=stores-banners
```

## Deployment Checklist

### Supabase Setup
- [ ] Run database migration
- [ ] Create storage buckets
- [ ] Set up storage policies
- [ ] Configure RLS policies
- [ ] Test all functions

### Frontend Deployment
- [ ] Update environment variables
- [ ] Build and deploy frontend
- [ ] Test all user flows
- [ ] Verify role-based access

### Post-Deployment
- [ ] Create admin user accounts
- [ ] Set up employee accounts
- [ ] Test store creation flow
- [ ] Verify review process
- [ ] Monitor audit logs

## Monitoring & Maintenance

### Key Metrics
- Store creation success rate
- Verification approval rate
- Employee review response time
- System performance metrics

### Regular Tasks
- Monitor audit logs for suspicious activity
- Review rejected stores for patterns
- Update pack features as needed
- Clean up old verification documents

## Troubleshooting

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

### Support Contacts
- Database Issues: Check Supabase logs
- Frontend Issues: Check browser console
- Authentication Issues: Verify JWT tokens

## Future Enhancements

### Planned Features
- Store upgrade path (Basic → Pro)
- Advanced customization options
- Bulk verification processing
- Automated review workflows
- Analytics dashboard

### Scalability Considerations
- Database indexing optimization
- CDN for image storage
- Caching strategies
- Load balancing for high traffic

## API Reference

### Database Functions

#### `check_pack_limits(p_store_id, p_pack_id, p_announcement_count, p_image_count)`
Returns boolean indicating if pack limits are satisfied.

#### `get_store_creation_requirements(p_pack_name)`
Returns array of required verification types for a pack.

#### `can_user_create_store(p_user_id, p_pack_name)`
Returns boolean indicating if user can create store with given pack.

#### `log_employee_action(p_employee_id, p_action, p_target_type, p_target_id, p_details)`
Logs employee action for audit purposes.

### Storage Policies

#### Verification Documents
- Users can upload their own documents
- Employees can view all documents
- Documents are stored in `verification-documents` bucket

#### Store Images
- Store owners can upload logos and banners
- Public read access for approved stores
- Images stored in `stores-logos` and `stores-banners` buckets

## Testing

### Unit Tests
- Pack validation logic
- Verification requirement checking
- Store creation validation

### Integration Tests
- Complete store creation flow
- Employee review process
- Admin management functions

### End-to-End Tests
- User registration and verification
- Store creation and approval
- Pack upgrade process

## Performance Optimization

### Database
- Index on frequently queried columns
- Optimize RLS policies
- Use database functions for complex queries

### Frontend
- Lazy load components
- Optimize image uploads
- Implement caching strategies

### Storage
- Compress images before upload
- Use CDN for public assets
- Implement cleanup policies

## Security Best Practices

### Data Protection
- Encrypt sensitive data
- Use secure file uploads
- Implement proper access controls

### Authentication
- JWT token validation
- Session management
- Role-based permissions

### Audit Trail
- Log all employee actions
- Track data changes
- Monitor suspicious activity

## Conclusion

This enhanced store system provides a robust, scalable solution for managing store creation with proper verification, review workflows, and administrative controls. The modular design allows for easy extension and customization as business requirements evolve.
