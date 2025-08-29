# Vercel SPA Configuration for Vue Router

This document verifies the configuration to fix the 404 refresh issue on Vercel by ensuring proper SPA fallback for Vue Router.

## 1. Vercel Configuration ✅

**File:** `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This configuration ensures that all unknown routes get redirected to the root `/` path, allowing Vue Router to handle client-side routing.

## 2. Vue Router Configuration ✅

**File:** `src/router/index.js`

The router is properly configured with:
- A catch-all route for unknown routes that shows the 404 component
- Proper locale handling for internationalized routes
- Authentication guards for protected routes

**Key catch-all route:**
```javascript
{
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: NotFound,
  meta: { 
    locale: 'en',
    requiresAuth: false 
  }
}
```

## 3. OAuth Redirect URLs ✅

**Files:** 
- `src/config/environment.js`
- `src/config/oauth.js`
- `src/lib/supabase.js`

**OAuth Callback Handling:** Supabase handles OAuth callbacks through its own fixed endpoint

**Supabase Configuration:**
```javascript
auth: {
  // Let Supabase handle OAuth callbacks through its own fixed endpoint
  flowType: 'pkce'
}
```

Supabase automatically handles OAuth redirects and callbacks, so no custom callback path configuration is needed in the frontend.

## 4. Environment Variables ✅

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_APP_URL` - Application URL (automatically detected on Vercel)

**Vercel Environment Detection:**
The app automatically detects Vercel deployment and uses the appropriate configuration.

## 5. How It Works

1. **User visits unknown route:** e.g., `/some/unknown/path`
2. **Vercel rewrite rule:** Redirects to `/` (index.html)
3. **Vue Router takes over:** Handles the route on the client side
4. **404 handling:** If no matching route exists, shows the NotFound component
5. **OAuth redirects:** Supabase handles OAuth callbacks through its own fixed endpoint

## 6. Testing

To verify the configuration works:

1. **Deploy to Vercel** with the updated configuration
2. **Test direct URL access:** Visit a route like `/products` directly in the browser
3. **Test refresh:** Refresh the page on any route
4. **Test OAuth:** Complete an OAuth flow and verify redirects work
5. **Test 404:** Visit a non-existent route and verify the 404 page appears

## 7. Troubleshooting

If issues persist:

1. **Clear Vercel cache:** Redeploy the application
2. **Check build output:** Ensure `dist` folder contains `index.html`
3. **Verify environment variables:** Check Vercel dashboard for correct values
4. **Check Supabase settings:** Ensure redirect URLs match the configured callback path

## 8. Additional Notes

- The configuration supports both development and production environments
- Locale-based routing is preserved with the SPA fallback
- Authentication flows remain intact
- 404 pages are properly localized
