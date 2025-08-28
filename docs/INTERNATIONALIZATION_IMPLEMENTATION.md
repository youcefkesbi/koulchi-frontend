# Internationalization (i18n) Implementation

This document describes the complete internationalization implementation in the Koulchi frontend application.

## Overview

The application now supports three languages:
- **English (en)** - Default fallback language
- **Arabic (ar)** - Primary language with RTL support
- **French (fr)** - Secondary language

## Features Implemented

### 1. Language Switching
- **Language Switcher Component**: Dropdown with flag icons and language names
- **Persistent Storage**: Language preference saved in localStorage
- **No Page Reloads**: Smooth language switching using Vue Router
- **Default Language**: Arabic (ar) as the primary language

### 2. RTL Layout Support
- **Automatic RTL**: Applied when Arabic is selected
- **CSS Classes**: RTL-specific utility classes for margins, paddings, and positioning
- **Flexbox Support**: Proper space-x and space-x-reverse handling
- **Icon Positioning**: Automatic icon flipping for RTL layouts

### 3. Translation Coverage
All static UI text has been translated:

#### Core Components
- **Header**: Navigation, brand name, contact info
- **Footer**: Links, contact information, brand details
- **Dashboard**: All sections, tabs, and descriptions
- **Store Management**: Complete CRUD operations
- **Product Forms**: All labels, placeholders, and help text

#### Navigation & UI
- **Buttons**: Save, cancel, next, back, etc.
- **Messages**: Success, error, loading states
- **Placeholders**: Form inputs, search fields
- **Help Text**: Tooltips and guidance messages

### 4. Dynamic Content Handling
- **Database Content**: Products, categories, store names remain untranslated
- **User-Generated Content**: Store descriptions, product names display as stored
- **Mixed Content**: Proper text direction for mixed language content

## Technical Implementation

### 1. i18n Configuration (`src/i18n.js`)
```javascript
const i18n = createI18n({
  legacy: false,
  locale: defaultLocale, // 'ar'
  fallbackLocale: 'en',
  messages: { en, fr, ar },
  numberFormats: { /* DZD currency formatting */ },
  datetimeFormats: { /* Date formatting */ }
})
```

### 2. RTL Support (`src/assets/rtl.css`)
- **Directional Classes**: Automatic margin/padding flipping
- **Flexbox Utilities**: Space-x handling for RTL
- **Position Classes**: Left/right positioning adjustments
- **Transform Support**: Icon flipping and layout adjustments

### 3. App-Level RTL (`src/App.vue`)
```vue
<template>
  <div :dir="currentDir" :lang="currentLocale">
    <!-- Content -->
  </div>
</template>

<script>
const currentDir = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')
const currentLocale = computed(() => locale.value === 'ar' ? 'ar-DZ' : 'en-US')
</script>
```

### 4. Language Switcher (`src/components/LanguageSwitcher.vue`)
- **Flag Icons**: Visual language representation
- **Dropdown Menu**: Easy language selection
- **Click Outside**: Proper event handling
- **Local Storage**: Persistent language preference

## Translation Files Structure

### 1. English (`locales/en.json`)
- Complete translation set
- Reference for other languages
- 400+ translation keys

### 2. Arabic (`locales/ar.json`)
- Full Arabic translations
- RTL-optimized text
- Cultural adaptations

### 3. French (`locales/fr.json`)
- Complete French translations
- European French conventions
- Proper terminology

## Key Translation Categories

### 1. Navigation & Header
```json
{
  "header": {
    "brandName": "Koulchi",
    "brandNameAr": "كولشي",
    "contactPhone": "+213 123 456 789",
    "contactEmail": "info@koulchi.dz"
  }
}
```

### 2. Dashboard & User Interface
```json
{
  "dashboard": {
    "buyingSection": "Buying",
    "sellingSection": "Selling",
    "buyingDescription": "Track your orders...",
    "sellingDescription": "Manage your products..."
  }
}
```

### 3. Store Management
```json
{
  "stores": {
    "createStore": "Create Store",
    "manageStores": "Manage Your Stores",
    "storeName": "Store Name",
    "storeDescription": "Store Description"
  }
}
```

### 4. Common Actions
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "next": "Next",
    "back": "Back"
  }
}
```

## RTL Layout Features

### 1. Automatic Direction Switching
- **CSS Selectors**: `[dir="rtl"]` targeting
- **Utility Classes**: Tailwind CSS RTL variants
- **Component Props**: Dynamic direction binding

### 2. Spacing & Positioning
- **Margins**: `ml-*` → `mr-*` in RTL
- **Padding**: `pl-*` → `pr-*` in RTL
- **Flexbox**: `space-x-*` automatic reversal
- **Positioning**: `left-*` → `right-*` in RTL

### 3. Icon & Text Handling
- **Icon Flipping**: Automatic scaleX(-1) for RTL
- **Text Direction**: Mixed content support
- **Alignment**: Right-aligned text in RTL

## Usage Examples

### 1. Basic Translation
```vue
<template>
  <h1>{{ $t('dashboard.userDashboard') }}</h1>
  <p>{{ $t('dashboard.welcomeMessage', { name: userName }) }}</p>
</template>
```

### 2. Conditional RTL Classes
```vue
<template>
  <div class="flex items-center space-x-4 space-x-reverse">
    <span>{{ $t('common.next') }}</span>
    <i class="fas fa-arrow-right icon-rtl"></i>
  </div>
</template>
```

### 3. Dynamic Language Switching
```javascript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const switchLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
```

## Best Practices Implemented

### 1. Translation Keys
- **Consistent Naming**: `component.section.element` format
- **Descriptive Keys**: Clear, meaningful key names
- **Hierarchical Structure**: Logical grouping of translations

### 2. RTL Considerations
- **Flexible Layouts**: CSS Grid and Flexbox for adaptability
- **Icon Handling**: Automatic flipping for directional icons
- **Text Direction**: Proper mixed content handling

### 3. Performance
- **Lazy Loading**: Dynamic imports for language files
- **Caching**: LocalStorage for language preference
- **Efficient Updates**: Reactive language switching

## Testing & Validation

### 1. Language Switching
- ✅ All three languages load correctly
- ✅ Language preference persists across sessions
- ✅ No page reloads during language switching

### 2. RTL Layout
- ✅ Arabic text displays correctly
- ✅ Layout adapts to RTL direction
- ✅ Icons and spacing work in both directions

### 3. Content Display
- ✅ Static text translates properly
- ✅ Dynamic content remains untranslated
- ✅ Mixed language content handled correctly

## Future Enhancements

### 1. Additional Languages
- **Spanish (es)**: For broader market reach
- **German (de)**: European market expansion
- **Chinese (zh)**: Asian market entry

### 2. Advanced Features
- **Auto-Detection**: Browser language detection
- **Regional Variants**: Algerian Arabic, Canadian French
- **Translation Memory**: User preference learning

### 3. Content Management
- **Admin Panel**: Translation management interface
- **Version Control**: Translation history tracking
- **Quality Assurance**: Translation validation tools

## Conclusion

The internationalization implementation provides:
- **Complete Language Support**: English, Arabic, and French
- **RTL Layout**: Full Arabic language support
- **User Experience**: Seamless language switching
- **Maintainability**: Organized translation structure
- **Scalability**: Easy addition of new languages

The application now serves a truly international audience with proper cultural and linguistic adaptations.
