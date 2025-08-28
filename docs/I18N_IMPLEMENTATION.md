# Internationalization (i18n) Implementation

This document describes the comprehensive internationalization setup for the Koulchi Frontend application.

## Overview

The i18n system provides:
- **French, English, and Arabic language support** with intelligent detection
- **Language prefixes in URLs** (e.g., `/fr`, `/en`, `/ar`) for SEO and shareable links
- **Automatic language detection** based on browser settings and localStorage
- **Persistent language preferences** using localStorage
- **RTL support** for Arabic language
- **Consistent language switching** across all pages and components

## Supported Languages

| Language | Code | Direction | Locale |
|----------|------|-----------|---------|
| French   | `fr` | LTR       | `fr-FR` |
| English  | `en` | LTR       | `en-US` |
| Arabic   | `ar` | RTL       | `ar-DZ` |

## Language Detection Priority

1. **localStorage** - User's saved preference
2. **Browser language** - Detected from `navigator.language`
3. **Default** - English (`en`) if browser language is not supported

## First Visit Behavior

On a user's first visit:

1. **Detect browser language** using `navigator.language`
2. **If supported language detected** (French, English, or Arabic):
   - Redirect to corresponding route: `/fr`, `/en`, or `/ar`
3. **If unsupported language detected**:
   - Default to English and redirect to `/en`

## Architecture

### 1. Core Files

- **`src/i18n.js`** - Main i18n configuration
- **`src/lib/i18n-utils.js`** - Utility functions for language management
- **`src/composables/useI18n.js`** - Vue composable for i18n functionality
- **`src/router/index.js`** - Router with language prefix support

### 2. URL Structure

All routes are automatically prefixed with the current language:

- `/fr` - French home page
- `/en/products` - English products page
- `/ar/profile` - Arabic profile page

## Usage

### Basic Translation

```vue
<template>
  <h1>{{ $t('welcome') }}</h1>
  <p>{{ $t('cartPage.title') }}</p>
</template>
```

### Using the Composable

```vue
<script setup>
import { useLocalizedI18n } from '@/composables/useI18n'

const { t, changeLanguage, currentLanguage } = useLocalizedI18n()

// Change language
await changeLanguage('en')

// Get localized route
const localizedPath = getLocalizedRoute('/products', 'en')
</script>
```

### Programmatic Navigation

```javascript
import { useLocalizedI18n } from '@/composables/useI18n'

const { navigateToLocalized } = useLocalizedI18n()

// Navigate to localized version of current page
await navigateToLocalized('/products')
```

## Language Switching

### Component Usage

```vue
<template>
  <LanguageSwitcher />
</template>

<script setup>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>
```

### Programmatic Switching

```javascript
import { useLocalizedI18n } from '@/composables/useI18n'

const { changeLanguage } = useLocalizedI18n()

// Switch to English
await changeLanguage('en')
```

## Adding New Languages

1. **Create locale file** in `locales/` directory
2. **Add language config** in `src/i18n.js`
3. **Update supported locales** in router configuration
4. **Add language name** to all locale files

### Example: Adding German

```javascript
// src/i18n.js
const languages = {
  fr: { name: 'Français', dir: 'ltr', locale: 'fr-FR' },
  en: { name: 'English', dir: 'ltr', locale: 'en-US' },
  ar: { name: 'العربية', dir: 'rtl', locale: 'ar-DZ' },
  de: { name: 'Deutsch', dir: 'ltr', locale: 'de-DE' } // New language
}
```

## RTL Support

Arabic language automatically sets:
- `document.documentElement.dir = 'rtl'`
- `document.documentElement.lang = 'ar'`

CSS classes are available for RTL-specific styling:

```css
/* src/assets/rtl.css */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}
```

## SEO and Meta Tags

The system automatically sets:
- `lang` attribute on `<html>` element
- `dir` attribute for RTL languages
- Language-specific URLs for better SEO

## Fallback Behavior

If a translation key is missing:
1. **Primary fallback** - English (`en`)
2. **Secondary fallback** - French (`fr`)
3. **Key display** - Shows the key name if no translation exists

## Testing

### Manual Testing

1. **Language switching** - Use the language switcher component
2. **URL persistence** - Refresh page and verify language is maintained
3. **Direct navigation** - Navigate directly to `/en/products` etc.
4. **Browser language** - Change browser language and reload
5. **First visit behavior** - Test with different browser language settings

### Testing First Visit Scenarios

- **French browser**: Should redirect to `/fr`
- **English browser**: Should redirect to `/en`
- **Arabic browser**: Should redirect to `/ar`
- **German browser**: Should redirect to `/en` (default)
- **Japanese browser**: Should redirect to `/en` (default)

### Automated Testing

```javascript
// Example test for language switching
import { useLocalizedI18n } from '@/composables/useI18n'

test('language switching updates locale', async () => {
  const { changeLanguage, locale } = useLocalizedI18n()
  
  await changeLanguage('en')
  expect(locale.value).toBe('en')
})
```

## Troubleshooting

### Common Issues

1. **Language not persisting** - Check localStorage permissions
2. **RTL not working** - Verify CSS is loaded and `dir` attribute is set
3. **Routes not working** - Ensure router is properly configured with language prefixes
4. **Wrong default language** - Check browser language detection logic

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('i18n:debug', 'true')
```

## Performance Considerations

- **Lazy loading** - Locale files are imported statically
- **Caching** - Language preferences are cached in localStorage
- **Minimal re-renders** - Language changes only update necessary components

## Future Enhancements

- **Dynamic locale loading** - Load languages on-demand
- **Pluralization support** - Enhanced number formatting
- **Date localization** - Culture-specific date formats
- **Currency formatting** - Localized currency display
