// Dark Mode Testing Script
// Run this in the browser console to test dark mode functionality

console.log('🌙 DARK MODE TESTING SCRIPT');
console.log('============================');

// Function to test theme toggle
function testThemeToggle() {
  console.log('\n1. Testing Theme Toggle...');
  
  // Check if theme toggle exists
  const themeToggle = document.querySelector('[aria-label="Toggle dark mode"]');
  if (themeToggle) {
    console.log('✅ Theme toggle found');
    
    // Test clicking the toggle
    console.log('Clicking theme toggle...');
    themeToggle.click();
    
    // Check if dark class was added/removed
    setTimeout(() => {
      const isDark = document.documentElement.classList.contains('dark');
      console.log(`Theme after toggle: ${isDark ? 'dark' : 'light'}`);
    }, 100);
  } else {
    console.log('❌ Theme toggle not found');
  }
}

// Function to test theme persistence
function testThemePersistence() {
  console.log('\n2. Testing Theme Persistence...');
  
  // Check localStorage
  const savedTheme = localStorage.getItem('pinia_theme');
  if (savedTheme) {
    console.log('✅ Theme saved in localStorage:', savedTheme);
    try {
      const parsed = JSON.parse(savedTheme);
      console.log('Parsed theme data:', parsed);
    } catch (e) {
      console.log('❌ Error parsing theme data:', e);
    }
  } else {
    console.log('❌ No theme data in localStorage');
  }
}

// Function to test theme classes
function testThemeClasses() {
  console.log('\n3. Testing Theme Classes...');
  
  const root = document.documentElement;
  const hasDarkClass = root.classList.contains('dark');
  const hasLightClass = root.classList.contains('light');
  
  console.log(`Root element classes: ${root.className}`);
  console.log(`Has dark class: ${hasDarkClass}`);
  console.log(`Has light class: ${hasLightClass}`);
  
  // Check if theme is applied correctly
  const computedStyle = getComputedStyle(root);
  console.log('Current theme applied:', hasDarkClass ? 'dark' : 'light');
}

// Function to test theme store
function testThemeStore() {
  console.log('\n4. Testing Theme Store...');
  
  // Check if Vue and Pinia are available
  if (typeof window.Vue !== 'undefined') {
    console.log('✅ Vue detected');
    console.log('To test theme store, use the ThemeTest component in the bottom-left corner');
  } else {
    console.log('❌ Vue not detected');
  }
}

// Function to test system preference detection
function testSystemPreference() {
  console.log('\n5. Testing System Preference...');
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  console.log(`System prefers dark mode: ${prefersDark}`);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    console.log(`System theme changed to: ${e.matches ? 'dark' : 'light'}`);
  });
}

// Function to test component dark mode styles
function testComponentStyles() {
  console.log('\n6. Testing Component Styles...');
  
  // Check header dark mode
  const header = document.querySelector('header');
  if (header) {
    const hasDarkBg = header.classList.contains('dark:bg-gray-900');
    console.log(`Header has dark mode classes: ${hasDarkBg}`);
  }
  
  // Check if cards have dark mode classes
  const cards = document.querySelectorAll('.card');
  console.log(`Found ${cards.length} cards with dark mode support`);
  
  // Check if text has dark mode classes
  const textElements = document.querySelectorAll('[class*="dark:text-"]');
  console.log(`Found ${textElements.length} text elements with dark mode classes`);
}

// Function to test theme switching
function testThemeSwitching() {
  console.log('\n7. Testing Theme Switching...');
  
  const root = document.documentElement;
  const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
  
  console.log(`Current theme: ${currentTheme}`);
  
  // Toggle theme
  if (currentTheme === 'light') {
    root.classList.add('dark');
    root.classList.remove('light');
    console.log('Switched to dark mode');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    console.log('Switched to light mode');
  }
  
  // Check if change was applied
  setTimeout(() => {
    const newTheme = root.classList.contains('dark') ? 'dark' : 'light';
    console.log(`New theme: ${newTheme}`);
  }, 100);
}

// Main testing function
function runDarkModeTests() {
  console.log('Starting dark mode tests...\n');
  
  testThemeToggle();
  testThemePersistence();
  testThemeClasses();
  testThemeStore();
  testSystemPreference();
  testComponentStyles();
  testThemeSwitching();
  
  console.log('\n📋 TESTING SUMMARY');
  console.log('==================');
  console.log('1. Check the ThemeTest component in the bottom-left corner');
  console.log('2. Use the theme toggle in the header (next to language switcher)');
  console.log('3. Test theme persistence by refreshing the page');
  console.log('4. Check console logs for theme changes');
  console.log('5. Verify that UI elements change color instantly');
  
  console.log('\n🔧 TROUBLESHOOTING');
  console.log('==================');
  console.log('1. If theme toggle not working:');
  console.log('   - Check if ThemeToggle component is imported in Header.vue');
  console.log('   - Verify theme store is initialized in main.js');
  console.log('   - Check console for any JavaScript errors');
  
  console.log('\n2. If theme not persisting:');
  console.log('   - Check localStorage for "pinia_theme" key');
  console.log('   - Verify Pinia persistence plugin is working');
  console.log('   - Check if theme store has persist configuration');
  
  console.log('\n3. If styles not updating:');
  console.log('   - Check if dark mode CSS classes are applied');
  console.log('   - Verify Tailwind dark mode is configured');
  console.log('   - Check if components have dark mode classes');
}

// Run the tests
runDarkModeTests();

// Export functions for manual testing
window.testThemeToggle = testThemeToggle;
window.testThemePersistence = testThemePersistence;
window.testThemeClasses = testThemeClasses;
window.testThemeStore = testThemeStore;
window.testSystemPreference = testSystemPreference;
window.testComponentStyles = testComponentStyles;
window.testThemeSwitching = testThemeSwitching;
window.runDarkModeTests = runDarkModeTests;
