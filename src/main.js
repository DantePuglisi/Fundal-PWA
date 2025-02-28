import { renderAppSelectionScreen } from './screens/appSelectionScreen.js';
import { renderParameterScreen } from './screens/parameterScreen.js';
import { renderResultsScreen } from './screens/resultsScreen.js';

// State management
const appState = {
  selectedApplication: '',
  powerValue: '',
  powerUnit: 'hp', // Default to HP
  serviceFactor: '',
  engineShaftSize: '',
  machineShaftSize: '',
  rpm: ''
};

// Initialize service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  
  // Render the first screen (Application Selection)
  await renderAppSelectionScreen(app, appState, showParameterScreen);
  
  // Navigation functions
  function showParameterScreen() {
    renderParameterScreen(app, appState, showResultsScreen, showAppSelectionScreen);
  }
  
  async function showResultsScreen() {
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <p>Calculando recomendaciones...</p>
    `;
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '0';
    loadingIndicator.style.left = '0';
    loadingIndicator.style.width = '100%';
    loadingIndicator.style.height = '100%';
    loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.flexDirection = 'column';
    loadingIndicator.style.alignItems = 'center';
    loadingIndicator.style.justifyContent = 'center';
    loadingIndicator.style.zIndex = '1000';
    
    app.appendChild(loadingIndicator);
    
    // Use setTimeout to allow browser to render loading indicator before heavy computation
    setTimeout(async () => {
      await renderResultsScreen(app, appState, showParameterScreen);
      
      // Remove loading indicator
      if (app.contains(loadingIndicator)) {
        app.removeChild(loadingIndicator);
      }
    }, 10);
  }
  
  async function showAppSelectionScreen() {
    await renderAppSelectionScreen(app, appState, showParameterScreen);
  }
});