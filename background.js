/**
 * OpenDyslexic Chrome Extension - Background Service Worker
 * Handles script injection on activeTab permission
 */

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // This won't be called if there's a popup, but kept for reference
  console.log('Extension icon clicked');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectScripts') {
    injectScriptsIntoTab(message.tabId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

/**
 * Inject content scripts and styles into a tab
 */
async function injectScriptsIntoTab(tabId) {
  try {
    // First inject CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['content.css']
    });

    // Then inject JS
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });

    console.log('Scripts injected successfully into tab', tabId);
  } catch (error) {
    console.error('Error injecting scripts:', error);
    throw error;
  }
}
