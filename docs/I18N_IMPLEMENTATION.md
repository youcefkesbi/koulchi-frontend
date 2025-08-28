# Internationalization (i18n) Implementation

This guide explains how internationalization is implemented in the Koulchi Frontend application.

## Overview

The application supports multiple languages:
- English (en) - Default
- Arabic (ar) - RTL support
- French (fr)

## Implementation

### 1. i18n Configuration

The i18n system is configured in `src/i18n.js`:
- Vue I18n plugin integration
- Language detection and switching
- RTL support for Arabic

### 2. Language Files

Translation files are located in `src/locales/`:
- `en.json` - English translations
- `ar.json` - Arabic translations
- `fr.json` - French translations

### 3. Language Switching

Users can switch languages using the `LanguageSwitcher` component:
- Dropdown menu in the header
- Persistent language selection
- Automatic RTL detection for Arabic

### 4. RTL Support

Arabic language includes RTL support:
- CSS classes for RTL layout
- Text direction handling
- Layout adjustments

## Usage

### In Components

```vue
<template>
  <div>{{ $t('welcome_message') }}</div>
</template>

<script>
export default {
  name: 'MyComponent'
}
</script>
```

### In JavaScript

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = t('welcome_message')
```

## Adding New Languages

1. Create new language file in `src/locales/`
2. Add language to i18n configuration
3. Update language switcher component
4. Test translations and RTL support if needed

## Best Practices

- Use translation keys instead of hardcoded text
- Keep translation keys descriptive and organized
- Test all languages during development
- Consider text length differences between languages
