# OAuth Setup Guide for Supabase

## Prerequisites
You already have the OAuth credentials in your `.env` file:
- Google OAuth: ✅ Configured
- Facebook OAuth: ✅ Configured

## Step 1: Configure OAuth Providers in Supabase Dashboard

### Google OAuth Setup
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Configure the following:
   - **Client ID**: `522429256575-lkik8efr4iq376t8u71h69ginvg3ksp0.apps.googleusercontent.com`
   - **Client Secret**: `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`
   - **Redirect URL**: `https://dngrxmydwffmfkgtivyh.supabase.co/auth/v1/callback`

### Facebook OAuth Setup
1. In the same **Authentication** → **Providers** section
2. Find **Facebook** and click **Enable**
3. Configure the following:
   - **Client ID**: `1288595439648695`
   - **Client Secret**: `b7f3b7d614ded31fd7b6738b99cb2382`
   - **Redirect URL**: `https://dngrxmydwffmfkgtivyh.supabase.co/auth/v1/callback`
4. **Important**: Make sure to add the `email` and `public_profile` scopes in your Facebook app settings

## Step 2: Configure OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Add these **Authorized redirect URIs**:
   ```
   https://dngrxmydwffmfkgtivyh.supabase.co/auth/v1/callback
   http://localhost:3000
   ```

## Step 3: Configure OAuth in Facebook Developers

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **Facebook Login** → **Settings**
4. Add these **Valid OAuth Redirect URIs**:
   ```
   https://dngrxmydwffmfkgtivyh.supabase.co/auth/v1/callback
   http://localhost:3000
   ```

## Step 4: Test OAuth Login

1. Start your development server: `npm run dev`
2. Click the **Login** button in your header
3. Try both Google and Facebook login buttons
4. You should be redirected to the OAuth provider's login page
5. After successful authentication, you'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Supabase matches exactly with what's configured in Google/Facebook
   - Check for trailing slashes or typos

2. **"Client ID not found" error**
   - Verify the Client ID and Secret are correct in Supabase
   - Ensure the OAuth provider is enabled in Supabase

3. **"Redirect URI mismatch" error**
   - Double-check the redirect URIs in both Google Cloud Console and Facebook Developers
   - Make sure they match exactly with Supabase configuration

4. **OAuth not working in development**
   - Add `http://localhost:3000` to your OAuth provider's redirect URIs
   - This allows testing OAuth locally

### Testing OAuth Locally:

For local development, you can also use:
```
http://localhost:3000
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your OAuth secrets secure
- Use environment variables for all sensitive data
- Consider using different OAuth apps for development and production

## Next Steps

After OAuth is working:
1. Test user registration and login
2. Verify user profiles are created in Supabase
3. Test the "Post Announcement" functionality for authenticated users
4. Ensure proper role-based access control

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify OAuth provider configurations
3. Test with a simple OAuth flow first
4. Check browser console for any JavaScript errors
