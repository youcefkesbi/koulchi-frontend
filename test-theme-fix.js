// Theme Toggle Fix Test Script
// Run this in the browser console to test the fixed theme toggle

console.log('🎨 THEME TOGGLE FIX TEST');
console.log('========================');

// Function to test theme initialization
function testThemeInitialization() {
  console.log('\n1. Testing Theme Initialization...');
  
  // Check if theme store is working
  if (typeof window.Vue !== 'undefined') {
    console.log('✅ Vue detected');
    console.log('Check the ThemeTest component in the bottom-left corner for theme status');
  } else {
    console.log('❌ Vue not detected');
  }
  
  // Check localStorage for theme data
  const themeData = localStorage.getItem('pinia_theme');
  if (themeData) {
    try {
      const parsed = JSON.parse(themeData);
      console.log('✅ Theme data found in localStorage:', parsed);
    } catch (e) {
      console.log('❌ Error parsing theme data:', e);
    }
  } else {
    console.log('ℹ️ No theme data in localStorage (will default to light mode)');
  }
  
  // Check current theme classes
  const root = document.documentElement;
  const hasDarkClass = root.classList.contains('dark');
  const hasLightClass = root.classList.contains('light');
  
  console.log(`Current theme classes: dark=${hasDarkClass}, light=${hasLightClass}`);
  console.log(`Expected: Should start with light mode (no dark class)`);
}

// Function to test theme toggle functionality
function testThemeToggle() {
  console.log('\n2. Testing Theme Toggle Functionality...');
  
  // Find the theme toggle button
  const toggleButton = document.querySelector('[aria-label="Toggle dark mode"]');
  if (!toggleButton) {
    console.log('❌ Theme toggle button not found');
    return;
  }
  
  console.log('✅ Theme toggle button found');
  
  // Get initial state
  const root = document.documentElement;
  const initialIsDark = root.classList.contains('dark');
  console.log(`Initial state: ${initialIsDark ? 'dark' : 'light'}`);
  
  // Test clicking the toggle
  console.log('Clicking theme toggle...');
  toggleButton.click();
  
  // Check state after click
  setTimeout(() => {
    const afterClickIsDark = root.classList.contains('dark');
    console.log(`After click: ${afterClickIsDark ? 'dark' : 'light'}`);
    
    if (afterClickIsDark !== initialIsDark) {
      console.log('✅ Theme toggle is working!');
    } else {
      console.log('❌ Theme toggle is not working - state did not change');
    }
  }, 100);
}

// Function to test theme persistence
function testThemePersistence() {
  console.log('\n3. Testing Theme Persistence...');
  
  // Check if theme persists after page reload
  console.log('To test persistence:');
  console.log('1. Toggle the theme');
  console.log('2. Refresh the page');
  console.log('3. Check if the theme is maintained');
  
  // Check current localStorage
  const themeData = localStorage.getItem('pinia_theme');
  if (themeData) {
    console.log('Current theme data:', JSON.parse(themeData));
  }
}

// Function to test visual changes
function testVisualChanges() {
  console.log('\n4. Testing Visual Changes...');
  
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  console.log(`Current theme: ${isDark ? 'dark' : 'light'}`);
  
  // Check header styling
  const header = document.querySelector('header');
  if (header) {
    const headerClasses = header.className;
    const hasDarkHeader = headerClasses.includes('dark:bg-gray-900');
    console.log(`Header has dark mode classes: ${hasDarkHeader}`);
  }
  
  // Check if cards have dark mode styling
  const cards = document.querySelectorAll('.card');
  console.log(`Found ${cards.length} cards`);
  
  // Check if text elements have dark mode classes
  const textElements = document.querySelectorAll('[class*="dark:text-"]');
  console.log(`Found ${textElements.length} text elements with dark mode classes`);
}

// Function to test theme switching multiple times
function testMultipleSwitches() {
  console.log('\n5. Testing Multiple Theme Switches...');
  
  const toggleButton = document.querySelector('[aria-label="Toggle dark mode"]');
  if (!toggleButton) {
    console.log('❌ Theme toggle button not found');
    return;
  }
  
  console.log('Testing multiple theme switches...');
  
  // Test 3 switches
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      console.log(`Switch ${i + 1}:`);
      const beforeClick = document.documentElement.classList.contains('dark');
      console.log(`  Before: ${beforeClick ? 'dark' : 'light'}`);
      
      toggleButton.click();
      
      setTimeout(() => {
        const afterClick = document.documentElement.classList.contains('dark');
        console.log(`  After: ${afterClick ? 'dark' : 'light'}`);
        console.log(`  Success: ${beforeClick !== afterClick ? '✅' : '❌'}`);
      }, 100);
    }, i * 500);
  }
}

// Function to test theme store methods
function testThemeStoreMethods() {
  console.log('\n6. Testing Theme Store Methods...');
  
  console.log('Available theme store methods:');
  console.log('- themeStore.toggleTheme() - Toggle between light and dark');
  console.log('- themeStore.setTheme("light") - Set to light mode');
  console.log('- themeStore.setTheme("dark") - Set to dark mode');
  console.log('- themeStore.setTheme("system") - Follow system preference');
  
  console.log('\nTo test these methods:');
  console.log('1. Open browser console');
  console.log('2. Access the theme store: const themeStore = useThemeStore()');
  console.log('3. Call the methods: themeStore.toggleTheme()');
}

// Main test function
function runThemeFixTests() {
  console.log('Starting theme toggle fix tests...\n');
  
  testThemeInitialization();
  testThemeToggle();
  testThemePersistence();
  testVisualChanges();
  testMultipleSwitches();
  testThemeStoreMethods();
  
  console.log('\n📋 TESTING SUMMARY');
  console.log('==================');
  console.log('1. ✅ Theme should default to light mode');
  console.log('2. ✅ Toggle should switch between light and dark');
  console.log('3. ✅ Theme should persist after page reload');
  console.log('4. ✅ Visual elements should change color');
  console.log('5. ✅ Multiple toggles should work correctly');
  
  console.log('\n🔧 TROUBLESHOOTING');
  console.log('==================');
  console.log('1. If theme defaults to dark:');
  console.log('   - Clear localStorage: localStorage.clear()');
  console.log('   - Refresh the page');
  console.log('   - Check theme store initialization');
  
  console.log('\n2. If toggle doesn\'t work:');
  console.log('   - Check console for JavaScript errors');
  console.log('   - Verify theme store is properly imported');
  console.log('   - Check if toggle button has correct event handler');
  
  console.log('\n3. If theme doesn\'t persist:');
  console.log('   - Check Pinia persistence plugin');
  console.log('   - Verify theme store has persist configuration');
  console.log('   - Check localStorage for "pinia_theme" key');
  
  console.log('\n4. If visual changes are missing:');
  console.log('   - Check if components have dark mode classes');
  console.log('   - Verify Tailwind dark mode is configured');
  console.log('   - Check if CSS is properly loaded');
}

// Run the tests
runThemeFixTests();

// Export functions for manual testing
window.testThemeInitialization = testThemeInitialization;
window.testThemeToggle = testThemeToggle;
window.testThemePersistence = testThemePersistence;
window.testVisualChanges = testVisualChanges;
window.testMultipleSwitches = testMultipleSwitches;
window.testThemeStoreMethods = testThemeStoreMethods;
window.runThemeFixTests = runThemeFixTests;
