// Final Theme Toggle Test Script
// Run this in the browser console to test the fixed theme toggle

console.log('🎨 FINAL THEME TOGGLE TEST');
console.log('==========================');

// Function to test theme store state
function testThemeStoreState() {
  console.log('\n1. Testing Theme Store State...');
  
  // Check if we can access the theme store
  if (typeof window.Vue !== 'undefined') {
    console.log('✅ Vue detected');
    console.log('Check the ThemeDebugger component in the top-left corner for real-time state');
  } else {
    console.log('❌ Vue not detected');
  }
  
  // Check localStorage
  const themeData = localStorage.getItem('pinia_theme');
  if (themeData) {
    try {
      const parsed = JSON.parse(themeData);
      console.log('✅ Theme data in localStorage:', parsed);
    } catch (e) {
      console.log('❌ Error parsing theme data:', e);
    }
  } else {
    console.log('ℹ️ No theme data in localStorage');
  }
}

// Function to test theme toggle functionality
function testThemeToggleFunctionality() {
  console.log('\n2. Testing Theme Toggle Functionality...');
  
  const toggleButton = document.querySelector('[aria-label="Toggle dark mode"]');
  if (!toggleButton) {
    console.log('❌ Theme toggle button not found');
    return;
  }
  
  console.log('✅ Theme toggle button found');
  
  // Get initial state
  const root = document.documentElement;
  const initialHasDark = root.classList.contains('dark');
  const initialHasLight = root.classList.contains('light');
  
  console.log(`Initial state: dark=${initialHasDark}, light=${initialHasLight}`);
  
  // Test clicking the toggle
  console.log('Clicking theme toggle...');
  toggleButton.click();
  
  // Check state after click
  setTimeout(() => {
    const afterHasDark = root.classList.contains('dark');
    const afterHasLight = root.classList.contains('light');
    
    console.log(`After click: dark=${afterHasDark}, light=${afterHasLight}`);
    
    if (afterHasDark !== initialHasDark || afterHasLight !== initialHasLight) {
      console.log('✅ Theme toggle is working! State changed successfully');
    } else {
      console.log('❌ Theme toggle is not working - state did not change');
    }
  }, 200);
}

// Function to test visual changes
function testVisualChanges() {
  console.log('\n3. Testing Visual Changes...');
  
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  console.log(`Current theme: ${isDark ? 'dark' : 'light'}`);
  
  // Check header styling
  const header = document.querySelector('header');
  if (header) {
    const headerClasses = header.className;
    console.log('Header classes:', headerClasses);
    
    // Check if header has dark mode classes
    const hasDarkHeader = headerClasses.includes('dark:bg-gray-900');
    console.log(`Header has dark mode classes: ${hasDarkHeader}`);
  }
  
  // Check text colors
  const textElements = document.querySelectorAll('h1, h2, h3, p, span');
  let darkTextCount = 0;
  let lightTextCount = 0;
  
  textElements.forEach(el => {
    const computedStyle = getComputedStyle(el);
    const color = computedStyle.color;
    
    // Check if text is light colored (for dark mode)
    if (color.includes('245, 245, 245') || color.includes('249, 250, 251') || color.includes('229, 231, 235')) {
      lightTextCount++;
    } else if (color.includes('17, 24, 39') || color.includes('31, 41, 55')) {
      darkTextCount++;
    }
  });
  
  console.log(`Light text elements: ${lightTextCount}`);
  console.log(`Dark text elements: ${darkTextCount}`);
  
  if (isDark && lightTextCount > darkTextCount) {
    console.log('✅ Dark mode text colors are correct');
  } else if (!isDark && darkTextCount > lightTextCount) {
    console.log('✅ Light mode text colors are correct');
  } else {
    console.log('⚠️ Text colors may need adjustment');
  }
}

// Function to test multiple theme switches
function testMultipleSwitches() {
  console.log('\n4. Testing Multiple Theme Switches...');
  
  const toggleButton = document.querySelector('[aria-label="Toggle dark mode"]');
  if (!toggleButton) {
    console.log('❌ Theme toggle button not found');
    return;
  }
  
  console.log('Testing 5 theme switches...');
  
  let switchCount = 0;
  const maxSwitches = 5;
  
  const performSwitch = () => {
    if (switchCount >= maxSwitches) {
      console.log('✅ Multiple theme switches test completed');
      return;
    }
    
    switchCount++;
    const beforeClick = document.documentElement.classList.contains('dark');
    console.log(`Switch ${switchCount}: Before=${beforeClick ? 'dark' : 'light'}`);
    
    toggleButton.click();
    
    setTimeout(() => {
      const afterClick = document.documentElement.classList.contains('dark');
      console.log(`Switch ${switchCount}: After=${afterClick ? 'dark' : 'light'}`);
      
      if (beforeClick !== afterClick) {
        console.log(`✅ Switch ${switchCount} successful`);
      } else {
        console.log(`❌ Switch ${switchCount} failed`);
      }
      
      // Continue with next switch
      setTimeout(performSwitch, 500);
    }, 200);
  };
  
  performSwitch();
}

