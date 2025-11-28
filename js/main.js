/**
 * DrillMaster - Main Application Entry Point
 * Phase 1: Anki Deck Generator
 */

import { AppController } from './controllers/AppController.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DrillMaster initializing...');
  
  const app = new AppController();
  app.initialize().catch(error => {
    console.error('Failed to initialize application:', error);
    showError('Failed to load application. Please refresh the page.');
  });
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showError('An unexpected error occurred. Please check the console for details.');
});

// Helper function to show errors
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}
