/**
 * Pinia plugin for persisting store state to localStorage
 * @param {Object} context - Pinia plugin context
 */
export function piniaPersist(context) {
  const { store } = context;
  
  // Only process stores that have persist option
  if (!store.$state.persist) return;
  
  const storageKey = `pinia_${store.$id}`;
  
  // Load saved state from localStorage
  const savedState = localStorage.getItem(storageKey);
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      store.$patch(parsed);
    } catch (e) {
      console.error(`Failed to load state for ${store.$id}:`, e);
    }
  }
  
  // Subscribe to store changes
  store.$subscribe((mutation, state) => {
    // Only save the specified paths or all state if no paths specified
    const stateToSave = {};
    const paths = store.persist.paths || Object.keys(state);
    
    paths.forEach((path) => {
      stateToSave[path] = state[path];
    });
    
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  });
  
  // Add a reset method to clear persisted state
  store.$reset = () => {
    localStorage.removeItem(storageKey);
    store.$state = JSON.parse(JSON.stringify(store.$state));
  };
}

export default piniaPersist;