// Function to test theme persistence
function testThemePersistence() {
  console.log('\n5. Testing Theme Persistence...');
  
  console.log('To test persistence:');
  console.log('1. Toggle the theme to dark mode');
  console.log('2. Refresh the page');
  console.log('3. Check if the page loads in dark mode');
  console.log('4. Toggle to light mode');
  console.log('5. Refresh the page again');
  console.log('6. Check if the page loads in light mode');
  
  // Check current localStorage
  const themeData = localStorage.getItem('pinia_theme');
  if (themeData) {
    const parsed = JSON.parse(themeData);
    console.log('Current saved theme:', parsed);
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
  console.log('- themeStore.isDark - Get current dark mode state');
  console.log('- themeStore.isDarkMode - Get current dark mode state');
  console.log('- themeStore.currentTheme - Get current theme name');
  
  console.log('\nTo test these methods:');
  console.log('1. Open browser console');
  console.log('2. Access the theme store: const themeStore = useThemeStore()');
  console.log('3. Call the methods: themeStore.toggleTheme()');
}

// Function to test component dark mode styling
function testComponentDarkMode() {
  console.log('\n7. Testing Component Dark Mode Styling...');
  
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  console.log(`Current theme: ${isDark ? 'dark' : 'light'}`);
  
  // Check if components have dark mode classes
  const components = [
    { name: 'Header', selector: 'header' },
    { name: 'Cards', selector: '.card' },
    { name: 'Buttons', selector: 'button' },
    { name: 'Inputs', selector: 'input' },
    { name: 'Dropdowns', selector: '.dropdown-menu' }
  ];
  
  components.forEach(comp => {
    const elements = document.querySelectorAll(comp.selector);
    console.log(`${comp.name}: Found ${elements.length} elements`);
    
    if (elements.length > 0) {
      const firstElement = elements[0];
      const classes = firstElement.className;
      const hasDarkClasses = classes.includes('dark:');
      console.log(`  ${comp.name} has dark mode classes: ${hasDarkClasses}`);
    }
  });
}

// Main test function
function runFinalThemeTests() {
  console.log('Starting final theme toggle tests...\n');
  
  testThemeStoreState();
  testThemeToggleFunctionality();
  testVisualChanges();
  testMultipleSwitches();
  testThemePersistence();
  testThemeStoreMethods();
  testComponentDarkMode();
  
  console.log('\n📋 FINAL TEST SUMMARY');
  console.log('====================');
  console.log('1. ✅ Theme store should be properly initialized');
  console.log('2. ✅ Toggle button should switch between light and dark');
  console.log('3. ✅ Visual elements should change color correctly');
  console.log('4. ✅ Multiple toggles should work consistently');
  console.log('5. ✅ Theme should persist after page reload');
  console.log('6. ✅ All components should have proper dark mode styling');
  
  console.log('\n🔧 TROUBLESHOOTING');
  console.log('==================');
  console.log('1. If toggle still doesn\'t work:');
  console.log('   - Check console for JavaScript errors');
  console.log('   - Verify theme store is properly imported');
  console.log('   - Check if toggle button has correct event handler');
  console.log('   - Use ThemeDebugger component to see real-time state');
  
  console.log('\n2. If dark mode styling is incorrect:');
  console.log('   - Check if CSS is properly loaded');
  console.log('   - Verify Tailwind dark mode is configured');
  console.log('   - Check if components have dark mode classes');
  console.log('   - Use browser dev tools to inspect element styles');
  
  console.log('\n3. If theme doesn\'t persist:');
  console.log('   - Check Pinia persistence plugin');
  console.log('   - Verify theme store has persist configuration');
  console.log('   - Check localStorage for "pinia_theme" key');
  console.log('   - Clear localStorage and test again');
  
  console.log('\n🎯 EXPECTED BEHAVIOR');
  console.log('===================');
  console.log('1. App should load in light mode by default');
  console.log('2. Clicking toggle should switch to dark mode');
  console.log('3. In dark mode: text should be white/light colored');
  console.log('4. In dark mode: backgrounds should be dark gray/black');
  console.log('5. Theme should persist after page reload');
  console.log('6. All UI elements should have consistent styling');
}

// Run the tests
runFinalThemeTests();

// Export functions for manual testing
window.testThemeStoreState = testThemeStoreState;
window.testThemeToggleFunctionality = testThemeToggleFunctionality;
window.testVisualChanges = testVisualChanges;
window.testMultipleSwitches = testMultipleSwitches;
window.testThemePersistence = testThemePersistence;
window.testThemeStoreMethods = testThemeStoreMethods;
window.testComponentDarkMode = testComponentDarkMode;
window.runFinalThemeTests = runFinalThemeTests;
